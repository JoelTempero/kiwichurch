/**
 * App-icon badge formula — mirror of computeBadge in functions/src/pushLogic.ts
 * (the push function sets the badge from a closed app; the open app must agree).
 * Keep the two, and BADGE_QUERY_LIMIT vs the function's .limit(200), in sync.
 */
export const BADGE_QUERY_LIMIT = 200
const BADGE_CAP = 99

export function computeBadge(unreadTypes: string[], muted: string[]): number {
  return Math.min(unreadTypes.filter((t) => !muted.includes(t)).length, BADGE_CAP)
}
