# Plan — Admin Workflow Features

Spec: `docs/superpowers/specs/2026-05-13-admin-workflow-features-design.md` (commit ab090cc)

Three independent commits, each shippable on its own. Run `npm run build` after every task.

---

## Task 1 · Group membership management

**Goal:** Admin/host can add and remove members from any private group they admin/host. New Members tab on GroupDetailPage.

**Steps:**
1. `src/services/firebase/db.ts` — add `bulkAddGatheringMembers(gatheringId, gatheringName, userIds: string[])`:
   - chunks at 225 user ids (450 ops/batch — 1 member doc + 1 notification per user)
   - each chunk: `writeBatch()` with `setDoc(gatherings/{id}/members/{uid}, { id: uid, joinedAt: serverTimestamp() })` and `addDoc`-equivalent via batch (use `doc(collection(...))` to allocate id then `batch.set(...)`) for one `notifications` doc per user with `type: 'group_invite'`, `title: "Added to ${gatheringName}"`, `message: "You've been added to the group."`, `linkTo: '/groups/${gatheringId}'`
2. `src/hooks/useGatherings.ts` — add `useBulkAddGatheringMembers` mutation, invalidates members + memberProfiles queries on success
3. `src/components/groups/GroupMembersList.tsx` — new component, props: `gatheringId`, `gatheringName`, `gathering` (for hostId), `currentUserId`, `canManage` (admin/host of this gathering):
   - reads `useGatheringMemberProfiles(gatheringId)`
   - renders vertical list: avatar, displayName, "Host" badge when profile.id matches gathering.hostId OR (look up user.hostedGatherings includes this id — but profile mirror doesn't carry hostedGatherings, so use only hostId for the badge), join date is currently not on UserProfile — skip join date for v1; the member doc has joinedAt but we'd need a separate query. Drop join date, just show name + Host badge.
   - when canManage and member !== currentUser: small `X` icon button → confirm modal → mutate delete
   - top of list: when canManage, "Add members" button → opens AddMembersModal
4. `src/components/groups/AddMembersModal.tsx` — new modal:
   - props: `isOpen`, `onClose`, `gatheringId`, `gatheringName`, `existingMemberIds: string[]`
   - on mount fetches `dbService.getAllPublicProfiles()`; filters out existingMemberIds
   - search input (case-insensitive contains on displayName)
   - scrollable list of rows with checkboxes
   - submit calls `useBulkAddGatheringMembers` then closes modal
5. `src/components/groups/index.ts` — re-export new components
6. `src/pages/GroupDetailPage.tsx`:
   - state: `activeTab: 'board' | 'files' | 'members'`
   - add third tab button after Files
   - render `<GroupMembersList>` for the members tab, pass `canManage = isAdmin || (gathering.hostId === user?.id) || (user?.hostedGatherings?.includes(groupId))`
7. Build, manual-check the diff, commit.

**Acceptance:** GroupDetailPage shows a Members tab; admin/host on that group sees Add + Remove controls; member doc + notification both write.

---

## Task 2 · Kete public / members-only toggle

**Goal:** Each Kete post has a visibility setting. Public posts readable anonymously (static site). Members-only posts auth-gated.

**Steps:**
1. `src/types/kete.ts` — add `visibility?: 'public' | 'members'` to `KetePost`
2. `src/utils/schemas.ts` — add `visibility: z.enum(['public', 'members']).default('public')` to `keteSchema`
3. `src/components/kete/EditorTopBar.tsx`:
   - add props `visibility: 'public' | 'members'`, `onVisibilityChange: (v) => void`
   - render an inline radio-pill control: two buttons "Public" and "Members only", forest tint when selected
   - place between Save Draft and Publish
4. `src/pages/KetePostEditor.tsx`:
   - `defaultValues` adds `visibility: 'public'`
   - hydration from `existingPost` adds `visibility: existingPost.visibility ?? 'public'`
   - save `basePayload` includes `visibility: data.visibility`
   - pass `visibility` + `onChange` handler to EditorTopBar
5. `src/services/firebase/db.ts` — add `migrateKeteVisibility()`:
   - getDocs on `kete` collection, filter client-side for missing `visibility`
   - batch-update each missing doc to `{ visibility: 'public' }`, idempotent
6. `src/hooks/useAuth.ts` — module-level `keteVisibilityMigratedThisSession` flag, fire `migrateKeteVisibility()` once per session when current user is admin/host (fire-and-forget, console.error on fail)
7. `firestore.rules` — replace kete read rule with the visibility-aware version from the spec
8. `src/pages/KetePage.tsx` — add "Members only" pill on the card when `post.visibility === 'members'`
9. `src/pages/KetePostPage.tsx` — add "Members only" pill next to the post title (use same component)
10. `kete.html` — update the published-query to add `where('visibility', '==', 'public')`. Posts missing the field would not match; the migration runs immediately and is idempotent.
11. Build, manual-check, commit.

**Acceptance:** Editor pill toggles; new posts default public; published members-only post is invisible on static site but visible in portal; rule blocks anonymous read.

---

## Task 3 · Community resources/files tab on HomePage

**Goal:** `/home` mirrors the GroupDetailPage Board/Files tab pattern. Latest Files preview goes away.

**Steps:**
1. `src/pages/HomePage.tsx`:
   - add `activeTab: 'board' | 'files'` state, default 'board'
   - read/write `?tab=files` via `useSearchParams()` for deep-linking
   - render tab switcher (forest underline, matches GroupDetailPage.tsx pattern) above the community board form
   - move the existing form + posts into a `{activeTab === 'board' && (...)}` block
   - new `{activeTab === 'files' && (<GroupResourcesList gatheringId={COMMUNITY_GATHERING_ID} isAdminOrHost={isAdminOrHost} />)}` block
   - drop the "Latest Files" right-column section, drop the 2-col grid wrapper
   - Upcoming Events keeps its own section below, full-width
   - drop the `useGroupResources` hook call + `latestResources` + `formatResourceDate` helper + `GroupResource` type import + `FileText` / `ExternalLink` icon imports
2. Build, manual-check, commit.

**Acceptance:** /home now has Board/Files tabs; events full-width below; ?tab=files deep-link works.
