# Kiwi Church Community Platform - Design Spec

**Date:** 2026-04-17
**Status:** Draft - Awaiting Joel's Review
**Approach:** B - Modernise + Extend existing codebase

---

## Overview

Transform the existing Kiwi Church member portal into a full community platform. The client wants a private, multi-device communication hub for their dispersed church community — replacing fragmented tools (email, WhatsApp, Google Drive) with a single destination.

**Core principle:** The existing codebase already covers ~70% of requirements. We evolve it, not rebuild it.

---

## Architecture

### Stack (unchanged from existing)
- React 18 + TypeScript + Vite 6
- Firebase (Auth, Firestore, Storage, Hosting, Cloud Functions, RTDB)
- Zustand for client state
- TanStack Query for server state
- PWA via vite-plugin-pwa

### Stack additions
- **Tailwind CSS v4** — replacing the existing vanilla CSS (incremental migration)
- **react-hook-form + zod** — replacing manual form handling
- **clsx + tailwind-merge** — cn() utility for conditional classes
- **Lucide React** — replacing any inline SVGs
- **Firebase Cloud Functions** — for push notifications and server-side triggers
- **Firebase Realtime Database** — for presence and typing indicators only
- **Firebase Cloud Messaging (FCM)** — for push notifications

### Data layer
- **Firestore** remains the primary database for all persistent data
- **RTDB** used only for ephemeral real-time state (presence, typing indicators)
- **Existing collections preserved as-is:** users, usernames, userProfiles, events, gatherings, kete, notifications, settings
- **New collections:** conversations, reports, auditLog
- **Modified collections:** gatherings/messages (upgrade from board posts to real-time chat), gatherings/polls (new subcollection)

---

## Subsystems & Phasing

### Phase 1: Foundation Modernisation

**Goal:** Bring the codebase up to current Sidequest standards without changing functionality.

**Scope:**
- Install Tailwind v4, configure in vite.config.ts alongside existing CSS
- Add react-hook-form + zod, clsx + tailwind-merge, Lucide React
- Create cn() utility
- Migrate layout components first (AppLayout, AppHeader, BottomNav, DesktopSidebar)
- Migrate common components (Button, Modal, Toast, Badge, etc.)
- Add a DESIGN.md if Joel wants a design refresh
- Verify all existing features still work after migration

**Not in scope:** No new features. Pure modernisation.

**Success criteria:** All existing pages render correctly with Tailwind styling. Forms use react-hook-form + zod. Build passes with no regressions.

---

### Phase 2: Real-Time Group Chat

**Goal:** Upgrade group message boards from a forum-style post/comment system to a real-time chat experience.

**Data model changes:**
- Rename/restructure `messageBoards/{gatheringId}/posts` to `gatherings/{gatheringId}/messages`
- Add fields: threadId, threadCount, reactions (emoji -> userId[]), mentions, edited, editedAt
- Write a migration script for existing board post data

**Components:**
- `ChatView` — main chat area with infinite scroll (paginated message history), real-time new messages via onSnapshot
- `ChatInput` — message composer with file attachment, emoji picker, @mention autocomplete
- `MessageBubble` — individual message with reactions, thread indicator, edit/delete
- `ThreadPanel` — slide-out panel for threaded replies
- `EmojiPicker` — lightweight emoji selector for reactions
- `MentionAutocomplete` — user/group mention dropdown triggered by @

**Presence (RTDB):**
- `/presence/{userId}` — online status + last seen
- `/typing/{gatheringId}/{userId}` — typing indicator with auto-expiry
- `usePresence` hook — manages connection state
- `useTypingIndicator` hook — shows "X is typing..." in chat

**Unread tracking:**
- Per-user, per-gathering last-read timestamp stored in `gatherings/{gatheringId}/members/{userId}.lastRead`
- Unread count derived client-side by comparing lastRead with latest message timestamp

**Security rules:**
- Members of a gathering can read/create messages
- Authors can edit/delete their own messages within 15 minutes
- Admins/moderators can delete any message
- Pinning restricted to admins/hosts

---

### Phase 3: Direct Messaging

**Goal:** Add 1:1 private messaging between community members.

**Data model:**
```
conversations/{conversationId}
  participants: [uid1, uid2]     // sorted for consistent lookup
  participantMap: { uid1: true, uid2: true }  // for Firestore array-contains queries
  lastMessage: { content, senderId, timestamp }
  createdAt, updatedAt

  messages/{messageId}
    senderId, senderName, senderPhotoURL
    content, attachmentURL?, attachmentType?
    readBy: { userId: Timestamp }
    createdAt, editedAt?
```

**Components:**
- `InboxPage` — new page at /messages, list of conversations sorted by last activity
- `ConversationView` — reuses ChatView/ChatInput from Phase 2
- `NewConversationModal` — user picker to start a DM
- "Message" button on user profiles and directory entries

**Navigation:** Add "Messages" to bottom nav (mobile) and sidebar (desktop), with unread badge.

**Security rules:** Only participants can read/write their conversation and its messages.

---

### Phase 4: Notifications System

**Goal:** Push notifications for new messages, events, mentions, and admin announcements.

**Architecture:**
- Cloud Function triggers on: new message in gathering, new DM, new event, @mention, admin announcement
- Function checks recipient's notification preferences before sending
- FCM delivers push to mobile/desktop via service worker
- Web Notification API for in-browser alerts when app is open

