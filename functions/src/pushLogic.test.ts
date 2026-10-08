import { describe, it, expect } from 'vitest'
import { shouldSend, computeBadge, deadTokens, buildPayload, buildClickUrl } from './pushLogic'

describe('shouldSend', () => {
  it('rejects a missing user', () => {
    expect(shouldSend(undefined, 'comment')).toBe(false)
  })
  it('rejects a deactivated user', () => {
    expect(shouldSend({ status: 'deactivated' }, 'comment')).toBe(false)
  })
  it('rejects a muted category', () => {
    expect(shouldSend({ mutedNotificationCategories: ['comment'] }, 'comment')).toBe(false)
  })
  it('sends for an active, unmuted user (status absent = active)', () => {
    expect(shouldSend({ mutedNotificationCategories: ['mention'] }, 'comment')).toBe(true)
    expect(shouldSend({ status: 'active' }, 'announcement')).toBe(true)
  })
})

describe('computeBadge', () => {
  it('is 0 with no unread', () => {
    expect(computeBadge([], [])).toBe(0)
  })
  it('excludes muted types', () => {
    expect(computeBadge(['comment', 'mention', 'comment'], ['comment'])).toBe(1)
  })
  it('is 0 when everything unread is muted', () => {
    expect(computeBadge(['comment'], ['comment'])).toBe(0)
  })
  it('caps at 99', () => {
    expect(computeBadge(Array(150).fill('comment'), [])).toBe(99)
  })
})

describe('deadTokens', () => {
  it('returns only tokens whose error says they are gone', () => {
    const tokens = ['a', 'b', 'c', 'd']
    const responses = [
      { success: true },
      { success: false, error: { code: 'messaging/registration-token-not-registered' } },
      { success: false, error: { code: 'messaging/internal-error' } },
      { success: false, error: { code: 'messaging/invalid-registration-token' } },
    ]
    expect(deadTokens(tokens, responses)).toEqual(['b', 'd'])
  })
})

describe('buildPayload', () => {
  it('tags DMs per conversation link and stringifies badge', () => {
    const p = buildPayload(
      { title: 'New message', message: 'hey', link: '/messages/x_y', type: 'direct_message' },
      'n1',
      3
    )
    expect(p).toEqual({
      title: 'New message',
      body: 'hey',
      link: '/messages/x_y',
      notificationId: 'n1',
      type: 'direct_message',
      badge: '3',
      tag: 'dm:/messages/x_y',
    })
  })
  it('tags other types per notification and defaults link to /home', () => {
    const p = buildPayload({ title: 'T', message: 'M', type: 'comment' }, 'n2', 0)
    expect(p.tag).toBe('n:n2')
    expect(p.link).toBe('/home')
    expect(p.badge).toBe('0')
  })
  it('never emits undefined values (FCM data must be strings)', () => {
    const p = buildPayload({ title: 'T', message: undefined as unknown as string, type: 'comment' }, 'n3', 1)
    expect(Object.values(p).every((v) => typeof v === 'string')).toBe(true)
  })
})

describe('buildClickUrl', () => {
  it('adds ?n= to a link without a query', () => {
    expect(buildClickUrl('/groups/abc', 'n1')).toBe('/groups/abc?n=n1')
  })
  it('adds &n= to a link with a query', () => {
    expect(buildClickUrl('/home?post=p1', 'n1')).toBe('/home?post=p1&n=n1')
  })
  it('defaults an empty link to /home', () => {
    expect(buildClickUrl('', 'n1')).toBe('/home?n=n1')
  })
})
