# Portal Backend Audit — Issues Found

## Critical: Broken Login Flow

### 1. Missing Firestore User Document (Darryl account)
- **Auth UID**: `0Vaax9lGUoT1CUyxpoUBlUajfiE2` (joel.tempero@icloud.com / "Darryl Tempero")
- Firebase Auth has this user, but NO corresponding document in `users/` collection
- After login, `useAuth` calls `dbService.getUser(uid)` → returns `null` → user state is null → app treats user as unauthenticated even though Firebase Auth succeeded
- **Fix**: Create the Firestore user document, or add a fallback in `useAuth` that creates it on first login if missing

### 2. Auth State Race Condition
- `useAuthStore` persists user to localStorage (`kiwichurch-auth`)
- On page load: Zustand hydrates stale user from localStorage → `isAuthenticated = true` briefly
- Then `onAuthStateChanged` fires → fetches fresh Firestore data → may flip to null if doc missing
- This causes a flash of authenticated UI before redirect to login
- **Fix**: Don't derive `isAuthenticated` from persisted state alone. Wait for `onAuthStateChanged` to resolve before rendering protected routes.

### 3. `enableIndexedDbPersistence` is Deprecated
- `config.ts:24` uses `enableIndexedDbPersistence(db)` — this was deprecated in Firebase 9 and removed in later versions
- Should migrate to `initializeFirestore(app, { localCache: persistentLocalCache(...) })`
- Currently functional but will break on next Firebase SDK bump

## High: Data Integrity Issues

### 4. Events Have Stale/Test Data
- All events are from January 2026 (4+ months old)
- Many "Digging Deeper" duplicates with identical `recurringId` — recurring event generation created many instances with dates spread across 2026
- The homepage "upcoming events" widget uses `startDate: today` filter, so these old events won't show — but the Events page may show a long backlog
- **Fix**: Clean up old events. Consider whether recurring events should auto-expire or have an end date.

### 5. `getUserGatherings` is O(n) Firestore Reads
- `db.ts:186-199`: Fetches ALL gatherings, then loops through each one doing a `getDoc` on the members subcollection
- For 6 gatherings this is 7 reads per call. Will scale badly.
- **Fix**: Store gathering membership as an array on the user document, or use a `collectionGroup` query on members where userId matches.

### 6. No Gathering Membership for Auth Users
- The Host account (`FKiVNFNG2JRpvbQlpYrK2ZnkVTQ2`) has `assignedGatherings: ["gathering-5", "gathering-3"]` in user doc but that field isn't used anywhere in the code
- Actual membership is checked via `gatherings/{id}/members/{userId}` subcollection documents
- These two systems are out of sync — the user doc field is decorative
- **Fix**: Either use `assignedGatherings` array for quick lookup (and keep subcollection for security rules), or remove the field

## Medium: Security & UX

### 7. Firestore Security Rules — `isInitialSetup()` Still Active
- Rules check `!exists(/databases/$(database)/documents/settings/setup)` in many places
- If this document doesn't exist (check needed), anyone authenticated could create gatherings, seed posts, etc.
- **Investigate**: Does `settings/setup` exist? If not, the initial-setup backdoor is wide open.

### 8. Open Registration
- Anyone can create an account via the "Request Account" form → `authService.signUp` → creates auth user + Firestore doc with role `member`
- No approval flow, no invite codes, no admin notification
- The button says "Request an account" but actually creates one immediately
- **Fix**: Either add an approval queue (set status to `pending`, admin approves), or rename the button to "Create Account" if open reg is intentional

### 9. Username Login Lookup Leaks Existence
- `signIn()` checks username via `getUserByUsername` → queries `usernames/` collection
- If username not found: throws "Username not found" (distinct from wrong password error)
- Allows enumeration of valid usernames
- **Fix**: Return generic "Invalid email or password" for both cases

### 10. No Rate Limiting on Client
- Password attempts, registration, and password reset have no client-side throttling
- Firebase Auth has its own `auth/too-many-requests` but only after many attempts
- Contact form (`contactMessages` collection) allows unlimited public writes with no captcha
- **Fix**: Add reCAPTCHA to registration and contact form. Consider client-side attempt counting.

## Low: Cleanup

### 11. `deactivated` Status Not Enforced
- User `j.tempero@middleton.school.nz` has `status: "deactivated"` in Firestore
- But security rules don't check status — a deactivated user can still sign in and access everything
- **Fix**: Add `&& getUserData().status != 'deactivated'` to the `isAuthenticated()` helper in rules, or delete the Firebase Auth account when deactivating

### 12. Duplicate ID Field in Gatherings
- Gathering documents have both a Firestore doc ID (`gathering-1`) AND a `fields.id` field with the same value
- The `docToObject` helper already adds `id` from `doc.id` — the stored field is redundant and could diverge
- **Fix**: Remove the `id` field from gathering documents

