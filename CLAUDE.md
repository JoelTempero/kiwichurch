# Kiwi Church Community Platform

## Overview
- **Client**: Kiwi Church
- **Type**: Community Platform / Portal / PWA
- **Status**: Workstream A complete, Workstream B complete, design revision merged + deployed, functionality bug fix pass deployed

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

### 2026-05-06d: Admin, Messages, Groups, Kete Fixes + Deploy
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

## Next Steps

### Design feedback (Joel has more — deferred to next session)
- [ ] Joel to review deployed design revision at https://kiwichurch-1ef0f.web.app
- [ ] Apply any spacing/density/feel feedback

### Feature work (needs brainstorm/planning)
- [ ] **Kete editor overhaul**: move add/edit from Hosting page to Kete page itself; permission-based access (admin toggles per-user); full-page editor with rich text, inline images, video embeds (replace barebones modal)
- [ ] **Profile expansion**: family members, connected accounts, hobbies (optional), privacy toggles (show/hide phone/email/groups), personal gallery
- [ ] **Directory rethink**: make useful for all users — contact info, profile cards, search/filter
- [ ] **Events admin overhaul**: Hosting page events tab needs full rework — no repetition support, unclear how events system works
- [x] **Admin restructure**: Users page merged into Settings with full edit modal; Groups tab → permission-based like proposed Kete model
- [ ] **RSVP for families**: one person can RSVP kids/family members for events
- [ ] **Giving page**: review with client how they want this presented

### Remaining bugs
- [ ] No gatherings have `hostId` field — `isHostOfGathering()` always returns false (rules work around it now, but data should be fixed)
- [ ] DM permission error may persist — now surfaces as toast instead of silent failure; root cause likely Firestore rules interaction, needs testing with live data
- [ ] Homepage "Learn More" CTA links to dead about.html
- [ ] Giving page repeats "give" 14 times — subheads need simplifying
- [ ] Community meeting times say "fortnightly" without specifying which week
- [ ] Website calendar shows "Thin Place" and "Online Prayer" — correct data but may need review with client

### Deferred
- Member blocking feature
- Dark mode (removed toggle — no theme implementation exists)
- Email notification preferences (removed toggle — no email system exists)
- No App Check configured (post-launch hardening)
- about.html still in repo (can delete)
