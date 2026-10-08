import { useEffect } from 'react'
import { useNotifications } from './useNotifications'
import { useUnreadMessageCount } from './useUnreadMessages'
import type { Notification } from '@/types'

/**
 * Mirrors unread activity onto the installed PWA's home-screen icon via the
 * Badging API (iOS 16.4+ home-screen apps, Chrome/Edge desktop + Android).
 * Count = unread notifications + unread conversations. DM notifications are
 * excluded so a new message isn't counted twice.
 *
 * Only updates while the app is open/backgrounded — a closed app can't change
 * its badge without server push (FCM), which is deferred.
 */
export function useAppBadge(userId: string | null, mutedCategories: Notification['type'][] = []) {
  const { data: notifications } = useNotifications(userId, { unreadOnly: true, limit: 50 })
  const unreadMessages = useUnreadMessageCount(userId)

  const unreadNotifications = (notifications ?? []).filter(
    (n) => n.type !== 'direct_message' && !mutedCategories.includes(n.type)
  ).length
  const total = userId ? unreadNotifications + unreadMessages : 0

  useEffect(() => {
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>
      clearAppBadge?: () => Promise<void>
    }
    if (!nav.setAppBadge || !nav.clearAppBadge) return
    // Badge calls reject when permission isn't granted — never let that surface.
    const op = total > 0 ? nav.setAppBadge(total) : nav.clearAppBadge()
    op.catch(() => {})
  }, [total])
}
