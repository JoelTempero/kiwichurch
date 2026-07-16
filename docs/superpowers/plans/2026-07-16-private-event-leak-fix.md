# Private-Event Leak Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop any authenticated member from reading events belonging to groups they aren't in — at both the Firestore rules layer (the real boundary) and the client — without breaking the public static website.

**Architecture:** Denormalise a member-readability flag (`openToAllMembers`) onto every event at write time (true when the event has no group, or its group is public). Firestore rules gate authenticated reads on that flag OR proven group membership; the anonymous website path stays gated on the separate `isPublic` (= "show on website") flag. The client `getEvents()` is restructured into a public query + a membership query so the constrained rules can't reject it, and `useEvents` applies a defence-in-depth visibility filter ported from Forge.

**Tech Stack:** React 18 + Vite 6 + TypeScript + Firebase 11 (Firestore), Firebase Admin SDK (backfill script), Vitest (new — pure-function tests).

## Global Constraints

- **`Event.isPublic` means "show on the public website"** — NOT member visibility. `homepage.html:340` and `calendar.html:259` query `where('isPublic','==',true)` anonymously. Never repurpose or remove it, and never change its query semantics.
- **New flag is `Event.openToAllMembers: boolean`** — a distinct concept from `isPublic`. Definition: `!gatheringId || gathering.isPublic === true`. Do not conflate the two names in code.
- **Invariant (Joel's decision, 2026-07-16): `openToAllMembers === false ⟹ isPublic === false`.** A private group's event can never carry the website flag — publishing it publicly would leak exactly what we're closing, and the old mislabelled checkbox means existing `isPublic:true` on private-group events is almost always accidental. Enforced in the data (write paths + backfill + group-privacy flip), NOT in the rule — a rule that required both flags would make the static site's `where('isPublic','==',true)` query unprovable and Firestore would reject it. With the invariant held in data, the simple OR rule stays correct and the website query keeps working untouched.
- **No Cloud Functions** — backfill + re-stamp are client/Admin-SDK only, matching the rest of the platform.
- **Live data**: 60+ real members, 18 real gatherings. Migration must be additive and non-destructive; deploy order below is mandatory to avoid an events-disappear window.
- **No admin bypass on private groups** — same call kiwichurch made for the directory (2026-06-04). A private group is private from everyone outside it.
- **Deploy command**: `firebase deploy --only firestore:rules,hosting` (rules target is `firestore:rules`; if storage is ever included the target is `storage`, not `storage:rules`).
- Reference implementation to port from: `../forge/src/utils/eventVisibility.ts` (+ `eventVisibility.test.ts`, 12 tests).

---

### Task 1: Add Vitest + port the pure visibility predicate

kiwichurch has no test runner. Add Vitest (dev-only, never reaches the bundle) and port Forge's proven pure function. This task is self-contained: no app wiring yet.

**Files:**
- Modify: `package.json` (add `vitest` devDep + `"test": "vitest run"` script)
- Create: `vitest.config.ts`
- Create: `src/utils/eventVisibility.ts`
- Test: `src/utils/eventVisibility.test.ts`

**Interfaces:**
- Produces: `canSeeEvent(event, gatheringsById, myGatheringIds): boolean` and `visibleEvents<T>(events, gatherings, myGatheringIds): T[]`, plus exported types `VisibilityEvent { gatheringId?: string; openToAllMembers?: boolean; isPublic?: boolean }` and `VisibilityGathering { id: string; isPublic: boolean }`.

- [ ] **Step 1:** Copy `../forge/src/utils/eventVisibility.ts` to `src/utils/eventVisibility.ts` and `../forge/src/utils/eventVisibility.test.ts` to `src/utils/eventVisibility.test.ts`.

- [ ] **Step 2:** Adapt the predicate. Forge's version keys off `Event.isPublic` alone. Here the flag that decides member-readability is the new `openToAllMembers`; `isPublic` is the website flag and must NOT gate member visibility. Update `VisibilityEvent` to `{ gatheringId?: string; openToAllMembers?: boolean }` and rewrite the body:

```ts
// A member of the event's group always sees it. Otherwise the event must be
// open to all members. openToAllMembers is stamped at write time as
// (!gatheringId || gathering.isPublic). Absent on legacy docs → fall back to
// the live gathering lookup so nothing vanishes before the backfill runs.
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
```

- [ ] **Step 3:** Rewrite the test cases to the new semantics. Keep Forge's 12-case structure; rename `isPublic`→`openToAllMembers` on event fixtures. Required cases: member of private group sees it; non-member of private group does NOT; non-member of public group sees it; church-wide (no gatheringId) seen by everyone; legacy event (no `openToAllMembers`) in private group hidden from non-member; legacy event in public group visible; event pointing at a deleted group falls back to visible.

- [ ] **Step 4:** Run `npm test`. Expected: FAIL initially if any case mismatches, then edit until all pass. Final expected: `12 passed`.

- [ ] **Step 5:** Commit: `git add package.json vitest.config.ts src/utils/eventVisibility.ts src/utils/eventVisibility.test.ts && git commit -m "test: add vitest + port event visibility predicate"`

---

### Task 2: Stamp `openToAllMembers` on the event type + all write paths

**Files:**
- Modify: `src/types/event.ts:15` (add field)
- Modify: `src/services/firebase/db.ts` — `createEvent` (595), `createEventSeries` (608), `updateEvent` (631), `updateEventSeries` (655), `updateGathering` (529); add a `computeOpenToAllMembers` helper.
- Modify: `src/components/events/EventForm.tsx:98-108` (compute + include on submit)

**Interfaces:**
- Consumes: `VisibilityGathering` from Task 1 is unrelated here; this uses the full `Gathering` type.
- Produces: every event written now carries `openToAllMembers: boolean`. Helper `computeOpenToAllMembers(gatheringId: string | undefined, gatheringsById: Map<string, {isPublic: boolean}>): boolean`.

- [ ] **Step 1:** Add to `Event` interface (`event.ts`, after `isPublic`): `openToAllMembers?: boolean // stamped: !gatheringId || gathering.isPublic. Gates member reads. NOT the website flag.`

- [ ] **Step 2:** In `EventForm.tsx`, the gathering is already resolved at line 98 (`const gathering = gatherings.find(g => g.id === data.gatheringId)`). Compute once: `const openToAllMembers = !data.gatheringId || gathering?.isPublic === true`. Add to the `eventData` object (both the single-create at ~104 and the series base at ~138): `openToAllMembers,`. **Enforce the invariant**: also override the website flag so a private-group event can't be published — `isPublic: data.isPublic && openToAllMembers,` (replaces the existing `isPublic: data.isPublic`).

- [ ] **Step 3:** In `db.ts`, add helper near the events section:
```ts
function computeOpenToAllMembers(
  gatheringId: string | undefined,
  gatheringsById: Map<string, { isPublic: boolean }>,
): boolean {
  if (!gatheringId) return true
  return gatheringsById.get(gatheringId)?.isPublic === true
}
```

- [ ] **Step 4:** Defensive server-side stamping. In `createEvent` and `createEventSeries`, if `eventData.openToAllMembers` is `undefined`, resolve the gathering (`getGathering`) and set it before write — so a caller that forgets can't create a leaky record. Enforce the invariant here too: if the computed `openToAllMembers` is `false`, force `isPublic: false` on the written doc. In `updateEvent`, when `updates.gatheringId` changes, recompute `openToAllMembers` and re-apply the invariant (`if (openToAllMembers === false) updates.isPublic = false`).

- [ ] **Step 5:** Re-stamp on group privacy flip. In `updateGathering`, when `updates.isPublic !== undefined`, after the group write, batch-update every event with that `gatheringId` (query `where('gatheringId','==',gatheringId)`, chunk ≤450/batch): set `openToAllMembers` to the new value, and when the group is going **private** (`updates.isPublic === false`) also set `isPublic: false` to hold the invariant (a group turning private must un-publish its events from the website). When going public, leave each event's `isPublic` as-is (don't auto-publish). This is load-bearing: stale `openToAllMembers` flags would make the strict rules reject the whole events list query. Add a doc comment saying so.