**Token management:**
- Store FCM tokens in `users/{userId}/devices/{tokenHash}`
- Refresh tokens on each app load
- Clean up stale tokens on FCM send failure

**User preferences (extend existing):**
- Per-channel muting (mute a noisy group without leaving)
- Notification categories: messages, mentions, events, announcements
- Quiet hours (optional, post-launch)

**Components:**
- Complete the existing `NotificationPanel` component
- Notification permission prompt on first login
- Notification settings in existing Settings page

---

### Phase 5: Global Search

**Goal:** Search across all content types from one search bar.

**Implementation:** Client-side for v1. The community is small enough (<500 members) that client-side search is performant.

**Search targets:**
- Users (name, username, bio)
- Messages (content, within a date range)
- Events (title, description)
- Kete posts (title, content)
- Files (filename, associated message)

**Components:**
- Complete the existing `SearchPanel` overlay
- Search result cards per content type
- Filters: content type, date range, author, group
- Recent searches stored in localStorage

**Future:** If community grows past ~500, add Algolia via Firebase Extension.

---

### Phase 6: Polls & Engagement

**Goal:** In-group polling and structured announcements.

**Data model:**
```
gatherings/{gatheringId}/polls/{pollId}
  question, options[], multiSelect, anonymous, closesAt?
  createdBy, createdAt
  
  votes/{oderId}
    optionIds[], createdAt
```

**Components:**
- `PollCreator` — form for creating polls within a group
- `PollCard` — display poll with real-time vote counts, vote button
- `PollResults` — bar chart of results
- Polls appear inline in the group chat timeline

**Announcements:**
- Admins can broadcast to all groups or specific groups
- Announcements pinned at top of chat until dismissed
- Push notification for announcements (uses Phase 4 infrastructure)

---

### Phase 7: Moderation & Admin

**Goal:** Content moderation tools and audit trail for admin accountability.

**Report system:**
- Report button on any message, post, or comment
- Reports go to `reports` collection with status tracking
- Moderation queue page (admin only) to review and action reports
- Actions: delete content, warn user, suspend user, dismiss report

**Audit log:**
- All admin actions logged to `auditLog` collection
- Immutable (create-only, no updates or deletes)
- Viewable by admins in Settings or dedicated admin page

**Role extension:**
- Add `moderator` role between `host` and `member`
- Moderators can: delete messages, review reports, but cannot manage users or system settings

**User suspension:**
- Suspended users can log in but see a "your account is suspended" message
- All write permissions blocked in Firestore rules when user role is 'suspended'

---

### Phase 8: Polish & Launch Prep

**Goal:** Production-ready quality across the board.

**Tasks:**
- Complete Tailwind migration for any remaining vanilla CSS pages
- Mobile responsiveness audit (all new features)
- Accessibility audit per Accessibility playbook
- Security audit per Security playbook (Firestore rules, storage rules, Cloud Functions)
- Performance audit (bundle size, lazy loading, Firestore read counts)
- Error handling audit per ErrorHandling playbook
- Client testing invite with feedback collection
- Documentation for client admins

---

## In Scope (Joel's Decisions, 2026-04-17)

- **Guest access:** Plan for limited guest access from the start (token-based or invite links)
- **Google Calendar integration:** Assume this is wanted. Add iCal export and Google Calendar sync
- **Video uploads:** Small video uploads allowed (size-limited), but recommend links (YouTube, Vimeo) where possible. No server-side transcoding
- **Design refresh:** Create DESIGN.md. Current UI is "very AI template" — needs a creative refresh using the Creativity playbook
- **Static HTML pages:** Keep working for now. Website enhancement with creative playbook is a future phase

## Deferred to Post-Launch

- E2E encryption (massive complexity, not needed for a church community)
- 2FA (adds friction, can be made optional later)
- Migration of static HTML website into the portal (will use Creativity playbook when ready)
- Native mobile app wrapper (PWA is sufficient)
- Video transcoding

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Firestore read costs in busy chat | Medium | Medium | Pagination, onSnapshot (not polling), message bundling |
| Chat performance with many messages | Low | Medium | Virtual scrolling, paginated history, index on createdAt |
| Scope creep from client feedback | High | Medium | Clear phase boundaries, defer non-critical feedback to later phases |
| CSS migration regressions | Medium | Low | Incremental migration, test each page after conversion |
| Cloud Functions cold starts | Low | Low | Minimal functions, warm-up strategies if needed |

---

## Joel's Decisions (Resolved 2026-04-17)

1. **Approach:** B (modernise + extend). Confirmed.
2. **Chat architecture:** Firestore for messages + RTDB for presence/typing. Approved.
3. **1:1 DM model:** Conversations collection with sorted participant pair. Approved.
4. **Push notifications:** FCM via Cloud Functions. Approved.
5. **Search:** Client-side for v1, Algolia later if needed. Approved.
6. **CSS migration:** Incremental Tailwind v4 alongside existing CSS. Approved.
7. **Static HTML:** Keep, enhance later with Creativity playbook.
8. **Guest access:** Plan now (was deferred, now in scope).
9. **Calendar:** Assume Google Calendar integration.
10. **Video:** Small uploads allowed, recommend links. No transcoding.
11. **Design:** Create DESIGN.md, refresh the look.
12. **Budget/timeline:** No constraints.
13. **Cloud Functions:** Status unknown — need to check Firebase project.
14. **RTDB:** Status unknown — need to check Firebase project.

---

*This spec covers the full platform. Each phase will get its own detailed implementation plan before execution.*
