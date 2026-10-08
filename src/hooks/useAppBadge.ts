import { useEffect } from 'react'
import { useNotifications } from './useNotifications'
import type { Notification } from '@/types'

/**
 * Mirrors unread activity onto the installed PWA's home-screen icon via the
 * Badging API (iOS 16.4+ home-screen apps, Chrome/Edge desktop + Android).
 * Count = unread, non-muted notifications (capped at 99) — the SAME formula
 * the onNotificationCreated push function uses, so the badge set by a push
 * and the badge set by the open app never disagree. DM notifications clear
 * when their conversation is opened (markConversationRead).
 */
export function useAppBadge(userId: string | null, mutedCategories: Notification['type'][] = []) {
  const { data: notifications } = useNotifications(userId, { unreadOnly: true, limit: 50 })
  const unread = (notifications ?? []).filter((n) => !mutedCategories.includes(n.type)).length
  const total = userId ? Math.min(unread, 99) : 0

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
