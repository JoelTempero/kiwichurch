# Admin Workflow Features — Design Spec

**Date:** 2026-05-13
**Scope:** Three small admin/host-facing extensions to the portal, all in the same UI surface, shipped together. The companion seed-template + CLI work lives in [`2026-05-13-seed-template-cli-design.md`](./2026-05-13-seed-template-cli-design.md).

## Topics covered

1. Group membership management — admin/host can add and remove members from any private group they admin/host
2. Kete public / members-only visibility toggle
3. Community resources/files tab on the home page

---

## 1. Group membership management

### Problem

Today, admins and group-hosts have no UI to add or remove members from a private group. The Firestore rules already permit it (`firestore.rules:154-167` — `isAdmin()` or `isHostOfGathering()` can create/delete `gatherings/{id}/members/{userId}`), and the `group_invite` notification type already exists. The work is entirely client-side: surface a Members tab on the group page, plus a multi-select picker and a per-row remove control.

### Design

**Data:** No schema changes. Uses existing `gatherings/{id}/members/{userId}` subcollection and the existing `'group_invite'` notification type.

**UI changes — `src/pages/GroupDetailPage.tsx`:**

- Add a third tab to the existing tab switcher: **Board / Files / Members**. State variable goes from `'board' | 'files'` to `'board' | 'files' | 'members'`.
- The new tab mounts a `<GroupMembersList>` component.

**New component — `src/components/groups/GroupMembersList.tsx`:**

- Reads `useGatheringMemberProfiles(gatheringId)` (already mounted on the page — no duplicate fetch).
- Renders a vertical list of members: avatar, display name, "Host" badge when the user is the gathering's host (matches `gathering.hostId` or has this gathering in `hostedGatherings`), joined-at relative date from the member doc's `joinedAt`.
- When the current user `isAdmin()` or `isHostOfGathering(gatheringId)`:
  - A pinned "Add members" button at the top, opens `<AddMembersModal>`.
  - A small `×` icon on every row (except the current user). Click → `<ConfirmModal>` with "Remove [Name] from [Group]?" → on confirm, deletes `gatherings/{id}/members/{userId}`. No notification fired to the removed user.

**New component — `src/components/groups/AddMembersModal.tsx`:**

- Fetches all public profiles via `dbService.getAllPublicProfiles()`.
- Filters out current group members (by id) and the current user.
- Renders a search input at the top, then a scrollable list of rows with checkboxes.
- "Add N members" button at the bottom (disabled when zero selected).
- On submit: calls a new `dbService.bulkAddGatheringMembers(gatheringId, gatheringName, userIds[])` which performs a Firestore batched write — one `gatherings/{id}/members/{userId}` doc plus one `'group_invite'` notification doc per selected user. Chunks at 450 ops/batch (same shape as the announcement broadcaster in `db.ts`).
- On success: closes modal, shows toast "Added N members", invalidates the gathering-members query.

**New helper — `src/services/firebase/db.ts: bulkAddGatheringMembers(gatheringId, gatheringName, userIds)`:**

- Loops over chunks of 225 user ids (so 450 ops/batch since each user costs 2 writes).
- For each: `setDoc(gatherings/{id}/members/{uid}, { id: uid, joinedAt: serverTimestamp() })` and `addDoc(notifications, { userId: uid, type: 'group_invite', title: 'Added to ${gatheringName}', message: '...', linkTo: '/groups/${id}', createdAt: serverTimestamp() })`.
- The notification create rule already permits this — `isActive()` + `userId != request.auth.uid` is satisfied.

**Hook — `src/hooks/useGatherings.ts: useBulkAddGatheringMembers`:**

- Standard TanStack Query mutation wrapping `bulkAddGatheringMembers`. On success invalidates the members query for that gathering.

### Trade-offs

- **Picker scope:** the picker shows every active church member from the `userProfiles` mirror. Host could "invite" someone they don't personally know — same trust boundary as the existing Directory, so no new privacy surface.
- **Notification dedupe:** if a user is added, leaves, then re-added, they get two `group_invite` notifications. Acceptable — rare and intentional behaviour.
- **Remove doesn't notify:** deliberate, avoids drama. Removed user just notices next time they look.

