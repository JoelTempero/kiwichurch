# Announcements + Notifications Sweep — Design

**Date:** 2026-05-13
**Status:** Design approved, awaiting implementation plan.

## Why

Two related problems:

1. **Notifications panel is mostly empty for most users.** Of the nine notification types defined in `src/types/notification.ts`, only three actually fire anywhere in the codebase (`mention`, `direct_message`, `family_link`). The bell icon feels broken because the natural "someone replied / RSVP'd / updated an event" notifications never get written.
2. **No way to broadcast a church-wide message.** Admin needs to pin posts on the community board so they surface prominently for everyone, with a notification delivered to all members. This is the client's #2 ask ("Picky Client" / Phase 9 brief).

Solving both together because the announcement feature *is* a notification fan-out — they share the same pipeline.

## Scope

In scope:
- Pin/unpin on board posts. Admin can pin on the community board; admin + group hosts can pin on group boards.
- Pinning a community-board post broadcasts an `announcement` notification to all community-gathering members.
- Visual treatment: "Announcement" + Megaphone for community pins, "Pinned" + Pin icon for group pins. Pinned posts sort to the top of their board.
- Four new notification fan-out paths: new comment / reply on your post or comment, RSVP to event you host, event update or cancellation for events you've RSVP'd Yes/Maybe to, added to a group.
- Fix the notification panel cache-key mismatch so real-time arrivals appear without reopening the panel.
- Tighten the notification create rule so non-admins can't write `announcement`-type notifications.

Out of scope:
- Pin expiry / scheduled pins. Admin manually unpins.
- Per-category notification preferences (mute mentions etc.). Deferred.
- Cloud Functions / FCM. Everything is client-side batch writes, like the existing group-@mention fan-out.
- Mark-all-read button. Already exists.
- Author-can-pin-own-posts. Pinning requires admin or host role — pin = "endorsed."
- Notifying group members when a host pins inside a group. Group pins are visual sort only; no fan-out.
- Storing announcements in a separate collection. We extend `BoardPost`.

## Data model

### `src/types/gathering.ts` — `BoardPost`

```ts
interface BoardPost {
  // ...existing fields
  pinned?: boolean                         // already in the type; start using it
  pinnedAt?: Timestamp | Date              // new — drives sort order
  pinnedBy?: string                        // new — userId of pinner

  // Only set on community-board pins; tracks fan-out idempotency
  announcementBroadcastStatus?: 'pending' | 'sent'
  broadcastCompletedAt?: Timestamp | Date
}
```

Sort order on board feeds becomes: pinned posts (by `pinnedAt` desc), then unpinned (by `createdAt` desc). Implemented in the existing `useBoardPosts` hook's client-side sort — no new Firestore index needed.

### `src/types/notification.ts` — `NotificationType`

```ts
| 'announcement'           // megaphone icon, terracotta in panel
```

Add to `getNotificationIcon` switch in `NotificationPanel.tsx`: `Megaphone` from Lucide.

### `src/types/gathering.ts` — `BoardComment`

Add one denormalised field so reply notifications don't require a second read of the parent comment:

```ts
interface BoardComment {
  // ...existing fields
  replyToAuthorId?: string  // new — set when replyToId is set; mirrors replyToAuthorName
}
```

Backfill: not needed. Existing replies without `replyToAuthorId` simply won't fire reply notifications (the path is best-effort and the trigger only matters going forward).

### Notification doc IDs

Announcements use deterministic IDs: `announce_${postId}_${userId}` (via `setDoc` not `addDoc`). Makes the fan-out idempotent — partial broadcasts can be safely re-run without producing duplicates. All other notification types continue using `addDoc` (auto-id).

## UI

### Pin/unpin button

Lives in the existing post menu on `BoardPost.tsx` (where Report / Delete / Edit already sit).

Visibility logic:
- **Community board** (`kiwi-church-community`): admin only. Label flips: "Pin as announcement" ↔ "Unpin announcement".
- **Group boards**: admin always; the gathering's host as determined by `isHostOfGathering` (either `gathering.hostId == user.id` OR `user.hostedGatherings.includes(gatheringId)`). Label flips: "Pin to top" ↔ "Unpin".
- Author of the post does not get the button unless they're also admin/host.

### Pinned post visual treatment

**Community pin** ("Announcement"):
- Top-left badge: small terracotta pill with `Megaphone` icon (16px) and the text "Announcement".
- Left border: 3px `border-l-terracotta-300` to anchor it visually as important.
- Sort position: above all unpinned posts, sorted by `pinnedAt` desc.

**Group pin** ("Pinned"):
- Top-left badge: small neutral pill with `Pin` icon (14px) and the text "Pinned".
- No border accent.
- Sort position: above all unpinned posts on the same board, by `pinnedAt` desc.

