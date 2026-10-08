import { describe, it, expect } from 'vitest'
import { computeBadge, BADGE_QUERY_LIMIT } from './badge'

describe('computeBadge (client copy of the push function formula)', () => {
  it('counts past the live feed cap of 20 (review finding: badge dropped 35 → 20 on open)', () => {
    expect(computeBadge(Array(35).fill('comment'), [])).toBe(35)
  })
  it('filters muted types before capping', () => {
    expect(computeBadge([...Array(120).fill('comment'), 'mention'], ['comment'])).toBe(1)
  })
  it('caps at 99 and is 0 with nothing unread', () => {
    expect(computeBadge(Array(150).fill('comment'), [])).toBe(99)
    expect(computeBadge([], [])).toBe(0)
  })
  it('reads as many unread docs as the function does', () => {
    expect(BADGE_QUERY_LIMIT).toBe(200)
  })
})