- [ ] **Step 6:** `npm run typecheck` → clean. Manually create one event via the running app in each shape (church-wide, public group, private group) and confirm the doc carries the right `openToAllMembers` (check via Firebase MCP `firestore_get_documents`).

- [ ] **Step 7:** Commit: `git commit -am "feat: stamp openToAllMembers on all event write paths"`

---

### Task 3: Backfill existing events (Admin SDK script)

Run BEFORE the strict rules deploy so no event is left flag-less under the new rules.

**Files:**
- Create: `scripts/backfill-event-visibility.js` (mirrors `scripts/delete-user.js` Admin-SDK bootstrap + `serviceAccount.json`)
- Modify: `package.json` (add `"backfill-event-visibility": "node scripts/backfill-event-visibility.js"`)

- [ ] **Step 1:** Write the script: load all `gatherings` into an `id → isPublic` map; page through all `events`; for each, compute `openToAllMembers = !gatheringId || map[gatheringId] === true`; batch-update (≤450/batch) setting `openToAllMembers`, and when it is `false` also set `isPublic: false` to enforce the invariant. `--dry-run` default (log counts, no writes); `--apply` to write. Log a per-event summary of every event where `openToAllMembers` is `false` (these were readable by all members — the leak) and, separately, every event where `isPublic` was `true` but is being cleared (these were exposed on the public website — this count is decision 1's "accidentally published" number Joel wanted to see).

- [ ] **Step 2:** `node scripts/backfill-event-visibility.js` (dry run) against prod. Sanity-check the count of soon-to-be-restricted events matches the number of real private-group events.

- [ ] **Step 3:** Commit the script (do NOT run `--apply` yet — that happens in Task 6 deploy sequence): `git add scripts/backfill-event-visibility.js package.json && git commit -m "chore: add event-visibility backfill script"`

---

### Task 4: Restructure `getEvents` + wire the client filter

The strict rules (Task 5) reject an unconstrained events query. `getEvents` must fetch only provably-readable docs; `useEvents` applies the Task-1 predicate as defence-in-depth.

**Files:**
- Modify: `src/services/firebase/db.ts:567` (`getEvents`) and `:1439` (`subscribeToEvents`)
- Modify: `src/hooks/useEvents.ts:18` (`useEvents`)
- Test: extend `src/utils/eventVisibility.test.ts` if merge/dedupe logic moves into a helper

**Interfaces:**
- Consumes: `visibleEvents` (Task 1), `useGatherings` + `useUserGatheringIds` (`useGatherings.ts:23,60`).
- Produces: `getEvents(options, viewer?: { myPrivateGroupIds: string[] })` returns the merged, deduped, date-sorted visible set. Query P keys off the `openToAllMembers` flag (not group ids), so the viewer only needs the ids of the private groups the user belongs to. When `viewer` is omitted it returns only `openToAllMembers` events.

- [ ] **Step 1:** Rewrite `getEvents`: when `options.gatheringId` is set, keep the single-group query (rules allow it for members/public). Otherwise run two queries with the same date/limit constraints and merge by id:
  - Query P: `where('openToAllMembers','==',true)`
  - Query M: `where('gatheringId','in', myPrivateGroupIds)` — only if `myPrivateGroupIds.length > 0` (Firestore `in` cap is 30; a member in >30 private groups is not realistic at church scale — if it ever is, chunk the `in`). Skip Query M entirely for anonymous/no-viewer callers.
  Merge, dedupe by `id`, sort by `date` asc, apply `options.limit` client-side.

- [ ] **Step 2:** Update `useEvents` to mirror Forge (`../forge/src/hooks/useEvents.ts:38-63`): pull `gatherings` + `myGatheringIdSet`, derive `myPrivateGroupIds` (my groups whose `isPublic === false`), pass a `viewer` into `getEvents`, and still wrap the result in `visibleEvents(...)` as a second layer. Until `gatherings` load, return `[]` (never leak a frame).

- [ ] **Step 3:** Apply the same viewer-scoping to `subscribeToEvents` (used by real-time consumers) — same two-query approach via `onSnapshot`, or unsubscribe/resubscribe when membership changes. If real-time isn't currently mounted for events, note it and leave `subscribeToEvents` behind the same guard.

- [ ] **Step 4:** `npm run typecheck` + `npm test` → clean. Manually, signed in as an ordinary member (use a seeded `freedom` account NOT in the Oversight/private group): confirm the private group's event is absent from `/events`, calendar, and home; signed in as a member of it, confirm it appears.

- [ ] **Step 5:** Commit: `git commit -am "fix: scope getEvents to visible events + client filter"`

---

### Task 5: Tighten `firestore.rules` for the events collection

**Files:**
- Modify: `src/../firestore.rules:219-221` (the `/events/{eventId}` read rule)

- [ ] **Step 1:** Add a membership helper near the other helpers (~line 73):
```
function isMemberOfEventGroup() {
  return isAuthenticated()
    && resource.data.gatheringId is string
    && resource.data.gatheringId != ''
    && exists(/databases/$(database)/documents/gatherings/$(resource.data.gatheringId)/members/$(request.auth.uid));
}
```

- [ ] **Step 2:** Replace the read rule (line 221) with (NOTE: the `openToAllMembers` branch MUST be auth-gated — otherwise anonymous users can read members-only events that have `openToAllMembers:true, isPublic:false`, e.g. any church-wide/public-group event not published to the website; caught in review 2026-07-16):
```
// Anonymous static-site calendar: only website-published events.
// Authenticated members: events open to all members, church-wide events,
// or events of a group they belong to. No blanket authenticated read.
allow read: if resource.data.isPublic == true
  || (isAuthenticated() && resource.data.openToAllMembers == true)
  || isMemberOfEventGroup();
```
Leave the events create/update/delete rules unchanged.

- [ ] **Step 2b (added in review — closes the attendee-list half of the bug):** The `/events/{eventId}/rsvps` subcollection read is independent of the parent event rule and is currently `allow read: if isAuthenticated();` — so a private event's full attendee list is readable by any member. Add a helper and scope the rsvps read to whoever can see the parent event:
```
function canReadEventForRsvps(eventId) {
  let e = get(/databases/$(database)/documents/events/$(eventId)).data;
  return e.isPublic == true
    || e.openToAllMembers == true
    || (e.gatheringId is string && e.gatheringId != ''
        && exists(/databases/$(database)/documents/gatherings/$(e.gatheringId)/members/$(request.auth.uid)));
}
```
Then change only the rsvps read line: `allow read: if isAuthenticated() && canReadEventForRsvps(eventId);` (leave rsvps create/update/delete unchanged). Depends only on the parent event + auth, so `getRSVPs`'s `getDocs` and the `getCountFromServer` aggregate stay provable. (Known out-of-scope: rsvps create/update/delete still allow a member to write their own rsvp without an event-visibility check — pre-existing WRITE concern, not this read-leak fix.)

- [ ] **Step 3:** Validate via Firebase MCP `validate_security_rules` on the edited file. Expected: valid.

- [ ] **Step 4 (DEFERRED — Joel's call 2026-07-16: manual smoke instead):** Emulator rules tests (`@firebase/rules-unit-testing`) are the only thing that *proves* the list-query boundary, but we're relying on Step 3 (`validate_security_rules`) + the live smoke test in Task 6 Step 4 this session. Leave a one-line note in Task 6 that the boundary was verified manually, not by automated rules tests, so a future session knows the emulator suite is still worth adding.

- [ ] **Step 5:** Commit: `git commit -am "fix(security): scope event reads to members of the event's group"`

---

### Task 6: Deploy sequence + live verification

Order is mandatory — flags must exist on every doc before the strict rules land, and the constrained client must ship with (or before) the rules.

- [ ] **Step 0 (MUST be first — added from final review):** Deploy the new composite index and wait for it to be READY *before* any client using Query P ships: `firebase deploy --only firestore:indexes`, then poll Firebase console / MCP `firestore_list_indexes` until `events(openToAllMembers ASC, date ASC)` is READY. Query P (`where('openToAllMembers','==',true) + orderBy('date')`) throws `FAILED_PRECONDITION` without it, which would empty every event list for all users (same failure class as the 2026-06-04 notifications-index incident).
- [ ] **Step 1:** Run the backfill against prod: `npm run backfill-event-visibility` (dry-run first) — eyeball the two counts and the `[ORPHAN…]` vs `[private group…]` tags — then `-- --apply`. Confirm via Firebase MCP that a known private-group event now has `openToAllMembers: false` (+ `isPublic:false`) and a church-wide event has `true`.
- [ ] **Step 2:** With the index READY and the backfill applied, deploy the client + strict rules together: `firebase deploy --only firestore:rules,hosting`. (Index is already live from Step 0; do NOT skip it there.)
- [ ] **Step 3:** Live smoke test on the deployed site:
  - Sign in as a member NOT in a private group → that group's events are absent from `/events`, calendar, home, and search; the raw doc read is denied (check devtools network / Firebase MCP as that user is not possible — instead confirm the UI + that an unconstrained query throws in console).
  - Sign in as a member of that group → events appear, RSVP works.
  - Load the **public website** (`homepage.html`, `calendar.html`) signed out → published (`isPublic`) events still render. This is the regression guard.
- [ ] **Step 4:** Relabel the misleading checkbox. In `EventForm.tsx:401`, change `"Public event (visible to all members)"` to `"Show on public website"` (its true meaning). Rebuild + deploy hosting. (Kept last so it doesn't muddy the security diff.)
- [ ] **Step 5:** Update `kiwichurch/CLAUDE.md` (session log + Key Decisions: `openToAllMembers` model, deploy ordering incl. the index-first step, the `isPublic`=website clarification) and the churchconnect umbrella `CLAUDE.md` (tick the kiwichurch half of the leak; note theriver still pending). Commit.

---

## Resolved decisions (Joel, 2026-07-16)

1. **Private-group events must never appear on the public website.** Enforced via the data invariant `openToAllMembers === false ⟹ isPublic === false` (write paths + backfill + group-privacy flip), which keeps the Firestore rule a simple provable OR and needs no static-site or index changes. The Task 3 dry-run reports how many existing events were accidentally published (stray `isPublic:true` on private-group events) before they're cleared.
2. **theriver** is out of scope here (still mock backend). Port the same fix when its Firebase project exists — separate session, tracked in the umbrella CLAUDE.md.
3. **Rules emulator tests deferred** — this session verifies the boundary via emulator compile-check + live manual smoke (Task 6 Step 3). Adding the `@firebase/rules-unit-testing` suite remains a future improvement.
