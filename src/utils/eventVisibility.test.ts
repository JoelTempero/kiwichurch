/* Private means private — including a private group's events.
 *
 * Two separate bugs live in `db.ts:getEvents()` and `EventForm` today:
 *
 *   1. `getEvents()` applies no visibility filter at all. A private group's meetings —
 *      title, location, description, full attendee list — are readable by any member,
 *      even though the group itself is correctly hidden from them.
 *
 *   2. `Event.isPublic` — the "Public event (visible to all members)" checkbox in
 *      EventForm — is written to the document and read by nothing. Unticking it does
 *      nothing whatsoever. (It is also NOT the flag this predicate uses — `isPublic`
 *      means "show on the public website"; the new `openToAllMembers` field is the one
 *      that gates member visibility, so the two flags stay independent.)
 *
 * These tests are what makes group and event privacy actually hold. */

import { describe, it, expect } from 'vitest'
import { visibleEvents, canSeeEvent, type VisibilityEvent, type VisibilityGathering } from './eventVisibility'

const GATHERINGS: VisibilityGathering[] = [
  { id: 'community', isPublic: true },
  { id: 'friends', isPublic: true },
  { id: 'oversight', isPublic: false },
  { id: 'kaitiaki', isPublic: false },
]

const EVENTS = [
  { id: 'community-hui', gatheringId: 'community', openToAllMembers: true },
  { id: 'friends-prayer', gatheringId: 'friends', openToAllMembers: true },
  { id: 'oversight-hui', gatheringId: 'oversight', openToAllMembers: false },
  { id: 'kaitiaki-hui', gatheringId: 'kaitiaki', openToAllMembers: false },
  { id: 'no-group', gatheringId: undefined, openToAllMembers: true },
]

const idsOf = (events: { id: string }[]) => events.map((e) => e.id)
const byId = new Map(GATHERINGS.map((g) => [g.id, g]))

describe('group-level privacy', () => {
  it('hides private-group events from a member of neither group', () => {
    const seen = visibleEvents(EVENTS, GATHERINGS, ['community', 'friends'])
    expect(idsOf(seen)).toEqual(['community-hui', 'friends-prayer', 'no-group'])
  })

  it('shows a private-group event to a member of that group, and no other', () => {
    const seen = visibleEvents(EVENTS, GATHERINGS, ['community', 'oversight'])
    expect(idsOf(seen)).toContain('oversight-hui')
    expect(idsOf(seen)).not.toContain('kaitiaki-hui')
  })

  it('shows public-group events to someone who has joined nothing at all', () => {
    const seen = visibleEvents(EVENTS, GATHERINGS, [])
    expect(idsOf(seen)).toEqual(['community-hui', 'friends-prayer', 'no-group'])
  })

  it('shows a church-wide event (no gatheringId) to everyone, membership or not', () => {
    expect(canSeeEvent({ gatheringId: undefined }, byId, new Set())).toBe(true)
  })

  it('gives admins no bypass — the predicate takes no role, on purpose', () => {
    // There is no argument you can pass to make a private group's event visible to a
    // non-member. If a future change adds one, this test should stop it.
    const seen = visibleEvents(EVENTS, GATHERINGS, ['community'])
    expect(idsOf(seen)).not.toContain('oversight-hui')
  })
})

describe('openToAllMembers (the flag that actually gates visibility)', () => {
  it('hides an event whose flag is false, even inside a public group', () => {
    const events = [{ id: 'quiet-word', gatheringId: 'friends', openToAllMembers: false }]
    expect(visibleEvents(events, GATHERINGS, [])).toHaveLength(0)
  })

  it('still shows that event to members of its group', () => {
    const events = [{ id: 'quiet-word', gatheringId: 'friends', openToAllMembers: false }]
    expect(idsOf(visibleEvents(events, GATHERINGS, ['friends']))).toEqual(['quiet-word'])
  })

  it('canSeeEvent: a member of a private group sees its event via direct call', () => {
    expect(
      canSeeEvent({ gatheringId: 'oversight', openToAllMembers: false }, byId, new Set(['oversight'])),
    ).toBe(true)
  })

  it('trusts an explicit true flag over the live gathering state — the write-time stamp is authoritative', () => {
    // openToAllMembers is meant to be stamped as (!gatheringId || gathering.isPublic) at
    // write time, so a private group's event should always carry `false`. If it were ever
    // hand-set to `true` on a private-group event, the predicate trusts it for a non-member
    // (membership is still checked first). This documents that the safety net is the
    // write-time stamp, not a second live re-check of gathering.isPublic.
    const events = [{ id: 'oversight-opened', gatheringId: 'oversight', openToAllMembers: true }]
    expect(idsOf(visibleEvents(events, GATHERINGS, []))).toEqual(['oversight-opened'])
  })
})

describe('legacy events (no openToAllMembers stamped)', () => {
  it('falls back to the gathering\'s own isPublic — public group stays visible', () => {
    const legacy = [{ id: 'legacy', gatheringId: 'friends' }] as (VisibilityEvent & { id: string })[]
    expect(idsOf(visibleEvents(legacy, GATHERINGS, []))).toEqual(['legacy'])
  })

  it('falls back to the gathering\'s own isPublic — private group stays hidden from non-members', () => {
    const legacy = [{ id: 'legacy-private', gatheringId: 'kaitiaki' }] as (VisibilityEvent & { id: string })[]
    expect(visibleEvents(legacy, GATHERINGS, [])).toHaveLength(0)
  })

  it('shows an event whose group no longer exists rather than hiding it forever', () => {
    const orphan = [{ id: 'orphan', gatheringId: 'deleted-group' }]
    expect(idsOf(visibleEvents(orphan, GATHERINGS, []))).toEqual(['orphan'])
  })
})
