/** The bits of a gathering that decide whether its events are visible. */
export interface VisibilityGathering {
  id: string
  isPublic: boolean
}

/* Deliberately looser than `Event`: `gatheringId` and `openToAllMembers` are optional
 * here because events written before the flag existed simply do not carry it. Typing
 * them as required would be a lie about the data actually sitting in the collection. */
export interface VisibilityEvent {
  gatheringId?: string
  openToAllMembers?: boolean
}

/**
 * Can this user see this event?
 *
 * This is the member-readability check. It has nothing to do with `Event.isPublic`,
 * which is a separate flag meaning "show on the public website" — using it here would
 * be wrong twice over: it would ignore group privacy, and it would leak the website's
 * publishing decision into who can read an event inside the app.
 *
 * `openToAllMembers` is the flag that actually gates member visibility. It is stamped
 * at write time as `(!gatheringId || gathering.isPublic)` — i.e. events with no group,
 * or events in a public group, default to open. Events in a private group default to
 * closed. Legacy documents written before this flag existed simply don't carry it; for
 * those we fall back to a live lookup of the gathering so nothing vanishes before a
 * backfill runs.
 *
 * The rule, in order:
 *
 *   - No group at all → church-wide, everyone sees it.
 *   - A member of the event's group always sees it. Membership beats every flag.
 *   - Otherwise, if the event carries `openToAllMembers`, that flag decides.
 *   - Otherwise (legacy, no flag), fall back to the live gathering's own `isPublic`.
 *     An unknown/deleted group is not treated as a private group's secret — it falls
 *     back to visible.
 *
 * No admin bypass, on purpose — the same call the directory makes. A private group is
 * private from everyone outside it. Admins reach these events through the groups they
 * actually belong to.
 */
export function canSeeEvent(
  event: VisibilityEvent,
  gatheringsById: Map<string, VisibilityGathering>,
  myGatheringIds: Set<string>,
): boolean {
  if (!event.gatheringId) return true // church-wide
  if (myGatheringIds.has(event.gatheringId)) return true
  if (typeof event.openToAllMembers === 'boolean') return event.openToAllMembers
  const g = gatheringsById.get(event.gatheringId)
  return g ? g.isPublic : true // unknown group is not a private group's secret
}

/** Filter a list of events down to the ones this user may see. */
export function visibleEvents<T extends VisibilityEvent>(
  events: T[],
  gatherings: VisibilityGathering[],
  myGatheringIds: string[],
): T[] {
  const byId = new Map(gatherings.map((g) => [g.id, g]))
  const mine = new Set(myGatheringIds)
  return events.filter((e) => canSeeEvent(e, byId, mine))
}