### Files touched

- `src/pages/GroupDetailPage.tsx` — third tab
- `src/components/groups/GroupMembersList.tsx` — new
- `src/components/groups/AddMembersModal.tsx` — new
- `src/services/firebase/db.ts` — `bulkAddGatheringMembers`
- `src/hooks/useGatherings.ts` — `useBulkAddGatheringMembers` mutation
- `src/components/groups/index.ts` — re-export

---

## 2. Kete public / members-only visibility toggle

### Problem

Today every published Kete post is publicly readable — the static site `kete.html` fetches the `kete` collection anonymously and filters on `published == true`, and the Firestore rule allows any read where `published == true`. The church wants the option to write members-only posts (devotionals, internal updates) that the portal shows but the public website hides.

### Design

**Schema — `src/types/kete.ts`:**

```ts
export interface KetePost {
  // ...existing fields
  visibility?: 'public' | 'members'  // default 'public' on write; undefined treated as 'public' on read for backwards compat
}
```

**Zod schema — `src/utils/schemas.ts: keteSchema`:**

```ts
visibility: z.enum(['public', 'members']).default('public')
```

**Firestore rules — `firestore.rules:261`:**

```
match /kete/{postId} {
  // Published + public: anonymous read OK (static site).
  // Published + members-only: requires auth + active.
  // Drafts (any visibility): author + admin/host only.
  // Legacy posts missing the visibility field are treated as public
  // (the keys().hasAny(['visibility']) check; Firestore rules use the
  // map-keys helper, not the `in` operator).
  allow read:
    if (resource.data.published == true
        && (!resource.data.keys().hasAny(['visibility']) || resource.data.visibility == 'public'))
    || (resource.data.published == true
        && resource.data.keys().hasAny(['visibility'])
        && resource.data.visibility == 'members'
        && isAuthenticated() && isActive())
    || (isAuthenticated() && (
         resource.data.authorId == request.auth.uid || isAdminOrHost()
       ));

  // ...create/update/delete unchanged
}
```

**One-shot backfill migration — `src/services/firebase/db.ts: migrateKeteVisibility()`:**

