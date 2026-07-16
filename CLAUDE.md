# Kiwi Church Community Platform

## Overview
- **Client**: Kiwi Church
- **Type**: Community Platform / Portal / PWA
- **Status**: **2026-06-15** (DEPLOYED + pipeline verified live): (A) Fixed group/community **image posts** — composers required text so image-only was blocked, and a stalled mobile upload hung forever on Firebase's default 10-min `maxUploadRetryTime`. Now posts allow text/image/poll, show `Uploading X%`, fail fast at 45s, surface the real error. (B) Built + shipped a **Bug Report feature**: members file reports (description + optional multi-photo) from Profile/Settings; every report auto-captures diagnostics (route, device, build git-sha/time, last ~20 runtime/console errors via a boot-time `errorBuffer`); admins triage on `/bug-reports` (New/In-progress/Resolved/Won't-fix + notes); Claude reads them via Firebase MCP incl. photos and closes the loop. **Verified end-to-end**: Joel filed 2 real reports → Claude queried them via MCP, downloaded + viewed the screenshots, fixed both, deployed, and marked them resolved with notes. (C) Actioned those 2 reports: portal base font 16→17px (rem-wide ~6% bump) + 'No events'/tabs enlarged; conversation empty-state top-aligned (killed the big header/input gaps) + message placeholder enlarged & darkened. `bugReports(status, createdAt desc)` index is READY. **Previously 2026-06-04**: second tester-feedback pass — 5 deploys. (1) Notifications now populate — root cause was a missing `notifications(userId, createdAt desc)` composite index; the panel fetches ALL notifications (read+unread) but only the unread index existed. (2) Notification + search panels were un-closable on mobile: they rendered at `z-50`, *below* the legacy chrome (header z-100, nav z-1000), so the header occluded the close buttons and nav punched through. Lifted to `z-[2000]` + auto-close on route change. Panel also hardened (defensive dates, real error state). (3) Directory is now opt-in: `listInDirectory` privacy flag (default off) filters directory/search/DM-picker/family-picker; NO admin bypass (admins use the Settings roster). (4) Comment/mention notifications deep-link to the exact post (`?post=id` → scroll + auto-open comments); comment counts now show on collapsed posts (were hidden, making it look like no comments existed); posts are distinct cards with nested comments. (5) Settings user list compacted + search-first. **Previously 2026-05-28**: first batch of tester feedback. Six fixes: family picker cap lifted (was cutting off at letter G with 60 seeded users), notifications panel close UX (back-arrow + bigger X close), Visit Website link in 3 spots — desktop sidebar footer, ProfilePage list, and a mobile Globe icon in the AppHeader between Directory and Bell. Settings opened up to all users (was admin-only) + reachable on mobile via new ProfilePage link. DM composer is now an auto-growing textarea (1→6 rows then scrolls, Shift+Enter for newline). Pete + Cass (Peter & Cassandra Down) promoted to Kirwee hosts via Firebase MCP. **Previously 2026-05-21**: live data wiped + reseeded from client's actual spreadsheet. 18 groups + 61 user accounts live with shared test password `freedom`. HomePage banner prompts each tester to change their password. Settings has Delete-user (soft delete) and `delete-user` CLI for hard purge. Deactivated users auto-signed-out on next login. Group/Login titles rendered white on dark headers. Previously: all council deploy-blockers fixed, privacy mirror, pending-approval, host scoping, family link system, recurring events, announcements + notification sweep, per-category notification prefs, drag-and-drop uploads, force-refresh, PWA install prompt, group member management UI, Kete public/members-only toggle, Board/Files tabs on home page, Excel seed template + CLI.

## Playbooks In Use
Read these from the Brain folder at session start. Do not copy into this project.
Brain playbooks: `D:/Sidequest Digital/Dev Projects/Brain/playbooks/`

- `playbooks/JoelTempero.md` — working profile (always)
- `playbooks/TokenDiscipline.md` — token cost hygiene (always)
- `playbooks/CMS-Portal-Backend.md` — React + TS + Vite + Firebase portal build
- `playbooks/DesignSystem.md` — design contract workflow
- `playbooks/Security.md` — pre-launch security audit
- `playbooks/Testing.md` — testing strategy
- `playbooks/ErrorHandling.md` — error boundaries, try/catch, offline handling
- `playbooks/Accessibility.md` — WCAG 2.1 AA
- `playbooks/Deployment.md` — Firebase Hosting deployment

## Design
Read and obey `DESIGN.md` before writing any UI code. It defines the full visual contract: palette, typography, components, layout principles, and do's/don'ts. Update DESIGN.md first when Joel gives design feedback, then change components.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite 6
- **State**: Zustand 5, TanStack Query 5
- **Backend**: Firebase 11 (Auth, Firestore, Storage, Hosting)
- **Editor**: Quill 1.3.7 (rich text for Kete posts)
- **PWA**: vite-plugin-pwa
- **Fonts**: Cormorant Garamond + Nunito Sans
- **Theme colour**: #1a3a2f (dark forest green)

## Build & Dev Commands
- Dev server: `npm run dev`
- Build: `npm run build` (tsc + vite build)
- Preview: `npm run preview`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Deploy: `firebase deploy` (deploys from dist/)

## Code Conventions
- Feature-based folder structure under src/components/
- One page component per route in src/pages/
- Service layer in src/services/ for Firebase operations
- Zustand stores in src/store/
- Custom hooks in src/hooks/
- Types in src/types/
- camelCase variables/functions, PascalCase components/types

## Project Structure
- Root contains static HTML pages (about.html, calendar.html, etc.) — public-facing church website
- src/ contains the React member portal (SPA mounted at index.html)
- Firebase Hosting serves from dist/ with SPA rewrites
- Emulators configured: Auth (9099), Firestore (8080), Storage (9199), Hosting (5000)

## Current Progress
- Portal app fully built with 16 pages, 28 components, full service layer, hooks, types, stores
- Auth system complete (email/password, username, role-based)
- Events + RSVPs, Groups + message boards, Kete (blog), Directory, Giving, Admin tools all functional
- Firebase security rules comprehensive (role-based per collection)
- PWA with service worker, offline persistence, install prompt
- Tailwind v4 fully migrated — all components, pages, and forms use Tailwind utilities
- All forms use react-hook-form + zod validation (schemas in src/utils/schemas.ts)
- Legacy CSS cleaned up — index.css reduced from 3,386 to 35 lines (loading styles only)
- styles.css (3,133 lines) still contains structural layout CSS (grid, sidebar, bottom-nav) — load-bearing
- Group message boards upgraded with real-time comments, @mentions with notifications, and inline replies
- Direct messaging system complete with real-time 1:1 conversations, @mentions, unread tracking
- Web Notifications API for browser-level alerts when tab is backgrounded
- Polls and emoji reactions on group message boards
- Content reporting and moderation queue for admins/hosts
- Admin-pinnable community announcements with notification broadcast to all members (deterministic IDs + silent resume on admin app load)
- Four notification fan-out paths firing live: new comment / reply on your stuff, RSVP to event you host, event time/location/cancel update, added to a group
- Per-category notification preferences in Settings (7 toggles: announcements, mentions, comments, event updates/RSVPs, group adds, DMs, family links). Recipient-side filtering only
- Force-refresh button in Settings (unregisters service workers + clears caches + reload) for stale-deploy recovery
- Drag-and-drop image upload on community + group post composers; drag-and-drop file upload on group resources modal (`useFileDrop` hook)
- PWA install prompt (Chrome/Android beforeinstallprompt + iOS "Tap Share → Add to Home Screen" hint), explicit apple-touch-icon size hints
- `lazyWithRetry` hardened to unregister SWs + clear caches before reloading, so a stale-chunk failure actually recovers instead of looping
- No Cloud Functions yet. FCM deferred — Web Notifications API covers v1 use case

## Next Steps
- [x] **Phase 1: Foundation modernisation** (COMPLETE — DESIGN.md deferred to design phase)
  - [x] Install Tailwind v4 + clsx + tailwind-merge + Lucide React + react-hook-form + zod + @hookform/resolvers
  - [x] Configure Tailwind v4 in Vite alongside existing CSS (`src/styles/app.css` with `@theme` block)
  - [x] Create cn() utility (`src/utils/cn.ts`)
  - [x] Migrate layout components to Lucide icons (AppHeader, BottomNav, DesktopSidebar) — kept structural CSS class names for grid layout compat
  - [x] Migrate common components to Tailwind + cn() (Button, Modal, Toast, Badge, Avatar, EmptyState, Skeleton, PullToRefresh)
  - [x] Migrate all 13 pages to Tailwind + Lucide
  - [x] Migrate all sub-components to Tailwind + Lucide
  - [x] Swap forms to react-hook-form + zod (LoginPage, ProfilePage, EventForm, KeteForm, GroupForm, BoardPost comments, EventModal RSVP)
  - [x] Clean up old CSS — index.css reduced from 3,386 → 35 lines; all form-* classes replaced with Tailwind
  - Note: DESIGN.md creative refresh belongs to the static HTML site work, not portal phases
- [x] **Phase 2: Real-time group chat** (COMPLETE)
  - [x] Real-time comments via Firestore onSnapshot (lazy subscription — only when comments expanded)
  - [x] @mentions with MentionInput component (textarea with @autocomplete dropdown)
  - [x] Mention markup: `@[DisplayName](userId)` stored in content, rendered as highlighted spans
  - [x] Client-side mention notifications (batch write to notifications collection)
  - [x] Inline comment replies (flat with visual quote references, not nested)
  - [x] Member profile enrichment for mention dropdown (fetches displayName from users collection)
  - [x] New files: `src/utils/mentions.ts`, `src/components/common/MentionInput.tsx`
  - [x] Modified: types, db service, hooks, BoardPost, GroupDetailPage
- [x] **Phase 3: Direct messaging** (COMPLETE)
  - [x] `Conversation` and `DirectMessage` types with denormalized `lastMessage` for inbox preview
  - [x] Deterministic conversation IDs: `[idA, idB].sort().join('_')` — deduplicates conversations
  - [x] DB service: `getOrCreateConversation`, `sendMessage` (batch write: message + lastMessage update), `markConversationRead`, real-time subscriptions
  - [x] TanStack Query hooks: `useConversations`, `useMessages`, `useSendMessage`, `useMarkConversationRead` + subscription hooks
  - [x] `DirectMessagesPage`: conversation list with unread badges, time formatting, member picker for new conversations
  - [x] `ConversationPage`: chat bubble UI, @mentions via MentionInput, date separators, auto-scroll, mark-as-read on open
  - [x] Routes: `/messages` and `/messages/:conversationId` (lazy loaded)
  - [x] Navigation: Messages (MessageCircle) added to BottomNav (replaced Profile) and DesktopSidebar
  - [x] Firestore security rules: conversations collection with participant-only access, messages subcollection
  - [x] Fixed notification create rule to allow client-side writes (was `allow create: if false`)
  - [x] DM notification: recipient gets notified on new message
  - New files: `src/types/directMessage.ts`, `src/hooks/useDirectMessages.ts`, `src/pages/DirectMessagesPage.tsx`, `src/pages/ConversationPage.tsx`
- [x] **Phase 4: Notifications** (COMPLETE)
  - [x] Activated real-time notification subscription in AppLayout (was defined but not called)
  - [x] Added `direct_message` type to NotificationPanel icon map
  - [x] Web Notifications API: browser-level notifications when tab is backgrounded
  - [x] Settings page: real notification permission UI (enable/blocked/granted states)
  - [x] New file: `src/utils/webNotifications.ts`
- [x] **Phase 5: Global search** (COMPLETE — already built)
  - [x] SearchPanel with debounced search across events, kete, groups, users
  - [x] Ctrl+K keyboard shortcut, Escape to close
  - [x] Already fully functional from prior work
- [x] **Phase 6: Polls & engagement** (COMPLETE)
  - [x] Poll creation in group post form (2-5 options)
  - [x] Poll display with percentage bars, one vote per user
  - [x] 6 emoji reactions (❤️ 🙏 👍 😂 🎉 😢) with toggle and counts
  - [x] Service methods: `votePoll`, `addReaction` (toggle)
  - [x] `BoardPoll` type added to gathering.ts
