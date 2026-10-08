import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dbService } from '@/services/firebase'
import { notificationKeys } from './useNotifications'
import { computeBadge, BADGE_QUERY_LIMIT } from '@/utils/badge'
import type { Notification } from '@/types'

/**
 * Mirrors unread activity onto the installed PWA's home-screen icon via the
 * Badging API (iOS 16.4+ home-screen apps, Chrome/Edge desktop + Android).
 * Count = unread, non-muted notifications (capped at 99) — the SAME formula
 * the onNotificationCreated push function uses, so the badge set by a push
 * and the badge set by the open app never disagree. DM notifications clear
 * when their conversation is opened (markConversationRead).
 *
 * Uses its own query (not the live feed, which is capped at 20) so it counts
 * as far as the function does. Keyed under notificationKeys.user so every
 * snapshot / mark-read invalidation refreshes it.
 */
export function useAppBadge(userId: string | null, mutedCategories: Notification['type'][] = []) {
  const { data: unread } = useQuery({
    queryKey: [...notificationKeys.user(userId || ''), 'badge'],
    queryFn: () => dbService.getUserNotifications(userId!, { unreadOnly: true, limit: BADGE_QUERY_LIMIT }),
    enabled: !!userId,
  })

  const total = userId ? computeBadge((unread ?? []).map((n) => n.type), mutedCategories) : 0

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
