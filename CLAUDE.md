# Kiwi Church Community Platform

## Overview
- **Client**: Kiwi Church
- **Type**: Community Platform / Portal / PWA
- **Status**: Workstream A complete, Workstream B in progress (static site redesign)

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
  - [ ] Create implementation plan (invoke writing-plans skill)
  - [ ] Rewrite css/styles.css to match DESIGN.md tokens (Source Sans 3, warm palette, new shadows)
  - [ ] Revitalise homepage (index-old.html → new homepage with editorial layout variety)
  - [ ] Redesign about.html, communities.html, calendar.html, kete.html, resources.html, giving.html
  - [ ] Shared header/footer matching DESIGN.md across all static pages
  - [ ] Scroll reveal animations (fade-up, staggered cards, image hover zoom)
  - [ ] Kete rich text editor integration (DOMPurify + Quill) — portal-side fix
  - [ ] Login button on static site links to portal login page

## Session Log
### 2026-04-17
- First Claude Code session — scanned project, created CLAUDE.md
- Deep codebase audit: existing app is ~70% complete vs client requirements
- Client requirements analysed (ref/Kiwi Church Client Requirements.docx)
- Brainstorm written as HTML doc (`docs/brainstorm.html`) with 3 approaches
- Full design spec written (`docs/superpowers/specs/2026-04-17-kiwichurch-community-platform-design.md`)
- Joel approved: Approach B (modernise + extend), all architecture recommendations
- Joel added to scope: guest access, Google Calendar integration, small video uploads, design refresh
- Cloud Functions not yet initialised (no functions/ dir). RTDB status unknown. Neither blocks Phase 1
- Ready to build Phase 1 next session

### 2026-04-17 — Autopilot Session (overnight)
**Status:** Completed 5 of 8 tasks, context limit reached during page migration
**Build:** Clean (`npm run build` passes)

**Completed:**
- Installed all Phase 1 deps: tailwindcss v4 (@tailwindcss/vite), clsx, tailwind-merge, lucide-react, react-hook-form, zod
- Configured Tailwind v4 in Vite — `@theme` block in `src/styles/app.css` maps all existing CSS custom properties (colors, fonts, shadows, radii) to Tailwind utilities
- Created `src/utils/cn.ts` — clsx + tailwind-merge utility
- Migrated layout components: AppHeader, BottomNav, DesktopSidebar — all inline SVGs replaced with Lucide React icons. Kept structural CSS class names (app-header, bottom-nav, desktop-sidebar, etc.) because they're referenced by the responsive grid layout in styles.css
- Migrated all 8 common components to Tailwind: Button (cn() variants), Modal (Lucide X), Toast (Lucide X, variant classes), Badge (rounded-full pills), Avatar (size classes), EmptyState (Lucide icon map), Skeleton (animate-pulse), PullToRefresh (Lucide ArrowDown/Loader2)
- Migrated 3 page components: HomePage (gradient hero, Lucide quick actions), GivingPage (full Tailwind layout), DirectoryPage (Tailwind search/cards)
- 3 atomic git commits

**Not completed (continue next session):**
- Remaining 10 page components need Tailwind migration
- Event/group/kete sub-components (EventCard, KeteCard, etc.) still use CSS classes
- Forms not yet migrated to react-hook-form + zod
- CSS cleanup of index.css (migrated sections still present but unused)
- DESIGN.md not created yet
- NotificationPanel/SearchPanel SVGs not migrated

**Architecture notes for next session:**
- `src/styles/app.css` is the new entry point (imported in main.tsx). It imports tailwindcss, defines @theme, then imports styles.css and index.css for legacy compatibility
- Layout CSS in styles.css (grid, sidebar, bottom-nav positioning) is STRUCTURAL and must be kept. The class names `app-header`, `bottom-nav`, `desktop-sidebar`, `#app-view`, `#app-main` are load-bearing for responsive layout
- Common components now use Tailwind classes exclusively — their CSS blocks in index.css can be safely removed
- Page CSS blocks in index.css for GivingPage, DirectoryPage can be removed. HomePage still uses some app-dashboard/app-quick-action CSS classes from styles.css

