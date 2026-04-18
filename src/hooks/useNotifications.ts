import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { dbService } from '@/services/firebase'
import { showNotification } from '@/utils/webNotifications'
import type { Notification } from '@/types'

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: string) => [...notificationKeys.all, userId] as const,
  unread: (userId: string) => [...notificationKeys.user(userId), 'unread'] as const
}

// Get user notifications
export function useNotifications(userId: string | null, options: { unreadOnly?: boolean; limit?: number } = {}) {
  return useQuery({
    queryKey: options.unreadOnly
      ? notificationKeys.unread(userId || '')
      : notificationKeys.user(userId || ''),
    queryFn: () => dbService.getUserNotifications(userId!, options),
    enabled: !!userId
  })
}

// Subscribe to real-time notifications
export function useNotificationsSubscription(userId: string | null) {
  const queryClient = useQueryClient()
  const prevIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return

    const unsubscribe = dbService.subscribeToNotifications(userId, (notifications: Notification[]) => {
      queryClient.setQueryData(notificationKeys.unread(userId), notifications)

      for (const notif of notifications) {
        if (!prevIdsRef.current.has(notif.id) && !notif.read) {
          showNotification(notif.title, {
            body: notif.message,
            tag: notif.id,
            data: { link: notif.link },
          })
        }
      }
      prevIdsRef.current = new Set(notifications.map(n => n.id))
    })

    return unsubscribe
  }, [userId, queryClient])
}

// Get unread notification count
export function useUnreadNotificationCount(userId: string | null) {
  const { data: notifications } = useNotifications(userId, { unreadOnly: true, limit: 50 })
  return notifications?.length ?? 0
}

// Mark notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => dbService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => dbService.markAllNotificationsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}