### 13. `console.log('[Firebase] Initialized successfully')` in production
- `config.ts:40` — ships to users in production build
- **Fix**: Remove or wrap in `import.meta.env.DEV` check

---

## Page-by-Page Functionality Audit

### HomePage (`/home`)
- **Upcoming events**: Fetches next 21 days via `useUpcomingEvents(3)`. With all events from Jan 2026, this returns empty. Homepage will always show "No upcoming events" empty state until fresh events are created.
- **Kete posts**: `usePublishedKetePosts(2)` — filters by `published == true`. If no published posts exist, shows empty state.
- **Admin section**: Shows "Manage Events" and "Directory" links for admin/host. Only checks role, no route guards beyond this conditional render.

### EventsPage (`/events`)
- **Date range**: Queries 3 months ahead from today. Old events from Jan 2026 won't appear (correct).
- **Calendar view vs list view**: Persisted in `useUIStore`. CalendarView component imported but not audited in detail.
- **RSVP flow**: EventModal handles RSVPs with yes/no/maybe + attendees + guest count. Uses subcollection per event.
- **Potential issue**: No pagination — if 100+ events exist in a 3-month window, all load at once.
- **Missing**: No way to delete past events from the UI unless you're on the Hosting/admin page.

### GroupsPage (`/groups`) + GroupDetailPage (`/groups/:groupId`)
- **Membership gating**: Private gatherings check `isMember` before showing post form, but the post *list* is always visible to any authenticated user (security rules do enforce read access, so this would fail silently with a Firestore permission error rather than showing a UI message).
- **Message board**: Real-time subscription via `onSnapshot`. Posts limited to 50. No pagination or "load more."
- **Post creation**: Requires gathering membership for private groups (enforced by security rules). @mentions encode as `@[Name](userId)` in content.
- **Poll creation**: Inline in post form. 2-5 options. Votes stored as `poll.votes.{userId}: optionIndex` — a single user can only vote once (update overwrites). No vote retraction in UI.
- **Reactions**: Toggle emoji per user. Stored as `reactions.{emoji}: [userId, ...]`. The `addReaction` method does a read-then-write — not atomic, race condition possible if two users react simultaneously.
- **Join/Leave**: Any authenticated user can join a public gathering. Private gatherings should only allow admin/host to add members — but `joinGathering` in db.ts just writes directly. Security rules allow if `isPublicGathering` or admin/host, but the *member* joining a private group on their own would pass `isMemberOfGathering` check... which requires they already be a member. Circular — effectively private groups can't be self-joined. Good.
- **Comments**: Real-time subscription only activates when comments are expanded (lazy). Inline replies are flat with quote reference.

### KetePage (`/kete`) + KetePostPage (`/kete/:postId`)
- **Public reads**: Firestore rules allow `read: if true` on kete collection — anyone can read without auth. But the React app requires auth to view the page (route guard). Mismatch means SEO bots can't reach Kete content through the SPA.
- **Rich text editor**: Uses Quill 1.3.7. Content stored as HTML, rendered with `DOMPurify.sanitize()`.
- **Create/Edit**: Only admin/host can create. The `authorId` must match the authenticated user (enforced in rules + client).
- **Comments**: Simple text, no rich text. Authenticated users can comment. Authors + admins can delete.
- **Potential issue**: `getKetePosts` filters by `published == true` then `orderBy('publishedAt', 'desc')`. This requires a composite index (published + publishedAt). If the index doesn't exist, queries will fail silently or throw.
- **Missing**: No edit post UI visible in KetePostPage — only create. Need to verify KetePage has an edit flow.

### DirectMessagesPage (`/messages`) + ConversationPage (`/messages/:conversationId`)
- **Conversation creation**: Uses deterministic ID (`[idA, idB].sort().join('_')`). Prevents duplicates. Good.
- **Member picker**: Loads ALL users via `dbService.getAllUsers()` when "new message" is clicked. No pagination. At 5 users this is fine; at 500 it won't be.
- **Messages**: Loads first 50 messages only (`limit(50)`). No "load more" for older messages. Long conversations will be truncated.
- **Real-time**: Both conversation list and individual messages use `onSnapshot` subscriptions. Unsubscribes on unmount.
- **Mark as read**: Calls `markConversationRead` on page open. Updates `lastReadAt.{userId}` timestamp.
- **DM notifications**: `createDmNotification` writes to notifications collection on send. But the notification `userId` != sender (correct), so security rule `allow create: if isAuthenticated() && request.resource.data.userId != request.auth.uid` passes.
- **Unread badge**: `useUnreadMessages` hook counts conversations where `lastMessage.createdAt > lastReadAt[userId]`. Shown on BottomNav and Sidebar.
- **Potential issue**: No message editing or deletion in the conversation UI. The security rules allow it (`senderId == request.auth.uid`), but no UI exposes it.

