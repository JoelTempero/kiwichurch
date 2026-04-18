# Phase 2: Enhanced Group Message Boards

## Overview

Upgrade the existing forum-style group message boards to feel real-time and interactive. Three features: real-time comments, @mentions with notifications, and inline comment replies. The board structure (posts with nested comments) stays the same — this is an enhancement, not a replacement.

## Approach

**Enhanced forums, not chat rooms.** Church groups use boards for prayer requests, event planning, and updates — content that benefits from being a post with context. We make it feel alive without losing the structure.

## Feature 1: Real-Time Comments

### Current State
- Posts are already real-time via `subscribeToBoardPosts` (onSnapshot)
- Comments use `usePostComments` which fetches once and refetches on invalidation
- Adding a comment only appears for other users on their next visit/refresh

### Changes
- **New service method:** `db.subscribeToPostComments(gatheringId, postId, callback)` — onSnapshot listener on `messageBoards/{gatheringId}/posts/{postId}/comments`, ordered by `createdAt ASC`
- **New hook:** `usePostCommentsSubscription(gatheringId, postId)` — sets up listener, pushes updates into React Query cache via `queryClient.setQueryData`
- **Lazy subscription:** Only subscribes when comments are expanded in BoardPost (not on mount). Unsubscribes when collapsed or unmounted.
- **No limit needed:** Comments per post won't reach problematic sizes for a church community

### Pattern
Mirrors existing `subscribeToBoardPosts` / `useBoardPostsSubscription` exactly.

## Feature 2: @Mentions with Notifications

### Mention Input
- New `MentionInput` component — textarea that detects `@` keystroke
- Shows dropdown of group members filtered by typed text (uses existing `useGatheringMembers` hook)
- Arrow keys + Enter to select, Escape to dismiss
- Inserts `@DisplayName` into text, tracks userId internally
- On submit, extracts `mentions: string[]` (user IDs) from tracked selections

### Mention Storage
- `mentions` field added to both `BoardPost` and `BoardComment` types: `mentions?: string[]`
- Stored as array of user IDs alongside the post/comment content
- Display: mentions rendered as highlighted `<span>` elements in post/comment content

### Mention Markup
- Utility functions in `src/utils/mentions.ts`:
  - `encodeMentions(text, mentionMap)` — converts display text to storage format with user IDs: `@[DisplayName](userId)`
  - `decodeMentions(storedText)` — parses stored format back to display components
  - `extractMentionIds(storedText)` — returns array of mentioned user IDs

### Notification Creation
- **New service method:** `db.createMentionNotifications(mentionedUserIds, context)` — writes one notification doc per user to `notifications/{docId}`
- **Context includes:** `authorName`, `gatheringId`, `postId`, optional `commentId`, text snippet
- **Called from:** mutation hooks (`useCreateBoardPost`, `useAddPostComment`) after successful creation
- **Client-side writes** — no Cloud Functions needed. Security rules already allow authenticated users to create notifications.
- **Notification type:** `mention` (already defined in Notification type union)

### NotificationPanel Update
- Handle `type: 'mention'` with appropriate icon (AtSign from Lucide)
- Link navigates to group detail page: `/groups/{gatheringId}`

## Feature 3: Inline Comment Replies

### Data Model
- Two new optional fields on `BoardComment`:
  - `replyToId?: string` — the comment ID being replied to
  - `replyToAuthorName?: string` — denormalized display name (avoids extra fetch)

### UI Behavior
- Each comment gets a "Reply" text button
- Clicking sets reply state in BoardPost: shows "Replying to {name} x" indicator above the comment input
- Cancel (x) clears reply state
- Submitted comment includes `replyToId` + `replyToAuthorName`
- Replies stay **flat in the list** (not nested/indented) — keeps conversation scannable
- Reply comments display a small quoted reference above their content: grey left border with "↩ {authorName}: {first 60 chars}..." 

### Why Flat, Not Nested
Church group conversations are typically short threads. Nested indentation creates complexity for mobile UX and Firestore querying. A flat list with visual reply references (like Slack's inline replies or iMessage quotes) is simpler and more scannable.

## Data Model Changes

### BoardComment (src/types/gathering.ts)
```typescript
interface BoardComment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL: string
  content: string        // may contain @[Name](userId) markup
  mentions?: string[]    // user IDs mentioned
  replyToId?: string     // comment ID replied to
  replyToAuthorName?: string
  createdAt: Timestamp
}
```

### BoardPost (src/types/gathering.ts)
```typescript
interface BoardPost {
  // ... existing fields unchanged
  mentions?: string[]    // user IDs mentioned (new)
}
```

## File Changes

### New Files
- `src/components/common/MentionInput.tsx` — @mention-aware textarea component
- `src/utils/mentions.ts` — encode/decode/extract mention markup

### Modified Files
- `src/types/gathering.ts` — add mentions, replyToId, replyToAuthorName fields
- `src/services/firebase/db.ts` — add subscribeToPostComments, createMentionNotifications
- `src/hooks/useGatherings.ts` — add usePostCommentsSubscription, update mutations for notifications
- `src/components/groups/BoardPost.tsx` — real-time comments, reply UI, MentionInput, reply display
- `src/pages/GroupDetailPage.tsx` — swap textarea for MentionInput on post creation
- `src/components/layout/NotificationPanel.tsx` — handle mention notification type
- `firestore.rules` — verify notification creation rules
- `src/utils/schemas.ts` — update comment schema with reply/mention fields

### No New Dependencies
All features built with existing stack: React, Firestore onSnapshot, React Query, Lucide icons, Tailwind.

### No New Collections
- Comments stay at `messageBoards/{gatheringId}/posts/{postId}/comments/{commentId}`
- Notifications stay at `notifications/{docId}`
- No RTDB needed (presence/typing deferred to later phases)

## Security Considerations
- Mention notifications are created client-side — a user could theoretically spam notifications. Acceptable for a trusted church community; if abuse becomes an issue, move to Cloud Functions in Phase 4.
- Reply references are denormalized (author name stored on the reply). If a user changes their display name, old reply references show the old name. Acceptable trade-off vs extra reads.
- Mention markup is stored as `@[Name](userId)` — must be sanitized on render to prevent XSS. The decode function returns React elements, not raw HTML.

## Out of Scope (deferred)
- Typing indicators (needs RTDB — Phase 4+)
- Online presence (needs RTDB — Phase 4+)
- Reactions UI (data model exists, can be added later as a quick enhancement)
- Seen-by indicators (separate feature)
- Push notifications for mentions (Phase 4 — FCM + Cloud Functions)
- Email notifications (not planned)