### 2026-04-18
- Migrated all 10 remaining pages to Tailwind + Lucide (Events, Groups, GroupDetail, Kete, KetePost, Login, Profile, Settings, Hosting, Users)
- Migrated all 8 sub-components to Tailwind + Lucide (EventCard, EventModal, CalendarView, GatheringCard, BoardPost, KeteCard, NotificationPanel, SearchPanel)
- 18 files changed, net -125 lines (CSS classes → Tailwind utilities, inline SVGs → Lucide icons)
- Build clean. Phase 1 now ~90% done
- Remaining Phase 1: react-hook-form + zod for forms, CSS cleanup of index.css, DESIGN.md

### 2026-04-18 — Session 2: Phase 1 completion
- Migrated all forms to react-hook-form + zod: LoginPage (3 sub-forms), ProfilePage (profile + password), EventForm, KeteForm, GroupForm
- Created `src/utils/schemas.ts` with 8 zod schemas + inferred types
- Installed `@hookform/resolvers` for zodResolver integration
- Replaced all form-* CSS classes with Tailwind utilities in 8 files (BoardPost, EventModal, UsersPage included)
- Cleaned up index.css: 3,386 → 35 lines (kept only loading-screen, loading-spinner, page-loader)
- styles.css (3,133 lines) untouched — contains structural layout CSS
- Build + typecheck clean
- Phase 1 complete (DESIGN.md deferred — creative task, not a code blocker)

### 2026-04-19: Phase 2 — Real-time group chat
- Designed and planned Phase 2: enhanced group message boards (spec + 10-task plan)
- Implemented all 10 tasks via subagent-driven development
- Real-time comments: `subscribeToPostComments` onSnapshot listener, lazy subscription (only when expanded)
- @mentions: `MentionInput` component with @autocomplete dropdown, `@[Name](userId)` markup, client-side notifications
- Inline replies: flat display with visual quote references (ReplyQuote component), reply-to indicator
- Member enrichment: `getGatheringMembersWithProfiles` fetches displayName from users collection
- New files: `src/utils/mentions.ts`, `src/components/common/MentionInput.tsx`
- Modified: `gathering.ts` types, `db.ts` service (3 new methods), `useGatherings.ts` hooks (3 new), `BoardPost.tsx` (full rewrite), `GroupDetailPage.tsx` (MentionInput + mention encoding)
- Build + typecheck clean, 11 atomic commits
- Code review caught and fixed: stateful regex bug, unbounded batch write, cursor typo, @-trigger regex
- **Deferred to later:** N+1 profile fetches could be batched, `useGatheringMemberProfiles` could be conditional on membership, comment schema in `schemas.ts` not updated with reply/mention fields

### 2026-04-19 — Autopilot Session: Phase 3 — Direct Messaging
**Status:** Completed 8 of 8 tasks
**Build:** Clean

**Completed:**
- Defined `Conversation` and `DirectMessage` types with denormalized `lastMessage` and `lastReadAt` for unread tracking
- Added 10 DM service methods to `db.ts`: CRUD, real-time subscriptions, `getOrCreateConversation` with deterministic IDs
- Created `useDirectMessages.ts` hook file with full TanStack Query integration (6 hooks)
- Built `DirectMessagesPage` with conversation list, unread badges, new conversation member picker
- Built `ConversationPage` with chat bubble UI, @mentions, date separators, auto-scroll
- Added lazy-loaded routes and Messages nav item to BottomNav + DesktopSidebar
- Added Firestore security rules for conversations collection (participant-only access)
- Fixed existing notification rule bug (`allow create: if false` → allows client-side notification creation)
- Committed Phase 1/2 uncommitted form migrations and Phase 3 as separate commits

