// Pure helpers for the push pipeline — no Firebase imports, so they unit-test cleanly.

export interface PushRecipient {
  status?: string
  mutedNotificationCategories?: string[]
}

export interface NotificationLike {
  title: string
  message: string
  link?: string
  type: string
}

export interface SendResponseLike {
  success: boolean
  error?: { code: string }
}

const BADGE_CAP = 99

// FCM error codes meaning the token will never work again — safe to delete.
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
])

export function shouldSend(user: PushRecipient | undefined, type: string): boolean {
  if (!user) return false
  if (user.status === 'deactivated') return false
  if (user.mutedNotificationCategories?.includes(type)) return false
  return true
}

/** Badge = unread notifications whose category isn't muted, capped at 99. */
export function computeBadge(unreadTypes: string[], muted: string[]): number {
  const count = unreadTypes.filter((t) => !muted.includes(t)).length
  return Math.min(count, BADGE_CAP)
}

export function deadTokens(tokens: string[], responses: SendResponseLike[]): string[] {
  return tokens.filter((_, i) => {
    const r = responses[i]
    return r && !r.success && !!r.error && DEAD_TOKEN_CODES.has(r.error.code)
  })
}

/** FCM data payload. Every value must be a string. */
export function buildPayload(n: NotificationLike, id: string, badge: number): Record<string, string> {
  const link = n.link || '/home'
  return {
    title: n.title || 'Kiwi Church',
    body: n.message || '',
    link,
    notificationId: id,
    type: n.type,
    badge: String(badge),
    // DMs collapse per conversation so a burst of messages is one updating notification.
    tag: n.type === 'direct_message' ? `dm:${link}` : `n:${id}`,
  }
}

/** Mirror of src/utils/pushClickUrl.ts (the service worker's copy). Keep in sync. */
export function buildClickUrl(link: string, id: string): string {
  const base = link || '/home'
  return `${base}${base.includes('?') ? '&' : '?'}n=${encodeURIComponent(id)}`
}
