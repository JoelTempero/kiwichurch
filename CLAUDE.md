# Kiwi Church Community Platform

## Overview
- **Client**: Kiwi Church
- **Type**: Community Platform / Portal / PWA
- **Status**: Planning complete, ready to build Phase 1

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
- Portal app fully built with 12 pages, 27 components, full service layer, hooks, types, stores
- Auth system complete (email/password, username, role-based)
- Events + RSVPs, Groups + message boards, Kete (blog), Directory, Giving, Admin tools all functional
- Firebase security rules comprehensive (role-based per collection)
- PWA with service worker, offline persistence, install prompt
- Tailwind v4 installed and configured alongside existing CSS (migration in progress)
- No Cloud Functions yet. No push notifications. No real-time chat (only forum-style boards)

## Next Steps
- [ ] **Phase 1: Foundation modernisation** (IN PROGRESS — ~60% done)
  - [x] Install Tailwind v4 + clsx + tailwind-merge + Lucide React + react-hook-form + zod
  - [x] Configure Tailwind v4 in Vite alongside existing CSS (`src/styles/app.css` with `@theme` block)
  - [x] Create cn() utility (`src/utils/cn.ts`)
  - [ ] Create DESIGN.md (creative refresh — current UI is "very AI template")
  - [x] Migrate layout components to Lucide icons (AppHeader, BottomNav, DesktopSidebar) — kept structural CSS class names for grid layout compat
  - [x] Migrate common components to Tailwind + cn() (Button, Modal, Toast, Badge, Avatar, EmptyState, Skeleton, PullToRefresh)
  - [x] Migrate 3 pages to Tailwind: HomePage, GivingPage, DirectoryPage
  - [ ] Migrate remaining pages: EventsPage, GroupsPage, GroupDetailPage, KetePage, KetePostPage, ProfilePage, SettingsPage, HostingPage, UsersPage, LoginPage
  - [ ] Migrate event/group/kete sub-components (EventCard, KeteCard, etc.) — these still use CSS classes
  - [ ] Swap forms to react-hook-form + zod (LoginPage, ProfilePage edit, EventForm, message board, comment forms)
  - [ ] Clean up old CSS from index.css — remove migrated sections (Button, Badge, Modal, Toast, Skeleton, EmptyState, Giving, Directory CSS blocks)
  - [ ] NotificationPanel and SearchPanel — migrate inline SVGs to Lucide
- [ ] Phase 2: Real-time group chat (upgrade message boards to live chat)
- [ ] Phase 3: Direct messaging (1:1 conversations)
- [ ] Phase 4: Notifications (FCM push, Web Notifications — will need Cloud Functions init)
- [ ] Phase 5: Global search
- [ ] Phase 6: Polls & engagement
- [ ] Phase 7: Moderation & admin tools
- [ ] Phase 8: Polish & launch prep

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
- Vanilla CSS partially migrated to Tailwind v4 — ~40% of CSS blocks still need migration
- NotificationPanel and SearchPanel components are stubbed but not functional
- manifest.json start_url points to ./portal.html instead of / (needs fixing)
- Message board reactions data model exists but UI not built
- Dark mode preference stored in localStorage only, not synced to Firestore