**Architecture decisions:**
- Deterministic conversation IDs (`sorted_ids.join('_')`) prevent duplicate conversations
- `lastMessage` denormalized on conversation doc for fast inbox rendering without reading messages subcollection
- `lastReadAt` per-participant timestamps for unread tracking (compare vs lastMessage.createdAt)
- Removed Profile from BottomNav to keep 5 items; Profile still accessible via DesktopSidebar
- Notification create rule fixed — was blocking all client-side notification writes from Phase 2

**Deferred:**
- Unread count badge on Messages nav item (needs subscription at app level)
- Message deletion UI
- Typing indicators (would need RTDB or presence system)
- Message pagination (currently loads up to 50 messages)

### 2026-04-19 — Autopilot Session: Phases 4-8
**Status:** Completed Phases 4-6 fully, Phase 7 partially, Phase 8 partially. Context limit reached.
**Build:** Clean

**Completed:**
- Phase 4: Real-time notification subscription activated, Web Notifications API with browser permission management, DM notification type added
- Phase 5: Verified SearchPanel already fully functional (no changes needed)
- Phase 6: Polls (2-5 options, vote tracking, percentage bars) + emoji reactions (6 presets, toggle) on BoardPost
- Phase 7: Report type, ModerationPage (admin tabs), Firestore rules, service methods + hooks
- Phase 8: Fixed manifest.json start_url and shortcut URLs

**Deferred (needs next session):**
- Member blocking feature
- Dark mode sync to Firestore

### 2026-04-19 — Session 5: Workstream A Portal Polish
**Status:** All 5 tasks complete
**Build:** Clean

**Completed:**
- Report button + ReportModal on BoardPost (ReportModal.tsx created, menu condition widened to `user &&`)
- Unread message badge on BottomNav + DesktopSidebar (useUnreadMessages hook, conversations subscription in AppLayout)
- Accessibility: skip-to-main link, h1 on 5 pages, focus:ring on Button component
- styles.css audit: 3,133 → 2,775 lines (dead CSS removed, duplicates merged, section markers added)
- Kete system audit (code review only): CRUD correct, but found XSS risk (dangerouslySetInnerHTML without DOMPurify), no rich text editor (plain textarea), dead type fields (category/series/tags)

**Kete audit findings (for Workstream B):**
- XSS: `dangerouslySetInnerHTML` in KetePostPage.tsx with no sanitization — needs DOMPurify
- Rich text: Quill installed but unused, KeteForm uses plain textarea
- Dead fields: `category`, `series`, `tags` in KetePost type but absent from form
- Query filters: `authorId`/`category`/`series` options defined but never applied in getKetePosts()

### 2026-04-19 — Session 6: Workstream B Design Phase
**Status:** Design spec complete, ready for implementation planning

**Completed:**
- Brainstormed 3 design approaches (Warm Editorial, Nature Journal, Modern Restrained) — Joel chose A: Warm Editorial
- Created DESIGN.md at project root with full 10-section visual contract
- Palette: evolved earth tones (Forest, Sage, Terracotta, Parchment, Ivory, Warm Sand, Bark, Stone, Clay, Gold)
- Typography: keeping Cormorant Garamond (display), switching Nunito Sans → Source Sans 3 (body)
- Creative direction: Editorial Flow, intensity 2–3 (scroll reveals, staggered cards, image hover zoom, gentle parallax)
- Design references: Claude/Anthropic (warmth, editorial pacing) + Airbnb (photography-forward, tactile)
- Scope confirmed: 7 static pages + Kete rich text editor (DOMPurify + Quill)

**Next session:**
- Create implementation plan (writing-plans skill)
- Begin building — rewrite CSS, then pages one by one

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

## Known Issues
- Kete content XSS risk: `dangerouslySetInnerHTML` without DOMPurify — fix when integrating rich text editor
- Kete has no rich text editor (plain textarea, users must write raw HTML)
- Member blocking feature not implemented
- Dark mode preference stored in localStorage only, not synced to Firestore
