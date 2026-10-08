/**
 * Where tapping a push notification lands: the notification's link plus
 * `n=<id>` so AppLayout can mark it read. Mirrored in
 * functions/src/pushLogic.ts — keep the two in sync.
 */
export function buildClickUrl(link: string, id: string): string {
  const base = link || '/home'
  return `${base}${base.includes('?') ? '&' : '?'}n=${encodeURIComponent(id)}`
}
