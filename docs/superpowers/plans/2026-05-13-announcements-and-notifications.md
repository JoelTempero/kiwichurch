# Announcements + Notifications Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Admin-pinnable community announcements with notification fan-out, four missing notification triggers, and the bell-icon panel staleness fix.

**Architecture:** Extend `BoardPost` with pin fields. Pinning on the community gathering broadcasts an `announcement` notification to every member via chunked Firestore batches with deterministic doc IDs (idempotent on re-run). Fan-out wired at five `dbService` mutation sites; rules tightened.

**Tech Stack:** React 18 + TS + Vite, Firebase 11, TanStack Query 5, Tailwind v4, Lucide React.

**Verification:** No unit-test framework in repo. Each task ends with `npm run typecheck` (and `npm run build` on the final task). Task 12 is the dogfood matrix.

**Spec:** `docs/superpowers/specs/2026-05-13-announcements-and-notifications-design.md`

**Closest analog to read first:** the group-@mention fan-out at `src/services/firebase/db.ts:993` — same chunking pattern, same notification doc shape. Tasks 6 + 8 follow it directly.

---

### Task 1: Type extensions

**Modify:** `src/types/gathering.ts`, `src/types/notification.ts`

- [ ] Add to `BoardPost`: `pinnedAt?: Timestamp | Date`, `pinnedBy?: string`, `announcementBroadcastStatus?: 'pending' | 'sent'`, `broadcastCompletedAt?: Timestamp | Date`. (`pinned` already exists at line ~40 — don't duplicate.)
- [ ] Add to `BoardComment`: `replyToAuthorId?: string` (sibling of `replyToAuthorName`).
- [ ] Add `'announcement'` to `NotificationType` (just before `'system'`).
- [ ] `npm run typecheck` → pass. Commit: `feat(types): pin fields + announcement notification type`.

---

### Task 2: `pinPost` / `unpinPost` (no broadcast yet)

**Modify:** `src/services/firebase/db.ts`

- [ ] Confirm `COMMUNITY_GATHERING_ID = 'kiwi-church-community'` and `isCommunityGathering` exist (referenced at db.ts:1011). Add the constant near top of file if missing.
- [ ] Add the two methods to `dbService` near other gathering-board methods:

```ts
async pinPost(gatheringId: string, postId: string, userId: string): Promise<void> {
  const ref = doc(db, 'gatherings', gatheringId, 'posts', postId)
  const snap = await getDoc(ref)
  if (!snap.exists() || snap.data().pinned === true) return
  const isCommunity = gatheringId === COMMUNITY_GATHERING_ID
  await updateDoc(ref, {
    pinned: true,
    pinnedAt: serverTimestamp(),
    pinnedBy: userId,
    ...(isCommunity ? { announcementBroadcastStatus: 'pending' } : {}),
  })
},

async unpinPost(gatheringId: string, postId: string): Promise<void> {
  const ref = doc(db, 'gatherings', gatheringId, 'posts', postId)
  await updateDoc(ref, { pinned: false, pinnedAt: null, pinnedBy: null })
},
```

- [ ] `npm run typecheck` → pass. Commit: `feat(db): pinPost and unpinPost`.

---

### Task 3: `usePinPost` / `useUnpinPost` hooks

**Modify:** the hook file that owns gathering-post mutations (grep for `usePostBoardComment` or similar in `src/hooks/`).

- [ ] First grep `useGatheringPosts` for its `queryKey:` — reuse the exact shape below (assumed `['gathering-posts', gatheringId]`):

```ts
export function usePinPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { gatheringId: string; postId: string; userId: string }) =>
      dbService.pinPost(v.gatheringId, v.postId, v.userId),
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['gathering-posts', v.gatheringId] }),
  })
}

export function useUnpinPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { gatheringId: string; postId: string }) =>
      dbService.unpinPost(v.gatheringId, v.postId),
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['gathering-posts', v.gatheringId] }),
  })
}
```

- [ ] `npm run typecheck` → pass. Commit: `feat(hooks): usePinPost and useUnpinPost`.

---

### Task 4: Notification fan-out — comments and replies

**Modify:** `src/services/firebase/db.ts` (`addBoardComment`), plus comment-submission call sites.

- [ ] Read `addBoardComment`. After the existing @mention fan-out, add (variable names must match what the function already binds — `post`, `context`, `snippet`, etc.):

```ts
const recipientId = newComment.replyToId ? newComment.replyToAuthorId : post.authorId
if (recipientId && recipientId !== context.authorId) {
  const verb = newComment.replyToId ? 'replied to your comment' : 'commented on your post'
  addDoc(collection(db, 'notifications'), {
    userId: recipientId,
    type: 'new_comment' as const,
    title: `${context.authorName} ${verb}`,
    message: snippet,
    link: isCommunityGathering(gatheringId) ? '/home' : `/groups/${gatheringId}`,
    read: false,
    createdAt: serverTimestamp(),
  }).catch(err => console.error('[db] comment notify failed', err))
}
```

- [ ] Grep for `replyToAuthorName:` in `src/components/` — each match is a place that constructs a reply. Add a sibling `replyToAuthorId: parentComment.authorId` line.
- [ ] `npm run typecheck` → pass. Commit: `feat(notifications): fan-out for comments and replies`.

---

### Task 5: Notification fan-out — RSVPs

**Modify:** `src/services/firebase/db.ts` (`setRSVP`).

- [ ] `setRSVP` already reads the previous RSVP for the `rsvpYesCount` increment. Reuse that read (call it `previousRsvp`).
- [ ] After the RSVP write, before returning, insert (variable names match the surrounding function):

```ts
const wasGoing = previousRsvp?.status === 'yes' || previousRsvp?.status === 'maybe'
const isGoing = status === 'yes' || status === 'maybe'
if (isGoing && !wasGoing && event.createdBy && event.createdBy !== userId) {
  addDoc(collection(db, 'notifications'), {
    userId: event.createdBy,
    type: 'event_update' as const,
    title: `${userName} RSVP'd to ${event.title}`,
    message: '',
    link: `/events/${eventId}`,
    read: false,
    createdAt: serverTimestamp(),
  }).catch(err => console.error('[db] rsvp notify failed', err))
}
```

- [ ] `npm run typecheck` → pass. Commit: `feat(notifications): host notified on yes/maybe RSVP`.

---

### Task 6: Notification fan-out — event updates and cancellations

**Modify:** `src/services/firebase/db.ts` (helper + `updateEvent` + `updateEventSeries`).

- [ ] Add helper to `dbService`:

```ts
async notifyEventAttendees(eventId: string, event: Event, kind: 'updated' | 'cancelled'): Promise<void> {
  const rsvps = await getDocs(query(
    collection(db, 'events', eventId, 'rsvps'),
    where('status', 'in', ['yes', 'maybe'])
  ))
  const me = auth.currentUser?.uid
  const targets = rsvps.docs.map(d => d.id).filter(uid => uid !== me)
  if (targets.length === 0) return
  const title = kind === 'cancelled' ? `${event.title} was cancelled` : `${event.title} was updated`
  const now = serverTimestamp()
  for (let i = 0; i < targets.length; i += 450) {
    const batch = writeBatch(db)
    targets.slice(i, i + 450).forEach(uid => {
      batch.set(doc(collection(db, 'notifications')), {
        userId: uid, type: 'event_update' as const,
        title, message: '', link: `/events/${eventId}`,
        read: false, createdAt: now,
      })
    })
    await batch.commit()
  }
},
```

- [ ] In `updateEvent`: snapshot the pre-update event. After the write, if any of `time` / `endTime` / `location` / `isCancelled` changed, fire `this.notifyEventAttendees(...)` with the right `kind`. Wrap in `.catch`.
- [ ] In `updateEventSeries`: same comparison per propagated event. Reuse the helper.
- [ ] `npm run typecheck` → pass. Commit: `feat(notifications): attendees notified on event update/cancel`.

---

### Task 7: Notification fan-out — added to a group

**Modify:** `src/services/firebase/db.ts` (`ensureMembershipsForUser` at line ~384, plus any admin add-member path).

- [ ] In `ensureMembershipsForUser`: ensure the function distinguishes newly-created member docs from no-op rewrites (read existing implementation). For each NEW membership where `gatheringId !== COMMUNITY_GATHERING_ID`:

```ts
const g = await getDoc(doc(db, 'gatherings', gatheringId))
addDoc(collection(db, 'notifications'), {
  userId,
  type: 'group_invite' as const,
  title: `You were added to ${g.data()?.name || 'a group'}`,
  message: '',
  link: `/groups/${gatheringId}`,
  read: false,
  createdAt: serverTimestamp(),
}).catch(err => console.error('[db] group-add notify failed', err))
```

- [ ] Grep `src/services/` for other `members.*set\(` patterns. Apply the same notification to any admin "add member" path found.
- [ ] `npm run typecheck` → pass. Commit: `feat(notifications): users notified when added to a group`.

---

### Task 8: Announcement broadcast on community-board pin

**Modify:** `src/services/firebase/db.ts`, `src/hooks/useAuth.ts`.

- [ ] Add broadcast runner to `dbService`:

```ts
async runAnnouncementBroadcast(postId: string, post: BoardPost): Promise<void> {
  const postRef = doc(db, 'messageBoards', COMMUNITY_GATHERING_ID, 'posts', postId)
  const members = await this.getGatheringMembers(COMMUNITY_GATHERING_ID)
  const targets = members.map(m => m.id).filter(uid => uid !== post.pinnedBy)
  if (targets.length === 0) {
    await updateDoc(postRef, { announcementBroadcastStatus: 'sent', broadcastCompletedAt: serverTimestamp() })
    return
  }
  const title = `New announcement: ${(post.content || '').replace(/<[^>]+>/g, '').slice(0, 60)}`
  const now = serverTimestamp()
  for (let i = 0; i < targets.length; i += 450) {
    const batch = writeBatch(db)
    targets.slice(i, i + 450).forEach(uid => {
      batch.set(doc(db, 'notifications', `announce_${postId}_${uid}`), {
        userId: uid, type: 'announcement' as const,
        title, message: '', link: '/home',
        read: false, createdAt: now,
      })
    })
    await batch.commit()
  }
  await updateDoc(postRef, { announcementBroadcastStatus: 'sent', broadcastCompletedAt: serverTimestamp() })
},
```

- [ ] Update `pinPost` (from Task 2) so when `isCommunity`, after the pin write it re-reads the post and fires `this.runAnnouncementBroadcast(postId, refreshed.data() as BoardPost).catch(...)`. The broadcast is fire-and-forget — pin still resolves cleanly.

- [ ] Add the silent-resume helper:

```ts
async resumePendingAnnouncements(): Promise<void> {
  const pending = await getDocs(query(
    collection(db, 'messageBoards', COMMUNITY_GATHERING_ID, 'posts'),
    where('pinned', '==', true),
    where('announcementBroadcastStatus', '==', 'pending')
  ))
  for (const s of pending.docs) {
    await this.runAnnouncementBroadcast(s.id, s.data() as BoardPost)
      .catch(err => console.error('[db] resume broadcast failed', s.id, err))
  }
},
```

- [ ] In `src/hooks/useAuth.ts`, once the user doc is loaded and `role === 'admin'`, call `dbService.resumePendingAnnouncements()` fire-and-forget. Guard with a module-level `let resumedThisSession = false` flag so it only runs once per page load.
- [ ] `npm run typecheck && npm run build` → pass. Commit: `feat(announcements): broadcast on community-board pin`.

---

### Task 9: UI — pin/unpin menu, pinned badge, sort

**Modify:** `src/components/groups/BoardPost.tsx`, plus the consumer that renders the posts list.

- [ ] Import `Megaphone`, `Pin` from `lucide-react`. Import `usePinPost`, `useUnpinPost`.
- [ ] At the top of `BoardPost`, compute auth context:

```tsx
const isCommunity = gatheringId === COMMUNITY_GATHERING_ID
const isHost = !!user && (
  user.role === 'admin' ||
  (user.hostedGatherings ?? []).includes(gatheringId) ||
  gathering?.hostId === user.id
)
const canPin = isCommunity ? user?.role === 'admin' : isHost
const pinPost = usePinPost()
const unpinPost = useUnpinPost()
const pinLabel = post.pinned
  ? (isCommunity ? 'Unpin announcement' : 'Unpin')
  : (isCommunity ? 'Pin as announcement' : 'Pin to top')
```

- [ ] In the existing dropdown menu (where Report / Delete live), render `{canPin && <button onClick={...}>{pinLabel}</button>}`. The onClick toggles via `pinPost.mutate({ gatheringId, postId: post.id, userId: user!.id })` or `unpinPost.mutate({ gatheringId, postId: post.id })`. Match the existing menu-item styling.
- [ ] At the top of the post card body, render the pinned badge:

```tsx
{post.pinned && (
  <div className={cn(
    'inline-flex items-center gap-1 text-xs font-medium mb-2 px-2 py-0.5 rounded-full',
    isCommunity ? 'bg-terracotta-100 text-terracotta-700' : 'bg-cream-dark text-text-light'
  )}>
    {isCommunity ? <Megaphone size={14} /> : <Pin size={14} />}
    {isCommunity ? 'Announcement' : 'Pinned'}
  </div>
)}
```

For community pins, add `border-l-4 border-terracotta-300` conditionally to the post card wrapper. Verify terracotta tokens against `src/styles/app.css`; substitute the closest existing shade if a specific number isn't defined.

- [ ] In the consumer that maps over `posts` (grep for the community-board section in `HomePage.tsx` and `GroupDetailPage.tsx`), sort: pinned first by `pinnedAt` desc, then unpinned by existing `createdAt` order. Implement client-side after fetch.
- [ ] `npm run dev`, verify visually on the homepage community board. Then `npm run typecheck && npm run build` → pass. Commit: `feat(ui): pin/unpin + pinned badge on board posts`.

---

### Task 10: NotificationPanel — megaphone + cache-key fix

**Modify:** `src/components/layout/NotificationPanel.tsx`, `src/hooks/useNotifications.ts`.

- [ ] In `getNotificationIcon` add `case 'announcement': return <Megaphone size={18} />`. Add `Megaphone` to the lucide import line.
- [ ] In `useNotificationsSubscription` (useNotifications.ts:33), inside the `onSnapshot` callback, after `queryClient.setQueryData(notificationKeys.unread(userId), notifications)`, add: `queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) })`.
- [ ] `npm run typecheck && npm run build` → pass. Commit: `fix(notifications): panel real-time refresh + megaphone icon`.

---

### Task 11: Firestore rules

**Modify:** `firestore.rules`.

- [ ] In `firestore.rules`, find the `match /messageBoards/{boardId} { match /posts/{postId} { ... }` block (~line 308). ADD (don't replace) this update clause alongside the existing author/admin update rule:

```
allow update: if isAuthenticated() && isActive()
  && (isAdmin() || isHostOfGathering(boardId))
  && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['pinned', 'pinnedAt', 'pinnedBy',
                 'announcementBroadcastStatus', 'broadcastCompletedAt']);
