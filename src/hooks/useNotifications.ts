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
export function useNotificationsSubscription(
  userId: string | null,
  mutedCategories: Notification['type'][] = []
) {
  const queryClient = useQueryClient()
  const prevIdsRef = useRef<Set<string>>(new Set())
  const mutedRef = useRef(mutedCategories)
  mutedRef.current = mutedCategories

  useEffect(() => {
    if (!userId) return

    const unsubscribe = dbService.subscribeToNotifications(userId, (notifications: Notification[]) => {
      queryClient.setQueryData(notificationKeys.unread(userId), notifications)
      queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) })

      for (const notif of notifications) {
        if (!prevIdsRef.current.has(notif.id) && !notif.read && !mutedRef.current.includes(notif.type)) {
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
export function useUnreadNotificationCount(
  userId: string | null,
  mutedCategories: Notification['type'][] = []
) {
  const { data: notifications } = useNotifications(userId, { unreadOnly: true, limit: 50 })
  if (!notifications) return 0
  if (mutedCategories.length === 0) return notifications.length
  return notifications.filter((n) => !mutedCategories.includes(n.type)).length
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
