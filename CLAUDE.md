# Kiwi Church Community Platform

## Overview
- **Client**: Kiwi Church
- **Type**: Community Platform / Portal / PWA
- **Status**: All council deploy-blockers fixed + deployed. Privacy mirror, pending-approval, host scoping, family link system (invite/accept + cross-account RSVP), recurring events, hosting overhaul all live. Stable.

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

### 2026-05-10: Kete Editor Overhaul (deployed, awaiting verification)
- **Permission flag**: `canPostKete?: boolean` on User; admin toggles per-member in Settings user-edit modal; admin/host always have it; `canPostKete` derived in `useAuth`
- **New full-page editor** at `/kete/new` and `/kete/:postId/edit` (lazy-loaded, route order: `/kete/new` BEFORE `/kete/:postId` to avoid match collision)
- **Three new components** in `src/components/kete/`: `RichTextEditor` (Quill wrapper with custom image-upload + YouTube/Vimeo URL embed handlers), `FeaturedImageUpload` (drop/click + preview, always-visible Replace/Remove buttons for mobile reach), `EditorTopBar` (sticky bar, Save Draft + Publish/Update)
- **KetePostEditor page** owns RHF + zod state, pre-allocates Firestore doc ID via `dbService.allocateKetePostRef()` so image uploads land under a stable `kete/{postId}/` Storage folder before save; permission gate redirects on lack of canPostKete or non-author edit attempt; beforeunload + ConfirmModal discard guard; `dbService.createKetePostWithId()` writes via the pre-allocated ID
- **KetePage updates**: New Post button (canPostKete only), "Your drafts" section above published list (`useMyKeteDrafts(userId)`)
- **KetePostPage**: DOMPurify allowlist extended for `<img>` and `<iframe>` (YouTube/Vimeo only via `uponSanitizeElement` hook, registered once via `DOMPurify.__keteHookInstalled` flag to survive HMR); Edit button visible to author/admin/host
- **HostingPage**: Kete tab + state + `KeteForm` mount + `formatPostDate` helper all stripped (116 lines deleted, 2 inserted)
- **Schema**: `keteSchema` tightened — title 200-char cap, excerpt 500-char cap, content stripped-text refine (catches Quill's `<p><br></p>` empty state), `featuredImage` as `union([url, '']).default('')`
- **Firestore rules**: new `canPostKete()` helper; `kete` collection: published reads remain public (static site still works), drafts private to author + admin/host; create gated by `canPostKete()` + isActive + author-id match; update/delete extended from admin-only to author + admin/host
- **Storage rules**: `kete/{postId}/{fileName}` rules unchanged (public read, image+size cap on write, client deletes blocked); added explanatory comments
- 18 commits, typecheck + build clean, rules + portal deployed to https://kiwichurch-1ef0f.web.app
- **Awaiting**: Joel's manual run-through of 12 test scenarios; then delete obsolete `src/components/kete/KeteForm.tsx` + final commit
- Spec: `docs/superpowers/specs/2026-05-10-kete-editor-overhaul-design.md`
- Plan: `docs/superpowers/plans/2026-05-10-kete-editor-overhaul.md`

### 2026-05-07: Community Board, @Group Mentions, Search Filters + Deploy
- **Google Calendar integration**: "Add to Google Calendar" link in EventModal using URL API (no keys needed)
- **Search filters**: type pills (Events/Kete/Groups/People), date range dropdown, author filter on SearchPanel — collapsible with reset button
- **Community gathering**: well-known "Kiwi Church" gathering (`kiwi-church-community`) auto-created on first admin login, all users auto-joined on auth
- **HomePage reworked as community board**: desktop has board at top, 2-column bottom (events left, latest files right); mobile has board (3 posts + expand) then events
- **@group mentions**: MentionInput shows groups in autocomplete dropdown (Users icon, terracotta "group" label); group markup `#[Name](id)`; notifications sent to all group members; renders in terracotta in post content
- **GatheringCard** routes "Kiwi Church" group to `/home`; GroupDetailPage redirects community gathering to `/home`
- 8 commits, typecheck + build clean, deployed to Firebase Hosting

### 2026-05-06e: Group Files, URL Embeds, Bug Fixes + Deploy
- Reviewed client requirements doc against what's been built — identified 12 gaps, tracked in CLAUDE.md
- Deleted about.html (merged into communities previously) and giving.html (public page not needed)
- Fixed homepage "Learn More" CTA → communities.html (was dead about.html link)
- Removed giving.html from vite.config.ts static copy and sw.js precache
- **Group resources library**: new `resources` subcollection per gathering (files + links with tags)
- GroupResource type, Firestore + Storage rules, db service CRUD, storage upload, TanStack Query hooks
- Files tab on GroupDetailPage with search bar, tag filter pills, upload/link/edit/delete modals
- 8 new files: type, utility, hook, 5 components (GroupResourcesList, GroupResourceItem, ResourceUploadModal, ResourceLinkModal, URLEmbed)
- **Post image attachments**: image button on post creation form, preview, upload to Storage
- **URL embeds**: YouTube/Vimeo players and link cards auto-detected in board post content
- Admin deletion verified working across board posts, comments, kete posts, and new group resources
- Design spec: `docs/superpowers/specs/2026-05-06-group-files-and-attachments.md`
- Implementation plan: `docs/superpowers/plans/2026-05-06-group-files-and-attachments.md`
- 14 commits, typecheck + build clean, deployed to Firebase Hosting

### (Older entries pruned — see git log for history before 2026-05-06e)

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
- **Stale-SW chunk failure recovery (2026-05-13)** — every page-level lazy import wraps in `lazyWithRetry` which catches the chunk-load reject and triggers `window.location.reload()` once per session (sessionStorage flag). `RouteErrorBoundary` is the last-line defence. Pattern is reusable for any future lazy boundary.

## Next Steps

### Highest leverage next
- [ ] **Announcements / broadcast** — admin/moderator post type that hits every member, pinnable, distinct from group posts. Picky Client's #2 ask. ~1-2 hours.
- [ ] **First-login welcome state** — new members currently land on an empty community-board cursor. Brief tour: "here's your gathering, here's this week's events, say hi." Storyteller recommendation. Solid UX win.
- [ ] **Manual QA pass** through the council deploy-blocker scenarios — DST series across Sep 2026, XSS attempt on Kete, privacy mirror migration on existing users, pending-approval URL bypass. Cheap insurance.

### Performance polish (Speed Freak)
- [ ] **AVIF image pipeline** — 880 KB hero JPGs → ~120 KB. Measurable LCP win.
- [ ] **Firestore vendor chunk split** — `manualChunks` in vite.config so `/login` doesn't pay for Firestore. 1 MB → ~400 KB main chunk.
- [ ] **Delete `dist/js/portal.js`** (561 KB) if no longer linked anywhere — verify first.

### Operational (Bus Factor)
- [ ] **Fill in HANDOVER.md** — second Firebase project owner (Darryl or church Google Workspace), transfer GitHub repo off Joel's personal account, document custom domain if one exists, prune stale branches.

### Brief gaps still open
- [ ] **Audit logs** — admin-readable trail of role changes, deletions, approvals
- [ ] **Surveys** — distinct from polls (free-text questions, results export)
- [ ] **Mobile push (FCM)** — needs Cloud Functions
- [ ] **File uploads in DMs**, **drag-and-drop**, **notification customisation per channel**, **guest/limited access**
- [ ] **Giving page** — review with client how they want this presented

### Visual polish (Pixel Perfectionist, still open)
- [ ] **Tokenise hardcoded card hexes** — `bg-[#faf8f4] border-[#e0dbd2]` repeats 75× across 26 files. Promote to a `card` utility or extend `@theme` tokens.

### Remaining bugs
- [ ] **Orphaned Kete images in Storage** — admin sweep deferred until Cloud Functions land
- [ ] No gatherings have `hostId` field — `isHostOfGathering()` rule helper now accepts `hostedGatherings` membership as the primary signal, so this is no longer load-bearing, but the data should be cleaned up
- [ ] Community meeting times say "fortnightly" without specifying which week — Firestore data issue, needs client input
- [ ] Website calendar shows "Thin Place" and "Online Prayer" — correct data but worth a client review

### Deferred
- Member blocking feature
- Dark mode (no theme implementation exists)
- Email notification preferences (no email system exists)
- App Check (post-launch hardening — Sentinel finding)