Both use the existing card chrome — no separate component. The badge is rendered inline at the top of the post body.

### Homepage

The existing community-board section continues to render the top posts from `kiwi-church-community`. Pinned posts naturally appear at the top because of the new sort. No new "Announcements" section — the Megaphone badge does the visual work.

### NotificationPanel

- `Megaphone` icon for `announcement` type (terracotta tint to match the badge).
- Title format: `"New announcement: <first 60 chars of post content>"`.
- Link: `/home` (the community board lives there).

## Notification fan-out

All five paths are best-effort: wrap in try/catch, log, never block the underlying action. `userId != request.auth.uid` invariant enforced (no notifying yourself). Suppression rules are explicit per path.

### 1. New comment / reply (extends `dbService.addBoardComment`)

When a comment is created:

- **If the comment is a top-level reply (`replyToId` is empty):** notify the post's `authorId`. Suppress when commenter == author.
- **If `replyToId` is set:** notify `replyToAuthorId` (the field we're adding to `BoardComment`). Suppress when commenter == replied-to author.

Paths are mutually exclusive (a comment either has `replyToId` or doesn't), so there's no double-notification.

Both write `type: 'new_comment'`. Title: `"X commented on your post"` or `"X replied to your comment"`. Message: comment snippet (80 chars). Link: board location (community → `/home`; other gathering → `/groups/{gatheringId}`).

### 2. RSVP to event you host (extends `dbService.setRSVP`)

When an RSVP is set to `'yes'` or `'maybe'`:

- Notify `event.createdBy`. (The Event type has no `hostId` — `createdBy` IS the event host in the current schema.)
- Suppress when RSVPer == `createdBy`.
- Suppress when `status == 'no'`.
- Suppress when the RSVP is an *update* that didn't change status (e.g., changing notes only). Detected by comparing the previous status against the incoming one — `setRSVP` already reads the existing doc.

`type: 'event_update'` (reusing existing type to avoid sprawl on the icon map). Title: `"X RSVP'd to <event title>"`. Message: empty or event date. Link: `/events/{eventId}`.

### 3. Event updated / cancelled (extends `dbService.updateEvent` and `updateEventSeries`)

When `time`, `endTime`, `location`, or `isCancelled` change:

- Query all RSVP docs under this event with `status in ['yes', 'maybe']`.
- Batch-write one `event_update` notification per RSVPer (chunked at 500 ops per batch).
- Title: `"<event title> was updated"` or `"<event title> was cancelled"`.
- Link: `/events/{eventId}`.
- For `updateEventSeries` "this and following": fan-out only fires for events whose key fields actually changed.

### 4. Added to a group (extends `dbService.ensureMembershipsForUser` and admin add-member flows)

When a user is added as a member to a gathering they weren't in before:

- Notify the added user.
- Suppress when `gatheringId == 'kiwi-church-community'` (auto-join is noise).
- `type: 'group_invite'`. Title: `"You were added to <gathering name>"`. Link: `/groups/{gatheringId}`.

### 5. Announcement broadcast (new `dbService.pinPost`)

Only fires when the gathering is `kiwi-church-community` AND the post is transitioning from unpinned to pinned. Flow:

1. **Pin write:** update the post doc with `{ pinned: true, pinnedAt: serverTimestamp(), pinnedBy: uid, announcementBroadcastStatus: 'pending' }`.
2. **Read members:** query `gatherings/kiwi-church-community/members` for all member docs (already done elsewhere; existing query).
3. **Chunked batch write:** for each chunk of up to ~450 members, build a Firestore batch where each op is `set(doc(db, 'notifications', \`announce_${postId}_${userId}\`), { ... })` with `userId != request.auth.uid` enforced client-side too. Commit each batch.
4. **Status flip:** update the post `{ announcementBroadcastStatus: 'sent', broadcastCompletedAt: serverTimestamp() }`.

If admin's tab dies between steps 1 and 4, the post stays `pending`. **Silent resume** on next admin session: app load (admin branch) queries `gatherings/kiwi-church-community/posts where pinned == true and announcementBroadcastStatus == 'pending'` and re-runs steps 2–4. The deterministic doc IDs make the re-run safely idempotent (`setDoc` with the same id overwrites identically).

Suppression for group-host pins: when `gatheringId != 'kiwi-church-community'`, skip the broadcast entirely — only the pin write happens.

### Notification panel cache-key fix (`src/hooks/useNotifications.ts`)

Today, `useNotificationsSubscription` writes pushed notifications to `notificationKeys.unread(userId)` but `NotificationPanel.tsx` reads from `notificationKeys.user(userId)` (the panel calls `useNotifications(userId, { limit: 20 })` with no `unreadOnly`). Real-time arrivals never appear in the open panel.

Fix: in the subscription's `onSnapshot` callback, additionally `queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) })`. The panel will refetch on the next render and pick up new arrivals. Cheap and keeps the two caches in sync.

### Web Notifications (browser tab push)

No new wiring. `useNotificationsSubscription` already calls `showNotification` for every new unread notification, so announcements (and all four new sweep paths) will trigger browser-level notifications when the tab is backgrounded for users who've granted permission.

## Security rules (`firestore.rules`)

### Board post pin updates

Within the existing `match /gatherings/{gatheringId}/posts/{postId}` block, add a clause:

```
allow update: if isAuthenticated() && isActive()
  && (isAdmin() || isHostOfGathering(gatheringId))
  && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['pinned', 'pinnedAt', 'pinnedBy',
                 'announcementBroadcastStatus', 'broadcastCompletedAt']);
```

This is *in addition to* the existing content-edit rules (author can edit own post content). Pinning by admin/host doesn't touch content — only the pin fields. The `hasOnly` clause guarantees a host can't sneak a content edit through the pin path.

### Notification creation

Tighten the existing rule (firestore.rules:350) so members can't spoof announcement notifications:

```
allow create: if isAuthenticated() && isActive()
  && request.resource.data.userId != request.auth.uid
  && (request.resource.data.type != 'announcement' || isAdmin());
```

All other existing constraints (read self-only, update only `read`/`readAt`, delete self) stay as they are.

## Edge cases

- **Re-pinning after unpin** broadcasts again. Acceptable — admins shouldn't unpin-then-repin without intent.
- **Unpinning does not retract notifications.** The notification stays in members' inboxes. Its link still deep-links to `/home`; the post just won't be visually pinned anymore.
- **Multiple admins pinning simultaneously** is safe — the post-doc update is atomic; the second admin's pin write is a no-op if `pinned: true` already.
- **`event_update` reuse:** RSVPs to your event and actual event field changes both use `type: 'event_update'` to avoid icon-map sprawl. The notification title distinguishes them. If this gets confusing in practice, splitting `rsvp_received` out later is mechanical.
- **`isHostOfGathering` check** already exists in `firestore.rules` per the 2026-05-13 host-scoping work. Reuses both legacy `gathering.hostId` and the newer `User.hostedGatherings` array.
- **Suppress noise:** added-to-group is suppressed for the community gathering since every member is auto-added there silently.
- **Pinning posts that have been deleted** — the menu only renders for live posts, so this isn't reachable via UI. Defensive: if the rule fires anyway, the update fails because `resource.data` doesn't exist.
- **Broadcast doc-id collision** (`announce_${postId}_${userId}`) — `postId` is a Firestore auto-id, globally unique. No collision risk.
- **Members list growth** — chunked at 450/batch leaves headroom under the 500-op Firestore limit. Kiwi Church scale (probably <200 members) fits comfortably in one batch.

## File touch list (estimated)

- `src/types/gathering.ts` — add `pinnedAt`, `pinnedBy`, `announcementBroadcastStatus`, `broadcastCompletedAt` to `BoardPost`.
- `src/types/notification.ts` — add `'announcement'` to `NotificationType`.
- `src/services/firebase/db.ts` — new `pinPost` / `unpinPost`; extend `addBoardComment`, `setRSVP`, `updateEvent`, `updateEventSeries`, `ensureMembershipsForUser` with fan-out; new helper `runAnnouncementBroadcast(postId)`; add the silent-resume sweep.
- `src/hooks/useNotifications.ts` — invalidate `notificationKeys.user(userId)` in the subscription callback.
- `src/hooks/useGatherings.ts` (or wherever board-post mutations live) — new `usePinPost` / `useUnpinPost` mutations.
- `src/components/groups/BoardPost.tsx` — pin/unpin menu item + pinned badge rendering. Authority gating based on admin/host status and gathering id.
- `src/components/layout/NotificationPanel.tsx` — `Megaphone` icon for `announcement`.
- `src/components/layout/AppLayout.tsx` or `useAuth` — silent resume of `pending` broadcasts on admin session start.
- `firestore.rules` — pin-fields update clause on board posts; announcement-type guard on notifications create.

## Out-of-scope follow-ups (parked, not part of this work)

- Per-category notification mute settings.
- Scheduled / expiring pins.
- A dedicated `/announcements` archive page.
- Splitting `rsvp_received` out of `event_update` once volume reveals whether the merged type is confusing.
- Cloud Functions to move fan-out server-side once Cloud Functions land in the project for other reasons.