### ProfilePage (`/profile`)
- **Edit fields**: displayName, phone, bio. Photo upload via Firebase Storage.
- **Password change**: Requires current password (reauthentication). Good.
- **Dependants field**: Exists in user data (Test user has "Test Wife") but no UI to manage it on ProfilePage. It's in the security rules `affectedKeys` whitelist but appears unused.
- **Username**: Stored but no UI to change it on this page. `authService.setUsername` exists but isn't called from ProfilePage.

### GivingPage (`/giving`)
- Simple static content with bank details. No Firestore interaction. Renders fine.

### SettingsPage (`/settings`)
- Notification permission UI (Web Notifications API grant/deny).
- Dark mode toggle (localStorage only, confirmed not synced).
- No other settings visible.

### HostingPage (admin: `/hosting`)
- Event management (CRUD). Admin/host only.
- Recurring event creation with frequency options.
- **Potential issue**: Recurring event generation appears to create many individual event documents upfront (the Jan 2026 data shows 10+ "Digging Deeper" events spread across months). No end date or auto-cleanup.

### DirectoryPage (admin: `/directory`)
- Lists all users with role, status.
- Admin can change roles, deactivate users.
- **Issue**: Deactivation sets `status: "deactivated"` in Firestore but doesn't disable the Firebase Auth account. User can still log in.

### ModerationPage (admin: `/moderation`)
- Report queue with Pending/Reviewed/All tabs.
- Admin can review reports (change status).
- No action to actually remove reported content — just marks report as reviewed.
- **Missing**: "Take action" button that would delete the offending post or disable the user.

### UsersPage (admin: `/users`)
- Similar to DirectoryPage? Need to confirm overlap or if this is the same page under a different route.

---

## Cross-Cutting Issues

### 14. No Loading Gate on Protected Routes
- If Firestore user fetch fails (network error, missing doc), `user` stays null, `isAuthenticated` stays false
- The app redirects to `/login` — user sees login page despite having a valid Firebase Auth session
- No error message distinguishes "not logged in" from "logged in but user doc fetch failed"

### 15. Real-time Subscriptions Multiply Without Cleanup Awareness
- `AppLayout` mounts `useNotificationsSubscription` and `useConversationsSubscription` globally
- `GroupDetailPage` adds `useBoardPostsSubscription`
- `ConversationPage` adds `useMessagesSubscription`
- Each is an active Firestore listener. All correctly unsubscribe on unmount via `useEffect` cleanup.
- But if the user rapidly navigates between conversations or groups, there's a brief window where old and new subscriptions overlap. Low risk but worth noting.

### 16. No Offline Error Handling
- IndexedDB persistence is enabled (deprecated API), so reads from cache work offline
- But writes (posting, messaging, RSVP) will silently queue and apply when back online — or fail with no user feedback
- No "you're offline" indicator anywhere in the app
- **Fix**: Add a network status hook and show a banner when offline. Consider disabling write actions or showing pending state.

### 17. Firestore Index Requirements
- `getKetePosts(published=true)` + `orderBy('publishedAt', 'desc')` requires a composite index
- `getUserNotifications(unreadOnly=true)` uses `where('read', '==', false)` + `orderBy('createdAt', 'desc')` — also needs composite index
- `getEvents` with `startDate` + `endDate` + `orderBy('date')` — needs composite index
- If any of these indexes don't exist in production, the query fails with a console error and returns nothing
- **Fix**: Verify `firestore.indexes.json` covers all compound queries, or check Firebase Console for auto-suggested indexes

### 18. `getAllUsers()` Called in Multiple Contexts Without Caching Coordination
- DirectMessagesPage member picker calls `getAllUsers()` with queryKey `['directory']`
- DirectoryPage likely uses the same or similar query
- If these share the same key, TanStack Query deduplicates. If keys differ, duplicate fetches occur.
- With 5 users this is invisible. With 200+ it matters.

---

## Next Session Action Plan
1. **DONE**: `settings/setup` exists — initial-setup backdoor is closed
2. Create missing Firestore user doc for Darryl account (or delete the auth account)
3. Fix auth state race condition (add a loading gate before protected routes render)
4. Clean up stale event data (delete old recurring events)
5. Decide on registration flow: open vs approval queue
6. Address username enumeration (generic error message)
7. Add "load more" to messages (currently truncated at 50)
8. Verify composite Firestore indexes exist for all compound queries
9. Add moderation "take action" capability (delete post / disable user from report)
10. Add offline indicator + write-action awareness
11. Enforce `deactivated` status in security rules or disable auth account on deactivation
12. Remove `enableIndexedDbPersistence` before next Firebase SDK upgrade