- Queries all `kete` docs where `visibility` is missing (`where('visibility', '==', null)` won't work — use a getDocs over the whole collection and filter client-side; the kete collection is small enough for this to be a one-shot cost).
- Batch-updates each missing doc to `{ visibility: 'public' }`.

**Migration trigger — `src/hooks/useAuth.ts`:**

- New module-level `keteVisibilityMigratedThisSession` flag (mirrors `announcementsResumedThisSession`).
- When the authenticated user is admin or host, call `migrateKeteVisibility()` once per session, fire-and-forget.
- Even if the migration is missed for some reason, the rule's legacy fallback (`!resource.data.keys().hasAny(['visibility'])`) keeps existing posts publicly readable. The migration only normalizes the data.

**Editor UI — `src/components/kete/EditorTopBar.tsx`:**

A small inline radio-pill control between "Save Draft" and "Publish":

```
Visible to:  [• Public]  [ Members only]
```

- Bound to `form.watch('visibility')` and `form.setValue('visibility', value, { shouldDirty: true })`.
- Forest-green pill style consistent with the rest of the editor.
- New required prop on `EditorTopBar`: `visibility: 'public' | 'members'` and `onVisibilityChange(v: 'public' | 'members') => void`.

**Editor wiring — `src/pages/KetePostEditor.tsx`:**

- Form `defaultValues` add `visibility: 'public'`.
- Hydration from `existingPost` adds `visibility: existingPost.visibility ?? 'public'`.
- Save payload includes `visibility: data.visibility`.

**Reader UI:**

- `src/pages/KetePage.tsx` — a small "Members only" pill on the card for any post with `visibility === 'members'`.
- `src/pages/KetePostPage.tsx` — same pill next to the post title.

**Static site — `kete.html`:**

- The existing query that fetches the `kete` collection gains a `where('visibility', '==', 'public')` clause. Posts missing the field (legacy, pre-migration) won't match — accepted, since the migration runs immediately and is idempotent.

### Trade-offs

- **OG previews of members-only posts** — none. Social link previews of a members-only URL will show the static page's fallback. Acceptable for v1; if we ever want server-side rendering we need Cloud Functions anyway.
- **Migration safety** — the rule's `!resource.data.keys().hasAny(['visibility'])` fallback means even if the migration races with a post being read, nothing breaks.
- **Default of public, not members-only** — Joel may forget to set members-only. Acceptable trade — every existing post is public today; the new default matches that.

### Files touched

- `src/types/kete.ts` — `visibility` field
- `src/utils/schemas.ts` — `keteSchema` extension
- `src/components/kete/EditorTopBar.tsx` — pill control + new prop
- `src/pages/KetePostEditor.tsx` — form wiring
- `src/pages/KetePage.tsx` — list badge
- `src/pages/KetePostPage.tsx` — detail badge
- `src/services/firebase/db.ts` — `migrateKeteVisibility`
- `src/hooks/useAuth.ts` — migration trigger
- `firestore.rules` — read rule
- `kete.html` — static query filter

---

## 3. Community resources / files tab on the home page

### Problem

`GroupDetailPage` has a Board/Files tab pattern. The community gathering (the special `kiwi-church-community` group) uses the HomePage as its detail view, but HomePage doesn't have tabs — instead it shows a "Latest Files" preview of the 5 most recent resources in the bottom-right grid. Joel wants the home page to match the group-page pattern: full Files tab, not a preview.

### Design

**Layout change — `src/pages/HomePage.tsx`:**

Today's structure:
```
Greeting
Community Board (form + posts, 3 + "view all")
[grid: Upcoming Events | Latest Files]
Admin links
```

After:
```
Greeting
Community: [ Board | Files ]
  Board → existing community board (form + posts, 3 + "view all")
  Files → <GroupResourcesList gatheringId={COMMUNITY_GATHERING_ID} ...>
Upcoming Events (full-width, unchanged content)
Admin links
```

**Tab switcher:**

- Reuse the visual pattern from `GroupDetailPage.tsx:278-299` (forest underline, `border-b` divider).
- State: `const [activeTab, setActiveTab] = useState<'board' | 'files'>('board')`.
- Deep-link support: read `?tab=files` from `useSearchParams()` on mount; write the tab back to the URL when toggled. So a notification deep-link to `/home?tab=files` works.

**Files tab body:**

- Mounts `<GroupResourcesList gatheringId={COMMUNITY_GATHERING_ID} isAdminOrHost={isAdminOrHost} />`. Component already exists, already wires upload/link/edit/delete + drag-and-drop. No backend work.

**What goes away:**

- The "Latest Files" panel currently in the right column of the bottom grid (~80 lines).
- The `useGroupResources` hook call at the top of HomePage — no longer needed.
- The `latestResources` slice and the `formatResourceDate` helper — no longer needed.

**What stays:**

- Upcoming Events keeps its own section below the tabs, now full-width on desktop (was constrained to 50% in the 2-col grid). A small win — that section was cramped.
- Admin links section unchanged.

### Trade-offs

- **Mobile users tap once more** to reach files. Mitigation: Files is a peer of Board in the tab strip, equally prominent, with the same visual weight.
- **Removing the preview** means the home page loses a "what's new in files" surface. Counter-argument: the preview was only 5 items, often empty, and rarely actioned on. The full Files tab is more useful.

### Files touched

- `src/pages/HomePage.tsx` — tab switcher, restructure layout, drop "Latest Files" panel.

---

## Out of scope

- Email-based group invites (provisioning new accounts via invite link) — separate problem.
- Server-side OG rendering of members-only Kete posts — needs Cloud Functions.
- Member-blocking / banning — deferred per CLAUDE.md.
- Bulk-remove members from a group — single-row remove is enough for v1.

## Open questions

None at spec time. Plan will reuse existing patterns wherever possible — no new conventions introduced.