```

(`boardId == gatheringId` by convention. `isHostOfGathering` exists at firestore.rules:61.)

- [ ] Replace the notification create rule at firestore.rules:350 with:

```
allow create: if isAuthenticated() && isActive()
  && request.resource.data.userId != request.auth.uid
  && (request.resource.data.type != 'announcement' || isAdmin());
```

- [ ] **Pause and confirm with Joel before running** `firebase deploy --only firestore:rules` — rules deploys go straight to live.
- [ ] Commit: `feat(rules): pin updates + announcement create guard`.

---

### Task 12: Dogfood verification

Manual checks — tick each pass.

**Notifications sweep:**
- [ ] A comments on B's post → B's bell shows "A commented on your post".
- [ ] A replies to one of B's comments → B's bell shows "A replied to your comment".
- [ ] A RSVPs Yes to event B created → B's bell shows "A RSVP'd to …".
- [ ] Admin edits an event's time → every Yes/Maybe RSVPer sees "… was updated".
- [ ] Admin adds member X to a non-community group → X sees "You were added to …".
- [ ] Open notification panel, leave open, fire a new notification from another account → appears live without reopening.

**Pinning + announcements:**
- [ ] Admin pins a community post → Megaphone badge + terracotta left border; post sorts to top.
- [ ] All other community members receive an `announcement` notification within seconds.
- [ ] Browser web push fires for backgrounded tabs (with permission granted).
- [ ] Unpin → badge gone, post drops to chronological position; existing notifications remain.
- [ ] Group host pins inside their own group → neutral "Pinned" badge, no fan-out.
- [ ] Non-admin tries to pin on community board → menu item absent; manual write attempt rejected by rules.
- [ ] Set `announcementBroadcastStatus: 'pending'` on a pinned post via console, reload as admin → silent resume completes; deterministic IDs prevent duplicates.

- [ ] `npm run lint` and triage anything blocking. Then `firebase deploy --only hosting,firestore:rules`.

---

## Notes for the executing agent

- **Best-effort fan-out.** Every notify call is wrapped in `.catch(err => console.error(...))`. Never let a failed notify unwind the user's action.
- **No Cloud Functions.** All notification writes are client batches.
- **No test framework.** Verification is typecheck + build + the Task 12 dogfood matrix.
- **Reuse `isCommunityGathering`** helper (already in db.ts) where you need the community-board check.
- **Variable names in code blocks** match the function context they're being inserted into — read the surrounding code first and adapt the names that don't already exist.