- [x] **Phase 7: Moderation & admin tools** (COMPLETE)
  - [x] Report type with reason, status, target tracking
  - [x] `ModerationPage` for admins/hosts with Pending/Reviewed/All tabs
  - [x] Report service methods and TanStack Query hooks
  - [x] Firestore security rules for reports collection
  - [x] Moderation nav item in admin sidebar
  - [x] Report button + ReportModal on BoardPost menu (any user can report others' posts)
  - [ ] Member blocking (deferred)
- [x] **Phase 8: Polish & launch prep** (COMPLETE)
  - [x] Fixed manifest.json start_url (./portal.html → /)
  - [x] Fixed manifest shortcut URLs
  - [x] Accessibility: skip-to-main link, h1 on all pages, focus:ring on Button, aria-current on nav
  - [x] styles.css audited: 3,133 → 2,775 lines, dead CSS removed, deduped, section markers added
  - [x] Unread message count badge on BottomNav + DesktopSidebar (real-time via conversations subscription)
- [ ] **Workstream B: Static website redesign**
  - [x] Creative direction: Editorial Flow archetype, intensity 2-3 (per Creativity playbook)
  - [x] Design spec: DESIGN.md at project root (palette, typography, components, layout, creative direction)
  - [x] Create implementation plan (docs/superpowers/plans/2026-04-19-workstream-b-static-site-redesign.md)
  - [x] Rewrite css/styles.css to match DESIGN.md tokens (Source Sans 3, warm palette, new shadows)
  - [x] Revitalise homepage (homepage.html — new editorial homepage with hero, pull quote, CTAs)
  - [x] Redesign about.html, communities.html, calendar.html, kete.html, resources.html, giving.html
  - [x] Shared header/footer matching DESIGN.md across all static pages
  - [x] Scroll reveal animations (fade-up, staggered cards, image hover zoom, reduced motion support)
  - [x] Kete rich text editor integration (DOMPurify + Quill) — portal-side fix
  - [x] Firebase hosting rewrite for homepage.html at root URL
  - [x] ~~BLOCKER: Static files not in dist/~~ — resolved with vite-plugin-static-copy
  - [x] Configure Vite to copy static HTML pages + css/ + js/ + images into dist/ on build
  - [x] Deploy to Firebase Hosting (https://kiwichurch-1ef0f.web.app)
  - [x] ~~BLOCKER: Root URL served React SPA instead of homepage~~ — renamed SPA entry to app.html via Vite plugin
  - [x] Login button on static site links to portal login page (/login)
  - [x] "Back to website" link on React LoginPage
  - [x] Fixed login page zero padding (CSS cascade: unlayered `*` reset was overriding Tailwind utilities)
  - [x] Service worker fixes: removed SW registration from static pages, added navigateFallbackDenylist
  - [x] Add hero background image (HansonsLaneOpening-2131a.jpg) with gradient overlay
  - [x] Sticky hero (fixed behind content, sections scroll over)
  - [x] Hero logo doubled (140px → 280px), header logo enlarged (50px → 70px)
  - [x] Homepage: replaced quote + communities sections with upcoming events widget (Firebase-powered)
  - [x] Homepage: "Who We Are" heading updated, compact event cards, dark green events section
  - [x] Merged about.html into communities.html (values cards, no header text)
  - [x] Removed About from nav across all static pages
  - [x] Footer: contact form (Firestore-backed), Darryl + Julie contact details, removed Giving link
  - [x] Resources: removed "Getting Started" section
  - [x] Stop-slop pass on communities page prose
  - [x] Firestore rules for contactMessages collection
  - [x] Removed dead _redirects file from public/
- [x] **Council audit fixes** (COMPLETE — deployed 2026-05-02)
  - [x] Auth resilience: auto-create Firestore user doc when missing for valid auth session
  - [x] Registration: "Request an Account" → "Create an Account" (honest labelling)
  - [x] Contact form: honeypot + Firestore rules with field/size validation
  - [x] Storage: client-side deletes blocked on shared paths
  - [x] Users collection: reads opened to all authenticated members (fixes DMs/directory/search)
  - [x] Deactivation: isActive() guard on all content write rules
  - [x] Copyright 2025 → 2026 across all static pages

## Session Log

### 2026-07-16: Private-event leak — fixed + DEPLOYED (rules + client + RSVP), preventive
Closed the cross-app private-event leak (flagged in the churchconnect umbrella). **Two leaks**: (1) `db.ts:getEvents()` had no visibility filter + `firestore.rules` allowed any authed member to read every event; (2) the `/events/{id}/rsvps` subcollection was `allow read: if isAuthenticated()`, so a private event's **attendee list** was readable by any member. Both closed.

**Design.** New event field **`openToAllMembers`** (`!gatheringId || gathering.isPublic`) = "any member may read". Kept SEPARATE from `isPublic`, which stays strictly "show on the public static website" (homepage.html/calendar.html query `where('isPublic','==',true)` anonymously — confirmed before touching it). Invariant enforced in data: **`openToAllMembers===false ⟹ isPublic===false`** (a private group's event can never carry the website flag; the old mislabelled checkbox meant stray `isPublic:true` was likely accidental). Stamped on all write paths (create/createSeries/updateEvent/updateEventSeries recomputes server-side/updateGathering re-stamps on privacy flip). `getEvents` restructured into two provable queries — Query P `where('openToAllMembers','==',true)` + Query M `where('gatheringId','in',[my private groups])` — merged client-side, because the strict rules reject an unconstrained list query. Client `visibleEvents` filter as defence-in-depth. `firestore.rules`: `allow read: if isPublic==true || (isAuthenticated() && openToAllMembers==true) || isMemberOfEventGroup()`; rsvps read gated on `canReadEventForRsvps(eventId)` (parent-event `get()`). No admin bypass. Vitest added (17 tests). Built subagent-driven (implementer + review per task); reviews caught the RSVP leak, an anonymous-read hole, a series-edit invariant gap, and a **missing composite index** that would've emptied every event list.

**Deploy (order matters).** (0) `firebase deploy --only firestore:indexes` for `events(openToAllMembers, date)` — REQUIRED or Query P throws FAILED_PRECONDITION and every event list goes empty (verified READY via an Admin-SDK probe: run Query P through firebase-admin, which needs the same composite index, and watch for FAILED_PRECONDITION vs success). (1) backfill `npm run backfill-event-visibility` — **no-op, 0 events** (the 2026-05-21 reseed created no events; static site runs on fallback samples). (2) `firebase deploy --only firestore:rules,hosting`. (3) relabelled the EventForm checkbox "Public event (visible to all members)" → **"Show on public website"** (its true meaning) + redeploy. Live at kiwichurch-1ef0f.web.app.

**Caveat — preventive, not yet behaviourally verified.** 0 events at deploy = no live data was actually leaking, and no way to smoke-test member-vs-non-member visibility against real data. Rules verified by emulator compile-check + review, NOT by live/emulator behavioural test (rules-unit-tests deferred). **Owed:** create a real event in a private group and confirm a member sees it, a non-member doesn't (event + RSVP list), and a "Show on public website"-ticked event still renders on the static site. Non-blocking follow-ups: shared `openToAllMembers` helper (logic triplicated), re-stamp only on actual privacy flips, delete dead `subscribeToEvents`, `vitest.config` typecheck coverage, and the pre-existing rsvps *write*-side (a member can create their own RSVP on an event they can't read). Branch `fix/private-event-leak`; plan at `docs/superpowers/plans/2026-07-16-private-event-leak-fix.md`.

### 2026-06-15: Image-post fix + Bug Report feature — built, DEPLOYED, and verified end-to-end (16 commits, 3 deploys)
Two items handed over: (1) a broken group image-post, (2) a request for a user bug-report system. Brainstormed #2 into a spec + plan, built both via autopilot, then (Joel back) deployed and ran the full bug-report loop live.

**Deploy + live verification (after autopilot).** Joel asked to deploy → `firebase deploy --only firestore:rules,firestore:indexes,storage,hosting` (note: target is `storage`, NOT `storage:rules` — the latter errors "Could not find rules for the following storage targets: rules"). `bugReports(status, createdAt desc)` index went CREATING → READY (checked via Firebase MCP `firestore_list_indexes`). Joel then filed **2 real bug reports** to test the pipeline. Claude: queried `bugReports` via MCP (`firestore_query_collection`, no trailing slash), got both docs with well-formed diagnostics (route `/settings`, build sha, device, empty recentErrors) + photo URLs; `curl`'d the 3 screenshots down and viewed them with Read (Joel's circles + handwriting legible); implemented both fixes; deployed hosting; marked both reports `resolved` with adminNotes via `firestore_update_document` (updateMask `[status, adminNotes]`). **Full loop works.** (Gotcha caught: the `curl` download step had committed the 3 screenshots via `git add -A` — untracked them + gitignored `.tmp/`.)

**The 2 reports actioned (round-3 tester feedback):**
1. *"Increase font size overall"* (Board/Files tabs + Events "No events" circled) — bumped portal base `html { font-size: 16px → 17px }` in `src/styles/styles.css` (Tailwind sizes are rem-based, so this scales ALL text + spacing ~6% uniformly; static site uses a separate `css/styles.css`, unaffected). Plus targeted bumps: CalendarView "No events" xs→sm; HomePage Board/Files tabs + GroupDetailPage tabs sm→base. Deliberately conservative 6% — can push to 18px if Joel wants punchier.
2. *"Remove space from messages screen + darken 'Type a message'"* — ConversationPage empty-state was `justify-center h-full` (greeting floated dead-center on a tall viewport, leaving big gaps above AND below). Changed to top-aligned (`pt-8`, no h-full) so the greeting sits under the header. Message input + placeholder sm→base; placeholder darkened via `placeholder:text-text-light` (#5a6b62, darker than browser default).

**(1) Group/community image post fix.** Two bugs. (a) Both composers (`GroupDetailPage`, `HomePage`) hard-required text: the Post button was `disabled={!newPostContent.trim()}` and `handleCreatePost` early-returned on empty content — so an image-only (or poll-only) post was impossible. Now gated on `text OR image OR poll`. (b) "Perpetual loading forever" on mobile: `uploadBytesResumable` uses Firebase's default `maxUploadRetryTime` of **10 minutes**, so a stalled upload on a flaky mobile connection silently retries with no UI feedback — looks frozen. Fixes: set `storage.maxUploadRetryTime = 45_000` + `maxOperationRetryTime = 30_000` in `config.ts` (fail fast); wired the upload `onProgress` so the button shows `Uploading X%`; and the catch now surfaces the real error message instead of a generic "Failed to create post". (HEIC from iPhone now also shows a clear "upload a valid image" toast instead of hanging.)

**(2) Bug Report feature.** Spec: `docs/superpowers/specs/2026-06-15-bug-report-feature-design.md`; plan: `docs/superpowers/plans/2026-06-15-bug-report-feature.md`. Decisions (asked Joel up front): trigger in **Profile + Settings** (not floating), **full auto-diagnostics**, **optional multiple photos**, **status-workflow admin page**.
- **Diagnostics capture** (`src/utils/errorBuffer.ts`, installed in `main.tsx` before render): a 20-entry ring buffer hooking `window.onerror`, `unhandledrejection`, and a wrapped `console.error` (chains to original, never throws). `getDiagnostics()` snapshots route/url/userAgent/platform/viewport + injected build constants + recent errors. This is the bit that makes reports actionable — it would have caught issue #1's silent hang.
- **Build constants** (`vite.config.ts` `define`): `__APP_VERSION__` (package.json), `__BUILD_TIME__` (ISO), `__GIT_SHA__` (`git rev-parse --short HEAD`, try/catch → 'unknown'). Declared in `src/vite-env.d.ts`.
- **Data**: `bugReports` Firestore collection (`src/types/bugReport.ts`), photos at Storage `bugReports/{id}/{file}`. Two-step create→finalize (Kete pre-allocated-id pattern): mint id, upload photos, patch `photoURLs` + `diagnostics`. DB methods + `useBugReports`/`useNewBugReportCount`/`useUpdateBugReport` hooks.
- **User UI**: `BugReportModal` (description + optional multi-photo with object-URL previews + a transparency note about auto-attached diagnostics; progress + fail-fast like the post fix). Triggered from ProfilePage account-actions and SettingsPage App section.
- **Admin UI**: `BugReportsPage` at `/bug-reports` (admin-only), mirrors `ModerationPage`. Status tabs, photo thumbnails (open in new tab), collapsible diagnostics with a monospace recent-errors block, status `<select>` + admin-notes save. Linked from DesktopSidebar (admin-only, with a red new-count badge via `useNewBugReportCount`) and from ProfilePage (admin "Review bug reports" row for mobile parity).
- **Rules + index**: `bugReports` firestore.rules (active member create with description validation; admin read/triage; reporter self-read + self-patch limited to `photoURLs`/`diagnostics`/`updatedAt`; admin delete) + storage.rules (auth read, image-only ≤8MB write, no client delete) + composite index `bugReports(status ASC, createdAt DESC)`. Both rule sets validated clean via Firebase MCP `validate_security_rules`.
- **How Claude actions them**: query `bugReports` via Firebase MCP (status=='new', createdAt desc), read diagnostics, fetch photo download URLs + view them, fix, then flip status to resolved with an admin-notes line.

**Done this session:** deployed (rules/indexes/storage/hosting), index READY, bug-report pipeline verified end-to-end, 2 reports actioned + resolved. **Still worth a tester pass:** retest the image post on mobile (image-only + a deliberately-flaky connection to confirm the 45s fail-fast — only desktop-verified so far); have OTHER testers (not just Joel) file reports.

**Files — new:** `src/utils/errorBuffer.ts`, `src/types/bugReport.ts`, `src/hooks/useBugReports.ts`, `src/components/common/BugReportModal.tsx`, `src/pages/BugReportsPage.tsx`, the spec + plan. **Modified:** `vite.config.ts`, `src/vite-env.d.ts`, `src/main.tsx`, `src/services/firebase/{config,storage,db}.ts`, `src/pages/{GroupDetailPage,HomePage,ProfilePage,SettingsPage}.tsx`, `src/App.tsx`, `src/components/layout/DesktopSidebar.tsx`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`.

### 2026-06-04: Tester feedback round 2 — notifications, directory opt-in, comment deep-links, Settings compaction — 5 deploys
Live debugging session over chat with Joel. Five distinct issues, each investigated to root cause then fixed + deployed.

**1. Notifications weren't populating.** Root cause: the bell panel calls `useNotifications(uid, {limit:20})` WITHOUT `unreadOnly`, which runs `where('userId','==') + orderBy('createdAt','desc')` — needs a `notifications(userId ASC, createdAt DESC)` composite index. Only `(userId, read, createdAt)` existed (serves the unread badge, can't serve the panel query because it can't skip `read`). So the panel query threw FAILED_PRECONDITION → empty. Verified via Firebase MCP: notifications were being written fine (DMs/comments/invites all well-formed with valid timestamps) — pure read/index problem. Fix: created the index via MCP (`firestore_create_index`) so it started building immediately, added it to `firestore.indexes.json`, deployed. This fixes populate even for stale-bundle clients (backend fix). Also hardened `NotificationPanel`: `formatNotificationTime` now guards null/invalid dates (a throw there crashes the whole app — panel is portaled outside the route error boundary), and added a real "Couldn't load — Try again" error state instead of silent-empty.

**2. Notification panel un-closable ("freezes the app, only the website button works").** Root cause: legacy `styles.css` chrome has high z-index (`.app-header` 100, `.bottom-nav` 1000, `.desktop-sidebar` ~1000) but the panel overlay was Tailwind `z-50`. So the panel rendered UNDER the chrome — the app-header occluded the back-arrow/X (taps hit the header), and the nav floated on top (tap-through → page navigated underneath while the panel stayed). The "website button" works because it's a native `<a href="/">`. Fix: lifted both NotificationPanel and SearchPanel overlays to `z-[2000]` (above chrome; Modal uses `z-[1000]`), and added an `AppLayout` effect that closes both panels on `location.pathname` change. (The "can't exit" from the 28 May report was the same root cause showing through stale cache + this z-index bug.)

**3. Directory → opt-in (hidden by default).** Client wants members hidden from the directory unless they choose to appear. New `PrivacySettings.listInDirectory` (default `false`) + `UserProfile.listInDirectory` mirror field, written by `writeUserProfileMirror`. New master toggle at the top of `PrivacySection`. No data migration needed (absent flag = hidden; filters check `=== true`). No firestore.rules change (`/users` self-update already allows `privacy`; `/userProfiles` has no field allowlist). Filtering applied to Directory, global search (SearchPanel), DM new-message picker, and family-link picker. **Decision evolved mid-session:** started with admin/host bypass in the Directory, then Joel asked to remove it so he could verify the opt-in as a normal member sees it — admins now get the full roster from the Settings user list instead. Net: opt-in honored for everyone everywhere; hidden members stay visible to fellow members within shared groups and remain @mentionable (group lists read mirror docs by ID, which still exist).

**4. Comment notifications "directing to comments I can't see" + comments not visible + posts look like one thread.** Three sub-issues: (a) comment/mention notifications linked to the generic board (`/home` or `/groups/{id}`), not the post, and comments are collapsed/lazy by default — so you landed on a board with the comment buried. Fixed with a `boardPostLink(gatheringId, postId)` helper → `/home?post=id` or `/groups/{id}?post=id`; HomePage + GroupDetailPage read `?post=`, switch to the board tab, expand past the home "first 3" cap if needed, scroll to the post, and pass `autoFocusComments` so BoardPost opens its comments + draws a highlight ring. Also fixed a **latent bug**: `createMentionNotifications` linked to `/groups/{id}` with no community handling, so community-board mentions pointed at a dead `/groups/kiwi-church-community` URL — now routed through the helper. (b) Collapsed posts always showed "Comment" with no count because the count came from the lazily-loaded comments array (empty until expanded) — looked like nothing had comments. Added `getPostCommentCount` (cheap `getCountFromServer`) + `usePostCommentCount` (always-on, 60s stale, invalidated on add/delete) so collapsed posts show "N comments". (c) Visual: posts were a flush `divide-y` list (looked like one thread). Made each BoardPost a distinct card (`bg-white border rounded-lg`), wrappers switched to `space-y-3`, and the comments section is now a shaded, edge-to-edge nested zone at the bottom of each card. Caveat logged for Joel: only NEW notifications get deep-links; old ones keep generic links. Offered comments-expanded-by-default as a follow-up if wanted.

**5. Settings user list too long (60+ rows).** Compacted rows (sm avatar, `px-3 py-2`, role badge only for admin/host, edit as a small inline icon) and made it search-first: by default shows all pending users + a preview of 8 others, with a "Show all N users" button; typing searches the full roster by name/email. New state `showAllUsers`, derived `pendingUsers`/`otherUsers`/`displayUsers`/`hiddenUserCount`.

**Build/deploy:** typecheck + build clean throughout. 5 hosting deploys (notifications+index, panel z-index, directory bypass removal, comment deep-links/counts/cards, Settings list). Index built to READY via MCP. Live at https://kiwichurch-1ef0f.web.app.

**Files touched:** `firestore.indexes.json`, `src/types/user.ts`, `src/services/firebase/db.ts`, `src/hooks/useGatherings.ts`, `src/components/layout/{NotificationPanel,SearchPanel,AppLayout}.tsx`, `src/components/groups/BoardPost.tsx`, `src/components/profile/{PrivacySection,FamilySection}.tsx`, `src/pages/{DirectoryPage,DirectMessagesPage,HomePage,GroupDetailPage,SettingsPage}.tsx`.

### 2026-05-28: Tester feedback pass — 6 fixes, 2 deploys
First round of client feedback after the 2026-05-21 wipe+seed. Joel handed over six items, all triaged and shipped in one session.

**1. Family picker stops at G for Ian** — `FamilySection.tsx:124` slice cap of 20 candidates. With 60 alphabetised users from `getAllPublicProfiles()`, the dropdown only showed A through ~G unless the user typed a search query. Bumped cap to 200. Trade-off: still capped to prevent enormous DOM lists at very large scales, but a church of 60-200 members has zero practical limit now.

**2. Notifications screen — couldn't exit, had to quit the app.** Root cause: the panel covers full screen on mobile (`w-full max-w-sm`), so click-outside-to-close has no visible overlay; the only close affordance was a 20px X in the top-right corner of the header — easy to miss on a small screen. Fix: rebuilt the header with a 40×40 back-arrow on the left + 40×40 X on the right, both `onClick={onClose}`. Native-app vibe; either side discoverable.

**3. Visit website link missing from portal.** Three placements:
- **DesktopSidebar footer** — new `<a href="/">` with ExternalLink icon above the user-info chip
- **ProfilePage** — appears in a new account-actions section (just above Sign Out) alongside Settings
- **Mobile AppHeader** — `Globe` icon between Directory and Bell, `md:hidden` (desktop already has the sidebar link). Joel picked icon-in-header over header-title dropdown / homepage footer / sticky top strip after I showed mockups.

**4. Settings unreachable on mobile.** BottomNav (Home/Events/Groups/Messages/Kete) and AppHeader (Search/Directory/Bell/Profile) had no Settings entry. Worse: even on desktop, DesktopSidebar gated `/settings` behind `isAdmin`, so non-admin members couldn't reach their own notification preferences. Fix: removed the `isAdmin` filter from the desktop sidebar (Settings now visible to everyone, below the admin section); added a Settings row in ProfilePage's account-actions section for mobile. SettingsPage already self-gates the admin-only user list internally via `enabled: isAdmin` on the query.

**5. Message box doesn't expand for long messages.** `ConversationPage` was passing `singleLine` to `MentionInput`, which rendered as `<input>` with `!rounded-full`. Long messages just scrolled horizontally inside the pill — unreadable. Rewrote MentionInput to always render `<textarea>`, with auto-resize via a `useEffect` that measures `scrollHeight` against `lineHeight × maxRows` and toggles `overflow-y: auto` once the cap is hit. New `maxRows` prop (default 6). Conversation page bumped to `!rounded-2xl` (rounded-full looks weird wrapping). Behaviour: Enter sends, Shift+Enter inserts newline, textarea grows from 1 row to 6 then scrolls internally. Side benefit: BoardPost comment composer also passes `singleLine` so it gets the same auto-grow.

**6. Add Pete and Cass as hosts of Kirwee.** Pure data, no code. Via Firebase MCP:
- Resolved to Peter Down (`MPZCq6Pfb0P6jHGHv4GJFth7C1w2`, pcdown58@gmail.com) and Cassandra Down (`qniytehfsoZkMBeUKZ7inORIxiX2`, cassdown@gmail.com) — same surname/domain confirms they're a couple.
- Kirwee gathering id: `KG4gXWkS0k1KgaN7rdgF` (private group, derived during the 2026-05-21 seed from Users.Host place names).
- Updated both `/users/{uid}` docs: `role: 'host'` + `hostedGatherings: ['KG4gXWkS0k1KgaN7rdgF']`.
- Membership docs `/gatherings/.../members/{uid}` already existed from the seed (createTime 2026-05-20). Refreshed `joinedAt` (cosmetic).
- `userProfiles` mirror updates on next login via `writeUserProfileMirror`; no manual sync needed.

**MCP gotchas this session:**
- `firestore_query_collection` rejects paths with trailing slashes (`gatherings/` → "invalid because it contains '/'"). Drop the trailing slash.
- `firestore_query_collection` also rejects subcollection paths (`gatherings/X/members` → same error) despite the docstring claiming they're supported. Worked around by writing direct documents via `firestore_update_document` with full resource names (`projects/.../documents/gatherings/X/members/Y`) — `update` creates the doc if it doesn't exist, so it doubles as add.

**Build + deploy:** Two deploys. Typecheck and build clean throughout. Live at https://kiwichurch-1ef0f.web.app.

**Files touched:** `src/components/profile/FamilySection.tsx`, `src/components/layout/NotificationPanel.tsx`, `src/components/layout/DesktopSidebar.tsx`, `src/pages/ProfilePage.tsx`, `src/components/common/MentionInput.tsx`, `src/pages/ConversationPage.tsx`, `src/components/layout/AppHeader.tsx`.

### 2026-05-21: Production wipe + real-data seed + shared-password tester onboarding — 3 new scripts, 1 deploy
Joel handed over `ref/kiwichurch-seed-template-Seeded.xlsx` — the client's actual filled-out seed — and said "wipe everything currently live and seed this." Heavy session, lots of decisions, ended with 60 real test accounts live and a deploy.

**The spreadsheet shape didn't match the template.** Client filled in their own column layout: Groups had `name, Description, rhythm, location, isPublic, Host` (template wanted `color` not `Host`); Users had `email, displayName, Surname, Role, Host, phone` (template wanted `bio, memberOfGroups, hostedGroups, canPostKete` in those slots). No Events sheet at all. Plus the Users.Host column was a free-text mess: real group names (`DIDJI`, `Making Time`), places that weren't groups (`Prestons`, `Kirwee`, `East`, `Halswell`, `V1`, `Crookston`, `Writers Community`), and questions/notes (`Youth? Let's talk about this`, `Crookston, not sure if they would want to join but let's set them up to start with`). Existing `scripts/seed.js` is template-shaped and stayed untouched — wrote a parallel one-shot.

**Decisions captured in question flow:**
- **Wipe scope**: nuke everything except Joel's account (Auth + /users + /userProfiles + every collection except the `settings/setup` marker doc and the `usernames/joel` reservation… actually `usernames` got nuked too because the seed doesn't recreate it).
- **Place-name groups**: treated as private groups (Prestons, Kirwee, East, Halswell, V1, Crookston, Writers Community + Youth with Joel as host). 7 derived private groups + 11 sheet groups + community = 19 gatherings total.
- **canPostKete + hosts**: admins get canPostKete; hosts derive from Groups.Host first-name → user displayName first-word match (case-insensitive). Ambiguous (`John` matches 3 users) and unmatched (`Di`) cases reported. Joel picked overrides in-session: `John` → John Leathwick, `Di` → Dianne Browne. Baked into a `HOST_NAME_OVERRIDES` map in the seed script.
- **Auth path**: pure MCP wouldn't work — `mcp__plugin_firebase_firebase__auth_*` only has `get_users`, `update_user`, `set_sms_region_policy`. No create, delete, or `generatePasswordResetLink`. So local Admin SDK with `serviceAccount.json` was unavoidable for the Auth side. Joel downloaded the key from Firebase Console → Project Settings → Service Accounts.

**Three new scripts shipped:**
- `scripts/wipe.js` — Admin SDK. Lists all Auth users + every Firestore collection; deletes them except a `--keep=<uid>` (default = Joel). Uses `db.recursiveDelete(docRef)` for each top-level doc so subcollections cascade. Preserves `users/{joelUID}`, `userProfiles/{joelUID}`, `settings/setup`. Dry-run by default; `--apply` for real.
- `scripts/seed-kiwichurch.js` — One-shot for this specific spreadsheet shape. Reads two sheets (not three), combines `displayName + Surname` into full name, parses Users.Host with noise-stripping (`?` tail clip, lowercase-starting fragments dropped, hardcoded `not sure`/`let's`/`maybe`/etc patterns dropped), derives private groups from anything in Users.Host not in Groups, upgrades members to `role: 'host'` when Groups.Host resolves to them, applies `HOST_NAME_OVERRIDES` before falling through to first-name matching, generates the password-reset CSV per Auth-account creation, dry-run by default.
- `scripts/set-test-passwords.js` — Bulk `auth.updateUser({password})` over every non-Joel account, plus `mustChangePassword: true` flag on each /users doc. Default password `freedom`, overridable via `--password=` flag, skip extras via `--skip=email1,email2`.

**Results after running:**
- Wipe: 7 Auth + 102 Firestore docs across 11 collections deleted (only Joel kept).
- Seed: 60 new Auth accounts + Joel's existing = 61 total. 18 groups + community shell. 61 community memberships. 5 admins (Joel, Darryl, Julie, Ramon, Ian and Marlys), 4 hosts (Simon & Kathryn, Michele, John Leathwick, Dianne — auto-upgraded from member by host resolution), 52 members. Joel's existing bio/gallery/interests/phone/privacy all preserved (the seed uses merge semantics on existing users).
- Test passwords: all 60 accounts set to `freedom`. `mustChangePassword: true` set on each /users doc.

**Banner UX:**
- Added `User.mustChangePassword?: boolean` to `src/types/user.ts`.
- HomePage shows a forest-tinted banner (KeyRound icon) above the community board when `user?.mustChangePassword === true`. Tapping it goes to `/profile` where the existing Change Password button + modal live.
- `useAuth.updatePassword` extended: on success, calls `dbService.updateUser(user.id, { mustChangePassword: false })` + `setUser(...)` so the banner disappears immediately in the same session.
- Firestore self-update `hasOnly` list extended with `'mustChangePassword'` so the flag-clear isn't rule-blocked.

**Deployed**: `firebase deploy --only firestore:rules,hosting` at https://kiwichurch-1ef0f.web.app. Joel dogfooding now.

**Files created (this session):** `scripts/wipe.js`, `scripts/seed-kiwichurch.js`, `scripts/set-test-passwords.js`, `serviceAccount.json` (gitignored). **Touched:** `src/types/user.ts`, `src/hooks/useAuth.ts`, `src/pages/HomePage.tsx`, `firestore.rules`, `package.json` (three new npm scripts), `CLAUDE.md`.

**Awaiting Joel's dogfood**: log in as one of the seeded test users (e.g. with the `freedom` password against any of the 60 emails), confirm the banner appears, change the password, confirm the banner clears.

**Same-day extensions (after the wipe+seed landed):**

*Admin delete user (Settings + CLI).* Joel found a duplicate row in the user list (same person, two surnames — his wife). Needed a way to delete from Settings going forward. Constraint: Firebase client SDK can't delete Auth accounts; only Admin SDK can. Solved with a two-tier approach:
- `dbService.softDeleteUser(uid)` — flips `/users/{uid}` to `status: 'deactivated'`, deletes `/userProfiles/{uid}` (vanishes from directory/search/DM picker), removes the user from every `/gatherings/*/members/{uid}` subcollection. Auth account stays.
- Settings UI: Delete button at the bottom of the user-edit modal (forest-on-cream red link with trash icon + explanation copy), opens a `ConfirmModal` with the message scoped to the selected user. Self-delete and already-deactivated cases are guarded out of the UI. Deactivated rows hidden from the Settings list by default; a "Show deactivated (N)" checkbox appears above the search whenever the count > 0. Deactivated rows render at 60% opacity with a `Deactivated` badge when shown.
- Login defence: `useAuth` now reads the user doc on auth state change and if `status === 'deactivated'`, calls `authService.signOut()` and shows an alert before any rule-blocked reads/writes. So a deactivated user with the password can't get past the auth bootstrap.
- `scripts/delete-user.js` — Admin SDK CLI for the hard purge. Takes `--email=foo@bar.com`, optional `--apply`. Deletes Auth account + `/users` + `/userProfiles` + every gathering membership + any `/usernames` reservation pointing at the uid. Leaves authored content (kete, board posts, conversations) alone — those carry useful history. Run after soft-delete to actually free the email for re-creation. `package.json` gains `"delete-user": "node scripts/delete-user.js"`.
- No `firestore.rules` changes — admin already had update permission on `/users` and write permission on `/userProfiles`, and `/gatherings/*/members` already permits admin delete.

*Green-on-green title fix.* Joel reported the group detail page's title rendering as green text on the colored header background (unreadable). Root cause: legacy `src/styles/styles.css:92-97` declares `h1, h2, ... { color: var(--color-forest); }` unlayered, and unlayered CSS beats Tailwind v4's layered `.text-white` utility regardless of class specificity. Surgical fix: replaced the `text-white` class with inline `style={{ color: 'white' }}` on the two affected h1s (`GroupDetailPage.tsx:242`, `LoginPage.tsx:89`) — inline styles always win the cascade. Logged in Key Decisions: the proper fix is wrapping the legacy import in `@layer legacy` in `app.css`, but that's a higher-risk change (might surface visual regressions where current styles accidentally depend on legacy CSS winning) — deferred to a focused dogfood pass.

**Files added/touched in the extensions:** `src/services/firebase/db.ts` (+softDeleteUser), `src/pages/SettingsPage.tsx` (Delete button + ConfirmModal + filter + Deactivated badge), `src/hooks/useAuth.ts` (deactivated sign-out), `src/pages/GroupDetailPage.tsx` (inline white), `src/pages/LoginPage.tsx` (inline white), `scripts/delete-user.js` (new), `package.json` (+delete-user script). Three deploys this session in total: rules+hosting (banner UX + mustChangePassword rule), then hosting (delete-user feature), then hosting (green-on-green fix).

### 2026-05-13 (PM2): Autopilot — group invite UI, Kete visibility toggle, home Board/Files tabs, seed template + CLI — 10 commits, 1 deploy
Joel handed me four feature requests post-/clear, said "implement as you see fit /autopilot". Brainstormed into two specs (`docs/superpowers/specs/2026-05-13-admin-workflow-features-design.md` and `2026-05-13-seed-template-cli-design.md`), wrote two implementation plans, then autopilot-ran the six tasks below.

**Group member management (Task 1):** Third tab — Board / Files / **Members** — on `GroupDetailPage`. New components `GroupMembersList` (vertical list with avatar, Host badge for the gathering's hostId, X icon when canManage) and `AddMembersModal` (multi-select picker over `getAllPublicProfiles()` with search). `dbService.bulkAddGatheringMembers` chunks 225 user ids per batch (member doc + `group_invite` notification each → 450 ops/batch), dedupes against existing members. `useBulkAddGatheringMembers` + `useRemoveGatheringMember` mutations invalidate the members + memberProfiles + userGatherings query keys. Remove flow uses `ConfirmModal`, no notification on remove (avoids drama). `canManage = isAdmin OR gathering.hostId === user.id OR user.hostedGatherings includes groupId`. Pre-existing bug caught while wiring: `getGatheringMembersWithProfiles` was reading from `/users` (locked to self + admin/host), silently failing for regular members and showing raw uids in the mention dropdown — switched to read the `/userProfiles` mirror.

**Kete visibility toggle (Task 2):** `KetePost.visibility?: 'public' | 'members'`, default `'public'` on new posts. Pill control on `EditorTopBar` between Save Draft and Publish (Globe icon + Lock icon, forest-tint when selected). Schema gains `visibility: z.enum(['public','members']).default('public')`. Firestore rule rewritten: anonymous read needs `published == true AND (legacy missing visibility OR visibility == 'public')`; members-only auth + isActive(); drafts unchanged. Migration `dbService.migrateKeteVisibility()` runs on admin/host login via a `keteVisibilityMigratedThisSession` module flag; batch-updates legacy docs to `'public'`; idempotent. Static `kete.html` query narrowed to `where('visibility', '==', 'public')`. `post.html` anonymous load of a members-only post falls into its existing 'not found' branch (rule blocks the read, try/catch already handled it). Members-only badge (Lock icon, forest tint) on `KeteCard` and the `KetePostPage` header. New composite index `(published, visibility, publishedAt desc)` added to `firestore.indexes.json`. **Awaiting Joel to deploy:** rules + indexes + portal + static site for the toggle to be fully live.

**Home Board/Files tabs (Task 3):** `HomePage` gets the same tab pattern as `GroupDetailPage`. The community board is now under a Board tab; the Files tab mounts `<GroupResourcesList gatheringId={COMMUNITY_GATHERING_ID} />` directly. Deep-link via `?tab=files` for notifications. Removed the "Latest Files" right-column preview and the 2-col grid wrapper — Upcoming Events now gets the full width below the tabs. Net: 67 lines added, 58 removed.

**Seed template + CLI (Tasks 4-6):**
- `npm run build-template` (new) regenerates `templates/kiwichurch-seed-template.xlsx` from `scripts/build-template.js` using SheetJS. Four sheets: README (full instructions + per-column conventions), Groups, Events, Users. Each data sheet has one example row clients can keep or replace. The .xlsx is committed.
- `npm run seed -- <path.xlsx>` (new) runs `scripts/seed.js` — three-pass pipeline via Firebase Admin SDK. Pass 1 validates every row (date/time/email/enum/cross-sheet refs); collects errors and exits 1 without writes. Pass 2 upserts Groups by `name`, then Events by `(title, date)`. Pass 3 looks up Auth account by email; creates new ones with a random throwaway password; upserts `/users` + `/userProfiles` mirror (merge semantics — portal-added bio/interests/gallery preserved); writes missing group memberships including community + any hostedGroups; generates a single-use `auth.generatePasswordResetLink()` per newly-created account. Output written to `scripts/output/seed-<ISO-timestamp>.csv` with columns `email,status,passwordResetLink,errors`. `--dry-run` runs Pass 1 only, no Firebase init. `--only=groups|events|users` for debugging.
- Dependencies (`xlsx`, `firebase-admin`) in `devDependencies` only — never reach the portal bundle.
- `.gitignore` excludes `serviceAccount.json` (gitignore'd) and `scripts/output/*.csv`.
- `scripts/README.md` documents service-account setup, the three CLI commands, idempotency contract, troubleshooting.
- **SheetJS ESM gotcha:** the ESM bundle only exports `read/write/writeFile` (no `readFile`, no `set_fs`). Fixed by reading the .xlsx into a Buffer via `fs.readFileSync` and passing to `XLSX.read(buffer, { type: 'buffer' })`.
- **Validation tweak:** community gathering name ("Kiwi Church") is implicitly valid as a cross-sheet reference, so events and users referencing it don't fail validation even when the client doesn't list the community as a Groups row.
- Dry-run smoke test against the generated template: `Parsed cleanly: 1 groups, 1 events, 2 users.` ✓

**Critique pass:** Build clean throughout (verified after each task). Typecheck clean. No regressions in existing surfaces. EditorTopBar flex-wraps on narrow widths so the new visibility pill doesn't crowd the publish button. Members tab is rendered inside the `isMember` gate, so non-members of private groups still see the "Join to participate" screen. Cross-cutting bug fix on `getGatheringMembersWithProfiles` lands as a free win.

**Files created (this session, beyond the specs/plans):** `src/components/groups/GroupMembersList.tsx`, `src/components/groups/AddMembersModal.tsx`, `scripts/build-template.js`, `scripts/seed.js`, `scripts/README.md`, `scripts/output/.gitkeep`, `templates/kiwichurch-seed-template.xlsx`. **Touched:** `src/services/firebase/db.ts` (+ bulkAdd + migrate + bug fix), `src/hooks/useGatherings.ts`, `src/hooks/useAuth.ts`, `src/types/kete.ts`, `src/utils/schemas.ts`, `src/components/kete/EditorTopBar.tsx`, `src/components/kete/KeteCard.tsx`, `src/components/groups/index.ts`, `src/pages/GroupDetailPage.tsx`, `src/pages/KetePostEditor.tsx`, `src/pages/KetePostPage.tsx`, `src/pages/HomePage.tsx`, `firestore.rules`, `firestore.indexes.json`, `kete.html`, `package.json`, `.gitignore`, `CLAUDE.md`.

**Deployed end of session:** `firebase deploy --only firestore:rules,firestore:indexes,hosting`. Joel verified the Members tab and the home Board/Files tabs render after a hard reload. Post-deploy, the stale service-worker → "Files tab missing" symptom recurred (PWA cache served the old chunks); Settings → App → Refresh handles it. **Separate gotcha:** Joel used the browser's "Clear site data" button to nuke cache and got Firestore's `refusing to open IndexedDB database due to potential corruption` guard at next login + a cascading `signInWithPassword` 400 — both cleared by a single page reload (Firestore + Auth re-initialise IndexedDB cleanly on the next load). Worth knowing: instruct clients to use the in-app Refresh button, not browser "Clear site data".

### 2026-05-13 (PM): Announcements + notifications sweep, giving rework, drag-drop, force-refresh, notif prefs, PWA polish, emergency hooks fix — 27 commits, 10 deploys
**The big workstream: announcements + notifications sweep (12-task plan, executed subagent-driven).** Brainstormed scope, wrote spec + plan in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Implementation:
- `BoardPost` got `pinnedAt`, `pinnedBy`, `announcementBroadcastStatus`, `broadcastCompletedAt` fields. `BoardComment` got `replyToAuthorId`. `NotificationType` got `'announcement'`. New `Megaphone` icon in panel.
- New `dbService.pinPost` / `unpinPost`. On community-gathering pin, fires `runAnnouncementBroadcast` — chunked batch writes one `notification` doc per community member with deterministic id `announce_${postId}_${userId}` (idempotent re-runs). `resumePendingAnnouncements` fires on admin app-load via `useAuth` to recover any post stuck at `'pending'` from a tab-died mid-broadcast. New composite Firestore index on `posts(pinned, announcementBroadcastStatus)`.
- Four new notification fan-out paths wired in `db.ts`: comment→post author (or reply→replied-to commenter) — with `alreadyMentioned` dedupe; RSVP→event creator on yes/maybe transition; event update fans out to all yes/maybe RSVPers via new `notifyEventAttendees` helper; `ensureMembershipsForUser` fires `group_invite` per new non-community membership.
- Fixed cache-key mismatch in `useNotifications` — subscription was writing to `unread` cache while panel read from `user` cache, so real-time arrivals never appeared until the panel was reopened. Added `invalidateQueries` for the panel cache.
- UI: pin/unpin menu item on `BoardPost` (admin on community, host on group), `Announcement`/`Pinned` badge at top of card, left-border accent on community pins, pinned-first sort in HomePage + GroupDetailPage consumers.
- Firestore rules: new pin-fields update clause on `messageBoards/{boardId}/posts/{postId}` (`hasOnly(['pinned', 'pinnedAt', 'pinnedBy', 'announcementBroadcastStatus', 'broadcastCompletedAt'])`); notification create rule now requires `isAdmin()` for `type == 'announcement'`.
- **Caught in review:** plan referenced `gatherings/{id}/posts/` but the real Firestore path is `messageBoards/{id}/posts/`. Plan corrected before Task 8/11 ran. Also caught: comment-notify-on-mentioned-user double-fired with the @mention notification — fixed with `alreadyMentioned` guard before `createCommentNotification`.

**Giving page → profile section.** Joel said the verbose `/giving` page (bank details, "Why Give?" copy, contact CTA) was off-brand. Deleted the page, dropped a one-line `GivingSection` ("Chat with Darryl if you want to know more about giving.") into ProfilePage between Gallery and Privacy. `/giving` route now redirects to `/profile`. Removed nav link from DesktopSidebar.

**Force-refresh button + drag-and-drop uploads.** Settings → App → Refresh: unregisters all service workers, clears all Cache Storage, reloads. New `useFileDrop` hook (returns `{ isDraggingOver, dropHandlers }`) wired on HomePage post composer, GroupDetailPage post composer, and `ResourceUploadModal`. Forms tint forest-green with a dashed border while dragging over. Image-only on post composers, any file on resource uploads. Kete's `FeaturedImageUpload` already had its own drop handler — left alone.

**Per-category notification preferences.** New `User.mutedNotificationCategories: NotificationType[]` field. Seven toggles in Settings → Notifications. Recipient-side filtering only — notifications still get written, just hidden from the panel + skipped by Web Notifications (`useNotificationsSubscription` now takes the muted list) + excluded from unread count. Zero extra Firestore reads at fan-out time. Optimistic local state; rolls back on update failure. Firestore rule's self-update `hasOnly` list extended.

**PWA polish.** New `usePwaInstall` hook captures `beforeinstallprompt`, detects iOS-Safari-not-standalone, exposes `{ canInstall, isIos, hasNativePrompt, prompt, dismiss }`. `InstallPrompt` component shows a bottom-fixed forest banner with native-prompt button on Chrome/Android, "Tap [share] → Add to Home Screen" hint on iOS, 14-day dismiss cooldown via localStorage. iOS got explicit `apple-touch-icon sizes="192x192"` / `"512x512"` links. **Initially also switched VitePWA to `registerType: 'prompt'`** and added an `UpdatePrompt` banner via `registerSW({ onNeedRefresh })`.

**Emergency 1 — PWA trap.** The prompt-mode switch broke stale tabs: old SW kept serving old `app.html` with chunk hashes the new deploy no longer had; new SW waited in waiting state because prompt mode needs explicit activation; old code couldn't show the new update banner. `lazyWithRetry` reload didn't help because the same stale SW kept intercepting. Surfaced in front of a live client demo. Hotfix: reverted VitePWA to `autoUpdate`; `lazyWithRetry` now unregisters SWs + clears caches before reloading; `UpdatePrompt` left mounted but dead under autoUpdate.

**Emergency 2 — EventModal React #310.** After the SW situation cleared, clicking any event still tripped the route error boundary. Diagnostic version of the boundary (showed the raw error + stack on screen) revealed: "Rendered more hooks than during previous render." EventModal had `if (!event) return null` ahead of a `useMemo` for `broughtBy` — first render with `event=null` ran fewer hooks than subsequent renders with `event=Event`. Pre-existing latent bug. Hoisted the useMemo above the early return. Modal opens cleanly again.

**Files created (this session):** `src/components/profile/GivingSection.tsx`, `src/hooks/useFileDrop.ts`, `src/hooks/usePwaInstall.ts`, `src/components/common/InstallPrompt.tsx`, `src/components/common/UpdatePrompt.tsx`, `docs/superpowers/specs/2026-05-13-announcements-and-notifications-design.md`, `docs/superpowers/plans/2026-05-13-announcements-and-notifications.md`. **Touched:** ~25 files across types, services, hooks, components, pages, rules, indexes, vite config, index.html.

**Awaiting Joel's dogfood** of: announcement broadcast end-to-end, four new notification triggers, notification preference toggles, PWA install prompt on Chrome/Edge + iOS Safari home-screen test.

### 2026-05-13: Council action pass + host scoping + family links — 20 commits, 7 deploys
**Phase 1 (morning): action the 2026-05-12 council audit critical path.**
- Deploy-blockers (3): DST drift in `src/utils/recurrence.ts` (millisecond arithmetic → `setDate(+N)` on cloned local-time Date); RSVP attendee names denormalised onto rsvp docs (`userName`/`userPhotoURL` on setRSVP); stored XSS on static Kete patched via new `js/sanitize.js` (DOMPurify 3.4.0 from jsDelivr, iframe allowlist) — `post.html` + `kete.html` interpolations all routed through `escapeText`/`sanitizeHtml`/`safeUrl`.
- Privacy enforcement: Sentinel's "toggles are theatre" fixed by splitting trust. `/users` reads now self+admin/host only; new `/userProfiles` mirror is the public-readable directory source, written by `dbService.writeUserProfileMirror` with the privacy filter applied per-field. Migration: `useAuth` fires the mirror on every auth state change. DirectoryPage/SearchPanel/DirectMessagesPage switched to `getAllPublicProfiles()` returning `UserProfile`. MemberDetailModal accepts `UserProfile` and trusts its contents.
- Pending approval flow: `User.status: 'pending'|'active'|'deactivated'`. Self-signup lands pending; `PendingApprovalGate` shown by AppLayout; SettingsPage user list floats pending to top with one-click Approve. `isActive()` Firestore helper now also rejects pending.
- Perf + UX: denormalised `event.rsvpYesCount` via transactional `increment()` in setRSVP/removeRSVP (was: 60 aggregate reads per Hosting tab switch); 7 privacy toggles → 1 master + Advanced drawer; toggles are real `role="switch"` with aria-checked.
- A11y: TopTabs primitive with arrow-key keyboard navigation + roving tabindex; aria-pressed on filter pills; updateEventSeries strips gatheringId/Name/rsvpYesCount from bulk propagation (Contrarian's silent-group-jump fix); group resource storage delete tightened to `false`.
- Bus-factor docs: README, .env.example, HANDOVER.md skeleton with TODO markers for Joel to fill.
- Deployed and dogfooded with Joel through the full smoke test. Hit one race condition on signup (useAuth fallback created with default 'active' status, rule rejected because new rule requires 'pending') — fixed with poll-before-fallback + try/catch.

**Phase 2 (afternoon): host scoping + family link system.**
- Host scoping: new `User.hostedGatherings: string[]`, admin-controlled via Settings user-edit modal. HostingPage filters events to assigned groups, "My groups" label, empty state when unassigned. EventForm dropdown restricted; "No group/church-wide" admin-only. Firestore rules: `isHostOfGathering()` extended to accept either legacy hostId match OR hostedGatherings membership; events create/update/delete by host requires non-empty gatheringId they host. Mirror gap fix: assigning hostedGatherings now also writes `gatherings/{id}/members/{uid}` so the host shows up in Groups too (otherwise admin had to manually add them).
- Family link system (Facebook-style invite/accept):
  - New `familyLinks` collection. Doc id is deterministic `[a,b].sort().join('_')`. Two states: pending/accepted. Either party can delete. Notifications fire on send (`family_link` type with Heart icon in panel).
  - Profile FamilySection rewritten as **one unified component** (`LinkedAccountsSection` deleted) — one Add modal with two tabs: "Kiwi Church member" (directory search + relationship inputs + Send invite) vs "Someone else" (manual dependant: name + relationship + isChild). Single combined list shows incoming-pending (Accept/Decline), accepted (heart icon), outgoing-pending, then dependants.
  - **Per-side relationship labels** (father/son asymmetry): each link stores `senderLabel` (what sender calls recipient) + `recipientLabel` (what recipient calls sender). Invite asks for both ("They are my Son" / "I am their Father"). Edit modal only shows the viewer's own side. New `Combobox` primitive replaces native `<datalist>` for the relationship picker — typeahead suggestions from `RELATIONSHIP_SUGGESTIONS`, free text always accepted.
  - Cross-account RSVP: EventModal RSVP picker shows linked-family checkboxes alongside dependants. Selected linked accounts become attendees with `linkedUserId` set. When the linked person opens the same event, they see "Already going — X has RSVP'd you" banner (can still override). RSVP "I'm going" button auto-opens the family picker for users with dependants/links (was: one-tap yes for everyone).
  - `publicFamily` mirror now includes linked accounts' first names (was: dependants-only). `dbService.refreshProfileMirror(userId)` helper called on accept/delete/label-edit so directory stays current.

**Polish + bug fixes shipped along the way:**
- Optimistic privacy toggles (was: laggy 500ms+ delay per click) — local state + non-blocking mirror write.
- Mobile: Directory bookmark icon in AppHeader between search and notifications. Desktop sidebar: Directory promoted from admin-only to main nav.
- White-screen-on-deploy fix: new `src/utils/lazyWithRetry.tsx` wraps every page lazy import; on chunk-load failure (stale SW serving old asset refs) auto-reloads once via sessionStorage flag. New `RouteErrorBoundary` as last-line defence with Refresh/Go home buttons.
- Firestore rules cleaned up across familyLinks (per-side label edit rules), gathering members (admin/host can add others now), events (host scope enforcement).

**Files created:** 9 — `src/types/familyLink.ts`, `src/hooks/useFamilyLinks.ts`, `src/components/profile/FamilySection.tsx` (rewrite), `src/components/layout/PendingApprovalGate.tsx`, `src/components/common/Combobox.tsx`, `src/components/common/RouteErrorBoundary.tsx`, `src/utils/lazyWithRetry.tsx`, `README.md`, `HANDOVER.md`, `.env.example`. **Files deleted:** `src/components/profile/LinkedAccountsSection.tsx` (folded into FamilySection). **Touched:** ~30 files.

### 2026-05-12: Autopilot — profile expansion, directory rethink, family RSVP, recurring events, hosting overhaul
- **Profile expansion**: new sections `FamilySection`, `InterestsSection`, `GallerySection`, `PrivacySection` in `src/components/profile/`. User type extended with `privacy: PrivacySettings`, `interests: string[]`, `gallery: GalleryImage[]`. `DEFAULT_PRIVACY` exported for fallback. Privacy defaults: phone/email/bio/interests/gallery/groups all visible; family hidden by default. Family CRUD via inline modal; interests are chip pills (max 20, 32 chars each); gallery up to 6 images uploaded to `users/{uid}/gallery/` (new storage rule with deletes allowed for owner).
- **Auth surface widened**: `authService.updateProfile` + `useAuth.updateProfile` signatures now accept `privacy`, `interests`, `gallery`, `dependants`. Firestore self-update rule extended to allow those keys.
- **Directory rethink**: new `MemberDetailModal` shows full profile card (avatar, role, bio, contact, interests, family, groups, gallery) with mailto/tel and a "Message" CTA that jumps to `/messages/[deterministic-id]`. All privacy toggles respected; admin/host bypass for pastoral care. DirectoryPage gets role filter pills (All/Admins/Hosts/Members) + group dropdown + clear button. Search now matches name, bio, email, and interests.
- **Family RSVP**: EventModal RSVP form replaced — `selfAttending` checkbox + one checkbox per saved dependant (with child icon) + free-text guest pills + notes. RSVPs now store `attendees: RSVPAttendee[]` with `dependantId` for round-tripping. Attendee list renders real names. Headcount badge counts user + attendees (back-compat with legacy `guestCount`).
- **Recurring events**: new `EventRecurrence` type ('none' | 'weekly' | 'fortnightly' | 'monthly'). `EventForm` "Repeats" picker on create with 1-26 occurrences; `dbService.createEventSeries` batch-writes siblings sharing `seriesId`. Editing a series event offers "Just this event" vs "This and following" (propagates title/time/etc. via `dbService.updateEventSeries`). Delete on a series offers this-only, this+following, or entire series. New util `src/utils/recurrence.ts`. Series badge appears on EventCard + Hosting events list.
- **Hosting events overhaul**: Upcoming / Past 6 months toggle (was upcoming-only, 21-day window). Search by title/location/group. Group filter dropdown. Per-event "going" count via `getCountFromServer` aggregate. Series badge with recurrence label. Past events grouped by month. Upcoming window extended to 12 months so recurring series stay visible.
- 5 commits, typecheck + build clean. Not deployed (autopilot session — Joel deploys).
- **Next**: Joel to dogfood live; deploy `firebase deploy --only hosting,firestore:rules,storage:rules`.

### (Older entries pruned — see git log for history before 2026-05-12. Kete editor overhaul landed 2026-05-10: per-user `canPostKete` flag, full-page editor at `/kete/new` + `/kete/:postId/edit`, pre-allocated doc ID for stable image Storage paths, DOMPurify iframe allowlist for YouTube/Vimeo embeds.)

<!-- Pruned for length: 2026-05-06d, 2026-05-06c, 2026-05-06b, 2026-05-06, 2026-05-02b, 2026-05-02, 2026-04-27. Recoverable via `git log --all --oneline` and `git show <hash>` if needed. -->

<details>
<summary>2026-05-06d: Admin, Messages, Groups, Kete Fixes + Deploy</summary>
- Admin user creation fixed: Firestore rules allowed admin to create user docs for others (was blocked by `request.auth.uid == userId` AND gate); secondary auth uses inMemoryPersistence to avoid Edge tracking prevention blocking storage
- Created orphaned Firestore docs for d.tempero@xtra.co.nz and racheltempero@gmail.com (Auth accounts existed without user docs from prior failed attempts)
- Users page merged into Settings: full user list with search, add user, edit user modal (name, phone, bio, role); `/users` route redirects to `/settings`; removed from sidebar nav
- Messages mobile: removed autoFocus on member picker search (keyboard was eating first tap on iOS/Android); conversation input pinned to bottom via viewport height calc
- Groups: added `getGatheringMemberCounts` method, actual member counts now display per group
- Kete: restored card format with full-width featured images (h-48 object-cover)
- Pull-to-refresh: added `window.scrollY > 0` check (mobile scrolls via viewport, not container)
- Firestore rules: added `bio` to self-update allowed fields (was missing, blocking profile bio saves)
- New components: FadeIn (animate-fade-in-up wrapper), Spinner (circular loading indicator)
- Deployed to Firebase Hosting

### 2026-05-06c: Functionality Bug Fixes + Deploy
- CalendarView fix: fetches events for viewed month/week (was fixed 3-month window from today)
- DM member selection: error handling with toast, subscription error callbacks, composite Firestore index
- Settings cleanup: removed non-functional dark mode/email toggles, consistent notification toggle
- Account info (role, member since) moved from Settings to Profile page
- Service worker denylist regex fixed for .html with query params (post.html?id=xxx redirect)
- All remaining browser confirm() replaced with ConfirmModal (KetePostPage, EventForm, GroupForm, KeteForm)
- Merged design-revision → main, deployed to Firebase Hosting

### 2026-05-06b: Portal Design Revision (design-revision branch)
- Brainstormed with visual companion: container treatment, font hierarchy, homepage structure, calendar overhaul
- Design spec: `docs/superpowers/specs/2026-05-06-portal-design-revision.md`
- Implementation plan: `docs/superpowers/plans/2026-05-06-portal-design-revision.md` (15 tasks)
- Font swap: Nunito Sans → Source Sans 3 (aligns portal with DESIGN.md)
- Shadows eliminated portal-wide (kept only on modals/toast overlays)
- Serif font (Cormorant Garamond) narrowed to page h1 only — everything else Source Sans 3
- Card components (EventCard, KeteCard, GatheringCard, BoardPost) converted from shadow cards to compact rows
- CalendarView rewritten: event chips in month grid (color-coded), week view toggle
- New activity feed: `useActivityFeed` hook + `ActivityFeedItem` component (merges kete posts + group board posts)
- HomePage redesigned: greeting → featured next event (dark container) → event rows → activity feed → admin links
- All 16 pages updated: flat+featured treatment (home, profile, settings, giving, login) or grouped sections (events, groups, directory, DMs, kete, admin pages)
- 14 commits, typecheck + build clean. Awaiting Joel's visual review before merge.

### 2026-05-06: Functionality & Design Review Bug Fixes
- **Groups can't post/comment** — two root causes: (1) `undefined` values passed to Firestore SDK (no `ignoreUndefinedProperties`), (2) `serverTimestamp()` returning null on local writes crashing `formatTimeAgo`
- **Messages can't select members** — `getDoc` on non-existent conversations threw permission error; wrapped in try-catch
- **Gathering member rules too restrictive** — no gatherings had `hostId`, so only admin could read/write members. Opened up self-join/leave for all authenticated users
- **Website Kete posts redirect** — `post.html` missing from viteStaticCopy targets in vite.config.ts
- **Events list duplicate date** — changed from per-day headers to monthly grouping
- **Events RSVP badge** — fetches user RSVPs, passes status to EventCard (shows Going/Maybe badge)
- **Browser confirm() replaced** — created ConfirmModal component; replaced all `confirm()` calls in GroupDetailPage and BoardPost
- **Settings UI** — Browser Notifications changed from button to toggle for consistency
- **Firestore modernised** — replaced deprecated `enableIndexedDbPersistence` with `persistentLocalCache` API
- post.html nav updated (removed about.html, copyright 2026)
- 3 deploys to Firebase Hosting

### 2026-05-02b: Council Audit Fixes
- Ran council audit (8 members, 4 factions) — verdict: "Ship with fixes"
- Fixed 6 critical/important issues from audit, plus copyright year
- Auth resilience: orphaned Firebase Auth users now auto-create Firestore docs
- Contact form spam: honeypot + field validation + size limits in rules
- Storage delete rules locked down (was open to any authenticated user)
- Users collection reads opened for all members (getAllUsers permission mismatch)
- Deactivation enforcement via isActive() on all content write rules
- Built and deployed to Firebase Hosting

### 2026-05-02: Homepage Hero, Events Widget & Page Cleanup
- Hero image added (HansonsLaneOpening-2131a.jpg), sticky hero with content scrolling over
- Hero + header logos enlarged (280px / 70px)
- Upcoming events calendar widget (Firebase-powered, fallback data, event modal)
- Removed Matthew 18:20 quote + "Our Communities" section from homepage
- Merged about.html into communities.html with value cards
- Footer redesigned: contact form (Firestore + mailto fallback), Darryl + Julie details, compact grid
- Removed Giving from footer, About from nav across all pages
- Resources: removed "Getting Started" section
- Stop-slop pass on communities.html prose
- Firestore rules for contactMessages collection (public create, admin read)

### 2026-04-27: Routing, Login & CSS Fixes
- Fixed root URL serving React SPA instead of homepage (renamed SPA entry to app.html)
- Login button links, "Back to website" link, login page CSS cascade fix
- Service worker denylist for static pages, PWA start_url → /home
</details>

## Key Decisions
- **Approach B confirmed:** Modernise + extend existing codebase (not rebuild)
- **Firestore for chat, RTDB for presence only** — hybrid approach
- **Tailwind v4 migration:** Incremental, alongside existing CSS
- **E2E encryption and 2FA deferred** to post-launch
- **Client-side search for v1** — Algolia later if needed
- **Guest access in scope** — plan from the start (was originally deferred)
- **Google Calendar integration** — assume the client wants this
- **Video uploads:** Small files allowed, recommend links where possible, no transcoding
- **Design refresh needed** — current UI is "very AI template", create DESIGN.md with Creativity playbook
- **Static HTML pages:** Keep working, enhance with Creativity playbook later
- **8-phase delivery plan** aligned with client's prototype > rollout > go live process
- **No budget/timeline constraints** from client
- **Storage deletes blocked client-side** — no Cloud Functions yet, so admin deletes via Firebase Console. Revisit when Cloud Functions are added.
- **Portal design revision** — context-driven containers (flat+featured for dashboards, grouped sections for lists), no shadows except floating overlays, serif h1 only, Source Sans 3 body. Portal typography intentionally diverges from DESIGN.md (which defines serif for all headings on the static site).
- **Community board on homepage** — "Kiwi Church" is a real gathering in Firestore (`kiwi-church-community`), all members auto-join. Its board renders on the homepage. Clicking "Kiwi Church" in groups list goes to `/home`. Desktop layout: board top, events/files bottom row. Mobile: 3 posts + expand, then events.
- **Kete editor architecture (2026-05-10)** — per-user `canPostKete` boolean (not a new role). Pre-allocated Firestore doc ID for create flow so image uploads have a stable `kete/{postId}/` Storage path before the post is saved (orphaned files on discard accepted as v1 cost). Video embeds via URL paste only — YouTube/Vimeo regex parser, no .mp4 uploads. DOMPurify allows `<iframe>` but the `uponSanitizeElement` hook strips any iframe whose src isn't `youtube.com/embed/` or `player.vimeo.com/video/`. Hook registration guarded with `DOMPurify.__keteHookInstalled` so Vite HMR doesn't accumulate duplicate hooks.
- **Privacy model (2026-05-13)** — `/users` is locked to self + admin/host reads. `/userProfiles` is the public-readable mirror, written by `writeUserProfileMirror` with the user's privacy toggles applied per-field on every update. Anything in the mirror is by definition opt-in. Directory/Search/DM picker all read the mirror. Migration runs on every login via `useAuth`. Trade-off: the mirror is eventually-consistent (fire-and-forget background write) but the user doc write is synchronous, so the source of truth never drifts; the mirror catches up within a second.
- **Pending approval flow (2026-05-13)** — self-signup creates `User.status: 'pending'`, gated by `PendingApprovalGate` at AppLayout level. Admin/host pre-approve via Settings. `authService.adminCreateUser` writes 'active' directly. `isActive()` rule helper rejects pending so even auth'd pending users can't read other members or write content. Backward compat: existing users without a status field are treated as active.
- **Host scoping (2026-05-13)** — `User.hostedGatherings: string[]`, admin-only writable. Hosts can only see Hosting + create/edit events for their assigned groups; admin still has full access. Assignment ALSO writes group member docs (`ensureMembershipsForUser`) so hosts appear under My Groups and can read private group boards. Un-assigning doesn't remove the member doc (host may have been a regular member separately).
- **Family link model (2026-05-13)** — Facebook-style invite/accept via `familyLinks` collection (doc id = sorted pair). Per-side labels because most relationships are asymmetric (Father/Son). Linked accounts CAN RSVP for each other but DO NOT share dependants — each account keeps its own non-account family list. Trade-off documented with Joel: small admin overhead (both adults add the kids on their own profiles) in exchange for a much lighter data model than a household entity.
- **Stale-SW chunk failure recovery (2026-05-13)** — every page-level lazy import wraps in `lazyWithRetry`. **Updated PM 2026-05-13:** the retry now ALSO unregisters all service workers and clears all Cache Storage before reloading. The plain `window.location.reload()` wasn't enough when the SW itself was the source of staleness — it just re-served the same stale shell. Nuclear reload is now the recovery default. `RouteErrorBoundary` remains last-line defence.
- **Announcement broadcast model (2026-05-13 PM)** — admin pin on community board fires a client-side chunked Firestore batch (450 ops/batch) writing one notification per member. Notification doc IDs are deterministic (`announce_${postId}_${userId}`) so a partial-broadcast crash can be silently resumed without producing duplicates. `pinPost` writes `announcementBroadcastStatus: 'pending'` synchronously, kicks the broadcast fire-and-forget, then the broadcast helper flips to `'sent'` after all batches commit. Resume helper runs on admin app load via a module-level `announcementsResumedThisSession` flag in `useAuth`. Trade-off: storage cost of `N notifications × M announcements` is real but trivial at church scale; saves us a Cloud Functions dependency.
- **Notification preferences model (2026-05-13 PM)** — `User.mutedNotificationCategories: NotificationType[]`. Filtering is RECIPIENT-SIDE ONLY (panel render + `useNotificationsSubscription` web-push trigger + unread count). Notifications still get written to muted users' inboxes. Trade-off: pays in storage to avoid extra Firestore reads at fan-out time. Un-muting a category later surfaces the historical notifications naturally.
- **PWA update strategy (2026-05-13 PM)** — back on `registerType: 'autoUpdate'`. Briefly tried `'prompt'` for user-controlled updates but it compounded staleness: stale tabs couldn't show the update banner because their old code didn't have the banner component, and the new SW sat in waiting state indefinitely. Surfaced as a hard-stuck error boundary in front of a client demo. AutoUpdate's "surprise mid-message reload" is the lesser evil at this stage. Force-refresh button in Settings remains as the explicit user control.
- **React hooks discipline (2026-05-13 PM)** — every `if (...) return null` MUST sit below all hook calls. EventModal violated this with a `useMemo` (broughtBy) after the early return — silently latent until a particular render order in this session exposed it as React error #310. Eslint's `react-hooks/rules-of-hooks` would have caught this; worth verifying it's enabled in the project's eslint config.
- **Group member management UX (2026-05-13 PM2)** — admin/host adds members via a third "Members" tab on `GroupDetailPage` (Board / Files / Members). Direct add with notification (`group_invite`); recipient sees it in their notification bell and can leave anytime. No invite/accept handshake — that was rejected in brainstorming as too much friction for a church-scale platform. The picker reads `getAllPublicProfiles()` (the mirror), so the host can see every active church member. Remove flow fires a confirm modal but no notification to the removed person (deliberate — avoids drama).
- **Kete visibility model (2026-05-13 PM2)** — per-post `visibility: 'public' | 'members'`, default 'public' so existing publish-to-static-site behaviour is unchanged. Members-only posts are blocked at the Firestore rule layer for anonymous reads, so the static `kete.html` query MUST narrow to `visibility == 'public'` (a broader query would match a members-only post and fail the WHOLE query under Firestore rules). Legacy posts without the field still read OK via a `!resource.data.keys().hasAny(['visibility'])` fallback in the rule; the static query filter excludes them client-side though. Migration `migrateKeteVisibility` runs once per admin/host session and backfills the field — after one admin login post-deploy, all legacy posts reappear on the static site. Trade-off accepted: small invisible-window during the gap.
- **HomePage = community gathering's detail page (2026-05-13 PM2)** — `HomePage` is structurally the "Kiwi Church" gathering's detail page (group with id `kiwi-church-community`). Now mirrors the Board/Files tab pattern. Upcoming Events stays as a separate full-width section below the tabs — it's church-wide, not part of any one gathering. The previous "Latest Files" preview was redundant once the Files tab existed; cleanly removed.
- **Seed template / CLI architecture (2026-05-13 PM2)** — single .xlsx with four sheets (README + Groups + Events + Users) handed to clients during onboarding. Ingested via a local Node.js CLI (`scripts/seed.js`) using Firebase Admin SDK + a service account JSON. Validation happens before any writes (Pass 1); failures don't write anything. Upserts use natural keys (group `name`, event `(title, date)`, user `email`) so re-runs are idempotent. Users get real Firebase Auth accounts with a random throwaway password + `auth.generatePasswordResetLink` so they set their own. Output CSV at `scripts/output/seed-<timestamp>.csv` has the reset links — admin distributes them. Trade-off: deletions are manual (script never deletes anything). Service-account JSON sensitivity documented in `scripts/README.md`. **SheetJS ESM build only exports `read/write/writeFile` (no `readFile`, no `set_fs`)** — read .xlsx as a buffer via `fs.readFileSync` and pass to `XLSX.read()`.
- **"Clear site data" wedges Firestore (2026-05-13 PM2)** — Firestore SDK refuses to open IndexedDB when it sees the metadata cleared between sessions ("refusing to open IndexedDB database due to potential corruption … try reloading the web page"). Auth's IndexedDB store can cascade into a `signInWithPassword` 400 in the same state. Both clear on a single page reload — but the right user-facing affordance for stale PWA is the existing **Settings → App → Refresh** button (unregisters SW + clears Cache Storage but leaves IndexedDB alone). Tell clients to use it instead of the browser's nuclear "Clear site data".
- **Firebase MCP plugin cannot do Auth lifecycle (2026-05-21)** — `mcp__plugin_firebase_firebase__auth_*` only exposes `get_users`, `update_user`, and `set_sms_region_policy`. There's no `create_user`, no `delete_user`, no `generatePasswordResetLink`. So MCP works for Firestore reads/writes/deletes but any Auth-side bulk operation (wiping accounts, creating new ones, generating reset links) still needs a local Admin SDK script with `serviceAccount.json`. Future ops scripts should plan around this — MCP for Firestore, Admin SDK for Auth.
- **One-shot vs template seed (2026-05-21)** — the generic `scripts/seed.js` is template-shaped: it requires the canonical sheet layout (Groups / Events / Users with specific column orders) and dies on missing sheets. When the client filled out their own column layout, instead of mutating `seed.js` and accumulating client-specific branches, wrote a parallel `scripts/seed-kiwichurch.js`. `seed.js` stays a clean reusable tool for the next client; the kiwichurch script is documented as a one-shot and can be retired after launch. Future clients with non-template data → same pattern: new one-shot, don't fork the canonical script.
- **Shared test password + banner UX (2026-05-21)** — closed-beta tradeoff: every newly-seeded user gets the same password (`freedom`), set via Admin SDK `auth.updateUser({password})`. Their `/users` doc carries `mustChangePassword: true`. HomePage shows a forest-tinted banner ("You're using the shared test password. Tap here to set your own.") linking to `/profile`. The existing Change Password modal already does re-auth + password update; extended `useAuth.updatePassword` to clear the flag on success. Self-update rule's `hasOnly` now includes `mustChangePassword`. Trade-off Joel accepted: shared password is fine for this small known group; the banner gives a low-friction nudge but doesn't force the change. For a wider rollout this needs Cloud Functions (server-enforced rotation or per-account temp passwords).
- **First-word displayName host resolution (2026-05-21)** — when client provides hosts as first names only (e.g. Groups.Host column `"Darryl, John, Michele"`), seed script matches them to users by exact first-word displayName match, case-insensitive. So `"Simon & Kathryn"` matches `Simon` (first word). Ambiguous matches (3 Johns) and no-match cases (`Di` doesn't match `Dianne`) are surfaced in the dry-run output for human resolution, then baked in as a `HOST_NAME_OVERRIDES` map in the script. Future onboardings with first-name-only host data → expect to need the override map and reserve a question slot in the conversation for resolving ambiguities.
- **Soft delete + CLI for hard purge (2026-05-21)** — admin user deletion in Settings is a soft delete only (status='deactivated', drop /userProfiles mirror, remove from groups; Auth account stays). Hard deletion needs Admin SDK because client SDK can't delete Auth accounts — handled by `scripts/delete-user.js` + serviceAccount.json, run on demand. Trade-off: Settings UI feels "instant" (user vanishes from list, can't log in), but the email isn't reusable until Joel runs the CLI. When Cloud Functions land, this can collapse to a single Settings action via a callable function. Login defence lives in `useAuth`: on auth state change, if `userData.status === 'deactivated'`, signOut + alert before any other reads. That's load-bearing — without it a soft-deleted user could authenticate with their old password and see (rule-blocked) state.
- **Legacy CSS beats Tailwind utilities (2026-05-21)** — `src/styles/styles.css` (~2,775 lines, predates Tailwind v4) is imported into `app.css` unlayered. Unlayered CSS WINS over layered Tailwind utilities in CSS Cascade Layers regardless of class specificity. So `h1 { color: forest }` in styles.css beats `.text-white` Tailwind utility. Surfaces as green-on-green text on dark-bg headers (GroupDetailPage, LoginPage). Quick fix per occurrence: replace `text-white` className with inline `style={{ color: 'white' }}` — inline always wins. Proper fix: wrap the import as `@import './styles.css' layer(legacy);` and declare layer order at top of `app.css` — higher risk because parts of the portal may visually depend on legacy CSS winning, so defer to a focused pass. Whenever you see a Tailwind utility unexpectedly losing on a tag-targeted style, suspect this.
- **Settings is universal, not admin-only (2026-05-28)** — earlier the DesktopSidebar gated `/settings` behind `isAdmin` because the page was originally the admin user-list. But Settings has since accumulated user-level controls: 7 notification preference toggles, web-notification permission, force-refresh button, change-password (mirror of profile). Non-admins legitimately need to reach it. Fix: removed the `isAdmin` filter; SettingsPage already self-gates the admin user-list section internally (`enabled: isAdmin` on the query + `{isAdmin && ...}` render guards). Future content added to Settings: assume every user can land on it; gate admin-only sections inside the page, not at the route level.
- **Mobile "Visit Website" placement (2026-05-28)** — added Globe icon in AppHeader between Directory and Bell (`md:hidden`). Joel picked icon-in-header over header-title dropdown / homepage footer / sticky top strip after seeing mockups. Reasoning: always visible on every page, predictable position next to other utility icons, no new vertical chrome. Trade-off: header is now 5 icons on mobile (Search/Directory/Globe/Bell/Profile) — getting tight. If we add a sixth, collapse Profile + the new icons into a hamburger overflow.
- **MentionInput is always a textarea now (2026-05-28)** — was `<input>` when `singleLine`, `<textarea>` otherwise. Switched to textarea always with auto-resize via `useEffect` measuring scrollHeight against `lineHeight × maxRows`. `singleLine` now only changes keyboard behaviour (Enter submits, Shift+Enter newline) and starting `rows={1}`, not the rendered element. New `maxRows` prop (default 6). Side effect: BoardPost comment composer (also `singleLine`) now grows for long comments too — bonus, no callers needed updating.
- **Firebase MCP path quirks (2026-05-28)** — `firestore_query_collection` rejects paths with trailing slashes ("invalid because contains '/'") and also rejects nested subcollection paths like `gatherings/X/members` even though the tool description claims they work. For subcollection writes, use `firestore_update_document` with the full resource name (`projects/.../documents/gatherings/X/members/Y`) — `update_document` creates the doc if missing, so it doubles as add. For subcollection reads, fall back to reading the parent doc + getting the IDs first, or use Admin SDK locally.
- **Overlay panels must clear the legacy chrome (2026-06-04)** — `src/styles/styles.css` chrome carries high z-index (`.app-header` 100, `.bottom-nav` 1000, `.desktop-sidebar` ~1000). Any full-screen overlay/modal therefore needs z-index ABOVE 1000 or the chrome renders on top of it — close buttons get occluded by the header and nav stays tap-through. Modal uses `z-[1000]`; NotificationPanel/SearchPanel now use `z-[2000]`. Rule of thumb for new overlays: `z-[2000]`, portal to body, AND close on `location.pathname` change (added in AppLayout) so navigation can never strand a panel in front of a new page. Whenever a panel "won't close" or nav is clickable through it, suspect z-index vs legacy chrome first.
- **Notification panel needs a `(userId, createdAt desc)` index (2026-06-04)** — the bell panel queries ALL notifications (`useNotifications` without `unreadOnly`) ordered by date, which requires a composite index distinct from the unread `(userId, read, createdAt)` one (Firestore can't use the unread index for a query that omits `read`). Both are now in `firestore.indexes.json`. If notifications ever silently stop populating, check the index exists and is READY before anything else. Also: `formatNotificationTime` must never throw — the panel is portaled outside the route error boundary, so a bad timestamp would crash the whole app.
- **Directory is opt-in (2026-06-04)** — `PrivacySettings.listInDirectory` (default `false`) is the master discoverability switch, mirrored to `UserProfile.listInDirectory`. Member-facing surfaces (DirectoryPage, SearchPanel user results, DM new-message picker, FamilySection member picker) filter to `listInDirectory === true`. **No admin bypass** (Joel's call — admins use the Settings `/users` roster for everyone). Absent flag = hidden (filters check `=== true`), so no migration was needed and no firestore.rules change (the `privacy` map was already self-updatable and `/userProfiles` has no field allowlist). Hidden members still appear to fellow members inside shared groups and stay @mentionable because `getGatheringMembersWithProfiles` reads mirror docs by ID (which still exist) — only *discovery* is gated. Group/host management surfaces (AddMembersModal) are unaffected.
- **Board post notification deep-links (2026-06-04)** — comment/mention notifications link via `boardPostLink(gatheringId, postId)` → `/home?post=id` (community) or `/groups/{id}?post=id`. HomePage + GroupDetailPage read `?post=`, switch to the board tab, expand past the home "first 3" cap if needed, scroll to `#post-{id}` (BoardPost root carries that id + `scroll-mt-24`), and pass `autoFocusComments` so the post opens its comments + shows a highlight ring. Only NEW notifications get deep-links; old docs keep their generic links. This also fixed a latent bug where `createMentionNotifications` linked community-board mentions to a dead `/groups/kiwi-church-community`.
- **Comment counts are denormalised-on-read, not stored (2026-06-04)** — collapsed BoardPosts show "N comments" via `usePostCommentCount` → `getPostCommentCount` (`getCountFromServer` aggregate, always-on, 60s stale, invalidated on add/delete). Chose this over a stored `commentCount` field to avoid a firestore.rules change letting any commenter write the parent post doc. One aggregate read per visible post — fine at church scale. When expanded, the live comments array is the count source.
- **Board posts are cards, not a divided list (2026-06-04)** — BoardPost root is now `bg-white border rounded-lg`; HomePage/GroupDetailPage wrappers use `space-y-3` (was a single `divide-y` container that read as one thread). Comments render in a shaded edge-to-edge nested zone at the bottom of each card (`-mx-4 -mb-4 ... bg-cream/40`). Comments remain click-to-expand by default — Joel was offered comments-expanded-inline as a follow-up.
- **Upload retry timeout is 45s, not 10min (2026-06-15)** — Firebase Storage's default `maxUploadRetryTime` is 600s, so a stalled upload on a flaky mobile connection retries silently for 10 minutes and reads as a frozen spinner. Set globally in `config.ts` to `45_000` (+ `maxOperationRetryTime = 30_000`). Board composers also now wire `onProgress` (button shows `Uploading X%`) and surface the real error. If uploads ever start failing too eagerly on slow-but-valid connections, this is the knob.
- **Bug reports are recipient-actionable by design (2026-06-15)** — the value is the auto-captured `diagnostics` (route, device, build git-sha/time, last ~20 errors from the boot-time `errorBuffer`), NOT just the user's text. `errorBuffer` wraps `console.error` and hooks `window.onerror`/`unhandledrejection` at boot in `main.tsx`; the wrapper must never throw. Reports use the create→finalize two-step (Kete pattern) so photos upload to a stable `bugReports/{id}/` path before the doc is patched with `photoURLs`+`diagnostics` — the rules permit a reporter self-update limited to exactly those keys. Admin triage page is `/bug-reports`; Claude actions reports via Firebase MCP. No Cloud Functions — all client-side, matching the rest of the platform.
- **Claude's bug-report action loop (verified 2026-06-15)** — to action reports: (1) `firestore_query_collection` on `bugReports` (NO trailing slash) filtered `status == new`, order `createdAt desc`; (2) read `diagnostics` for the root-cause lead; (3) for each `photoURLs` entry, `curl` it to `.tmp/` (gitignored) + view with Read — the URLs are public tokened download links, no auth needed; (4) fix + deploy; (5) `firestore_update_document` with `updateMask [status, adminNotes]` to mark resolved with a note. Watch-out: don't `git add -A` while screenshots sit in the worktree — `.tmp/` is gitignored now, keep downloads there.
- **Deploy target is `storage`, not `storage:rules` (2026-06-15)** — `firebase deploy --only ...,storage:rules` fails with "Could not find rules for the following storage targets: rules". Correct full command: `firebase deploy --only firestore:rules,firestore:indexes,storage,hosting`.
- **Portal font scale lever (2026-06-15)** — overall text size is controlled by `html { font-size }` in `src/styles/styles.css` (currently 17px, was 16). Because Tailwind utilities are rem-based, this uniformly scales all portal text AND spacing — the cleanest "make everything bigger/smaller" knob. Per-spot overrides (e.g. tabs `text-base`, "No events" `text-sm`) layer on top. The static public site has its OWN `css/styles.css` and is unaffected. If asked to go bigger, bump to 18px first before hunting individual components.

## Next Steps

### IMMEDIATE — next session
- [ ] **Tester pass on the round-3 fixes** (font bump + messages spacing) — Joel to eyeball live after refresh; offered to push base font 16→**18px** if 17px (6%) reads too subtle on big screens.
- [ ] **Mobile retest of the image-post fix** — only desktop-verified. Post image-only to a group on a phone + confirm a flaky upload fails fast (~45s) with a real error toast, not a hang.
- [ ] **Tell testers about "Report a problem"** (now in Profile + Settings) — encourage them to file issues with photos; Claude actions them via MCP.
- [ ] **Work through the next batch of bug reports** as testers file them — query `bugReports` (status=='new') via Firebase MCP, view photos, fix, mark resolved with notes.

### Next session: next round of tester feedback
Round 2 shipped 2026-06-04 (notifications, directory opt-in, comment deep-links, Settings list). Expect another wave:
- [ ] **Verify 2026-06-04 fixes with testers** — (a) notifications populate AND the panel closes (X/back/tap-outside) once on the fresh bundle; (b) tapping a NEW comment/mention notification jumps to that post with comments open + highlight; (c) directory is empty until a member opts in via Profile→Privacy, then they appear in directory/search/DM-picker; (d) comment counts show on collapsed posts; (e) Settings user list is compact + searchable.
- [ ] **Tell testers the directory is opt-in now** — it'll look empty to them until they switch on "List me in the member directory" in Profile → Privacy. They need this heads-up or they'll think members vanished.
- [ ] **Possible follow-up: comments expanded inline by default** on the home/group boards (offered to Joel; currently click-to-expand with a visible count). Flip if he wants it.
- [ ] **Backfill old notification links?** — existing comment/mention notifications keep generic `/home` links (no `?post=`). Not worth migrating, but note it if a tester complains an OLD notification doesn't deep-link.
- [ ] **Second-round feedback rollup** — likely more UX papercuts and feature requests.
- [ ] **Top-up the data** — anyone they forgot, role changes, group membership tweaks. Either edit in Settings UI for one-offs or re-edit the spreadsheet and re-run `npm run seed:kiwichurch` (idempotent via merge semantics).
- [ ] **Hard purge of any deactivated users** — once Joel has soft-deleted via Settings, run `npm run delete-user -- --email=foo@bar.com --apply` to free emails for re-use.
- [ ] **Tester Joel's wife dup** — Joel was going to use the Delete button to delete it as a test. Confirm whether that worked end-to-end.

### Cleanup from this session
- [ ] **Decide on `serviceAccount.json`** — currently at repo root, gitignored. Keep for top-ups vs delete for hygiene. Either is fine; if deleted, you regenerate from Firebase Console when needed.
- [ ] **Decide on the password reset CSV** — `scripts/output/seed-kiwichurch-2026-05-20T22-14-27-455Z.csv` is redundant (everyone got `freedom` instead). Archive or delete.
- [ ] **Legacy CSS layering refactor** — wrap `@import './styles.css' layer(legacy)` so Tailwind utilities reliably beat legacy element-selector rules. Will eliminate the green-on-green class of bugs permanently. Higher risk because untested visual regressions are possible — do it in a focused dogfood pass, not mid-session. Tracking note in Key Decisions.

### Older open items still relevant
- [ ] `migrateKeteVisibility` confirmation (run kete admin login, check static site)
- [ ] Members-tab end-to-end smoke test
- [ ] Kete members-only visibility end-to-end smoke test
- [ ] Hand the seed template to future clients (different from this client's filled-in non-template file)
- [ ] Revert diagnostic RouteErrorBoundary back to friendly version
- [ ] Enable / verify `react-hooks/rules-of-hooks` in eslint
- [ ] Remove dead `UpdatePrompt` component

### Cleanup from earlier session (still open)
- [ ] **Revert the diagnostic boundary** — `RouteErrorBoundary` currently exposes the raw error + stack + component-stack in a `<details>` on the error UI. It was shipped to diagnose the EventModal hooks bug. Should be reverted to the friendly version (or kept behind a `?debug=1` flag) before this gets in front of real members.
- [ ] **Enable / verify `react-hooks/rules-of-hooks`** in eslint config — would have caught the EventModal #310 statically. Check `eslint.config.js`.
- [ ] **`UpdatePrompt` is dead code under autoUpdate** — `registerSW({ onNeedRefresh })` doesn't fire when autoUpdate handles activation automatically. Either remove the component or re-enable it with a different update strategy later.

### Highest leverage next
- [ ] **Cloud Functions decision → mobile push (FCM)** — Web Push for closed-app notifications needs server-side VAPID signing. The threshold conversation: do we adopt Cloud Functions now (also unlocks server-side announcement fan-out, audit-log triggers, scheduled events, orphan-image sweep) or keep deferring? See "Brief gaps still open" below for the rest of the FCM-adjacent items.
- [ ] **First-login welcome state** — new members currently land on an empty community-board cursor. Brief tour: "here's your gathering, here's this week's events, say hi." Storyteller recommendation. Solid UX win.
- [ ] **Manual QA pass** through the council deploy-blocker scenarios — DST series across Sep 2026, XSS attempt on Kete, privacy mirror migration on existing users, pending-approval URL bypass. Cheap insurance.
- [ ] **Dogfood the announcements + notifications work** — admin pins community post → every member sees the bell light up; mute a category → notifications stop arriving for that type; trigger the silent-resume path by manually setting `announcementBroadcastStatus: 'pending'` on a pinned post.

### Performance polish (Speed Freak)
- [ ] **AVIF image pipeline** — 880 KB hero JPGs → ~120 KB. Measurable LCP win.
- [ ] **Firestore vendor chunk split** — `manualChunks` in vite.config so `/login` doesn't pay for Firestore. 1 MB → ~400 KB main chunk.
- [ ] **Delete `dist/js/portal.js`** (561 KB) if no longer linked anywhere — verify first.

### Operational (Bus Factor)
- [ ] **Fill in HANDOVER.md** — second Firebase project owner (Darryl or church Google Workspace), transfer GitHub repo off Joel's personal account, document custom domain if one exists, prune stale branches.

### Brief gaps still open
- [ ] **Audit logs** — admin-readable trail of role changes, deletions, approvals
- [ ] **Surveys** — distinct from polls (free-text questions, results export)
- [ ] **Mobile push (FCM)** — needs Cloud Functions (see "Cloud Functions decision" above)
- [ ] **File uploads in DMs**, **guest/limited access**, **discussion forums / topic threading**

### Visual polish (Pixel Perfectionist, still open)
- [ ] **Tokenise hardcoded card hexes** — `bg-[#faf8f4] border-[#e0dbd2]` repeats 75× across 26 files. Promote to a `card` utility or extend `@theme` tokens.

### Remaining bugs
- [ ] **Orphaned Kete images in Storage** — admin sweep deferred until Cloud Functions land
- [ ] No gatherings have `hostId` field — `isHostOfGathering()` rule helper now accepts `hostedGatherings` membership as the primary signal, so this is no longer load-bearing, but the data should be cleaned up
- [ ] Community meeting times say "fortnightly" without specifying which week — Firestore data issue, needs client input
- [ ] Website calendar shows "Thin Place" and "Online Prayer" — correct data but worth a client review
- [ ] **Spot-check events for missing `time` field** — Type says `time: string` but Firestore doesn't enforce. EventModal + EventCard now defend against undefined; still worth ensuring no legacy events have empty time strings.

### Deferred
- Member blocking feature
- Dark mode (no theme implementation exists)
- Email notification preferences (no email system exists)
- App Check (post-launch hardening — Sentinel finding)
- Update banner UX with user-controlled refresh — re-explore after staleness recovery is rock-solid
