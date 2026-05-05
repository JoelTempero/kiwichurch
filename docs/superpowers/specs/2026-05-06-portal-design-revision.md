# Portal Design Revision Spec

## Problem

The portal UI feels stale and template-like. Every piece of content is wrapped in a padded, drop-shadowed container, creating visual noise and wasting space. The serif display font (Cormorant Garamond) is overused — applied to every heading, date, and card title instead of being reserved for impact. The homepage structure is a generic hub that doesn't prioritize what members care about. The calendar view shows dots instead of useful event information.

## Design Principles

1. **Containers earn their place.** No default wrapping. Content sits on the page surface unless there's a reason to contain it.
2. **Shadows are gone.** Eliminated entirely from the portal (except modals/overlays which float above the page).
3. **Serif is scarce.** Cormorant Garamond appears once per page on the h1 title. Everything else is Source Sans 3.
4. **Density over decoration.** Compact rows with dividers show more content than padded cards with shadows.
5. **Apply everywhere.** This is a portal-wide revision — every page, every component.

---

## 1. Container System

### Flat + Featured (dashboard/overview pages)

Used on: HomePage, ProfilePage, SettingsPage, GivingPage.

- Content sits directly on the parchment background (`#f5f1eb`). No containers, no borders by default.
- Items separated by thin divider lines (clay border `#e0dbd2`, 1px).
- **Featured items** earn a dark container: forest green (`#1c3d31`) background, ivory text, rounded-lg. Use sparingly — next upcoming event on homepage, primary CTA on giving page.
- Section labels use the existing DESIGN.md pattern: small uppercase, letter-spaced, terracotta on light backgrounds.

### Grouped Sections (list-heavy pages)

Used on: EventsPage, GroupsPage, GroupDetailPage, DirectoryPage, DirectMessagesPage, KetePage, HostingPage, UsersPage, ModerationPage.

- Related items grouped into a single container: ivory background (`#faf8f4`), clay border (`#e0dbd2`, 1px), rounded-lg.
- Items within a group are rows separated by internal dividers (lighter: `#ebe6dc` or warm sand).
- One container per logical section, not per item. Example: "Upcoming Events" = one bordered container with event rows inside, not 5 separate event cards.
- Section header row inside the container: section label left, "See all" link right.

### What Gets No Container

- Page titles (h1)
- Section labels / eyebrow text
- Greeting / hero areas
- Inline metadata (timestamps, author names)
- Navigation elements (already in AppHeader/Sidebar/BottomNav)

### Modals & Overlays

- Modals, dropdowns, notification panel, search panel: keep a subtle shadow (`shadow-lg`). These float above the page and need spatial separation.
- Toast notifications: keep shadow-lg.

---

## 2. Typography Changes

### Font Swap

| Element | Before | After |
|---------|--------|-------|
| Page title (h1) | Cormorant Garamond | Cormorant Garamond (unchanged) |
| Section headings (h2, h3) | Cormorant Garamond | Source Sans 3, semibold (600) |
| Card titles | Cormorant Garamond | Source Sans 3, semibold (600) |
| Event dates | Cormorant Garamond | Source Sans 3, medium (500) |
| Modal titles | Cormorant Garamond | Source Sans 3, semibold (600) |
| Body font | Nunito Sans | Source Sans 3 (aligns with DESIGN.md) |
| All other text | Nunito Sans | Source Sans 3 |

### Rules

- `font-display` / `font-serif` class: only on the page-level h1 element per page.
- Everything else inherits the base sans-serif font (Source Sans 3).
- Section labels remain uppercase Source Sans 3 with letter-spacing per DESIGN.md.
- No font-weight above 600 anywhere. Cormorant stays at 400 weight on h1s per DESIGN.md.
- **DESIGN.md divergence**: DESIGN.md defines Cormorant Garamond for all heading levels (h1-h4). That applies to the static public site. The portal intentionally narrows serif to h1 only for a cleaner, more tool-like feel. Portal styles override the DESIGN.md heading rules within `src/`.

---

## 3. Homepage Redesign

### New Structure

1. **Greeting** — flat on surface. Time-based greeting + user first name. Sans-serif, no container.

2. **Upcoming Events** — flat + featured treatment.
   - Section label: "Upcoming Events" with "See all" link.
   - Next event: featured dark container (forest green bg, ivory text, full event details — title, date, time, location, RSVP count).
   - Remaining events (2-3 more): compact rows on surface with dividers. Date badge (small colored square with month/day), title, time, location.

3. **Activity Feed** — chronological stream of recent activity across the user's communities.
   - Section label: "Recent Activity"
   - Items: flat rows with dividers. Each row shows: avatar, author name, action description ("posted in Thin Place", "RSVP'd to Community Dinner", "shared a new Kete post"), timestamp.
   - Activity types: group posts, event RSVPs, new kete posts, new group members.
   - Tapping a row navigates to the relevant content.
   - Data source: composite query across board posts, events, kete posts — sorted by createdAt descending, limited to user's groups + public content.

4. **Admin Quick Links** — if admin/host role. Flat row with divider, icon + label, no container.

### Removed

- Quick-action card grid (4 colorful icon cards). Navigation already handled by sidebar/bottom nav — the cards are redundant.

---

## 4. Calendar Overhaul

### Month View (default)

- Month grid with event chips inside day cells.
- Each chip: colored background (color-coded by group/type), white text, shows truncated title + time.
- Multiple events per day stack vertically. If more than 2, show "+N more" link.
- Click a chip: opens EventModal with full details.
- Click an empty cell: no action (or future: quick-create).
- Today highlighted with muted background on the date number.
- Navigation: left/right arrows to change month, "Today" button to jump back.

### Week View (toggle)

- 7-day vertical list. Each day is a row: date column (day name + number) | event blocks.
- Event blocks: colored containers with title, time, location, RSVP count.
- Empty days show subtle "No events" text.
- Today row highlighted.
- Same navigation: arrows to change week, "Today" button.

### Color Coding

- Use a small set of distinguishable colors mapped to event categories or groups.
- Forest (`#1c3d31`) for gatherings/worship, sage (`#7d9a87`) for prayer/small groups, terracotta (`#c17f59`) for social/community events.
- Color mapping can be refined with client input.

### List View

- Keep the existing list view as a third toggle option. Apply grouped section treatment: events grouped by month, each month in a single bordered container with event rows inside.

---

## 5. Page-by-Page Application

Every page gets the container + typography treatment. Here's how the system applies to each:

### Pages using Flat + Featured

| Page | Treatment |
|------|-----------|
| **HomePage** | Full redesign (see section 3). Flat surface + featured next event + activity feed. |
| **ProfilePage** | User info flat on surface. Settings/fields as flat rows with dividers. Avatar prominent at top. |
| **SettingsPage** | Flat rows with dividers for each setting (theme toggle, notification toggle, etc). Grouped by category with section labels. |
| **GivingPage** | Flat content. Primary giving CTA as featured dark container. Payment info/options as flat rows. |
| **LoginPage** | Centered login form. Keep the single card container here — it's a focused entry point, not a content page. Subtle border, no shadow. |

### Pages using Grouped Sections

| Page | Treatment |
|------|-----------|
| **EventsPage** | Calendar overhaul (see section 4). List view: monthly grouped sections with event rows. |
| **GroupsPage** | Groups listed in a single grouped container. Each group is a row: icon/image, name, member count, last activity. |
| **GroupDetailPage** | Group info flat at top. Board posts in a grouped section. Members in a grouped section. Each post is a row within the container, not a separate card. |
| **DirectoryPage** | All members in a grouped section. Each member is a compact row: avatar, name, role. Search/filter bar above (flat, no container). |
| **DirectMessagesPage** | Conversations in a grouped section. Each conversation is a row: avatar, name, last message preview, timestamp, unread badge. |
| **ConversationPage** | Chat bubbles remain as-is (bubbles are the appropriate pattern for messaging). No shadow on bubbles — flat colored backgrounds only. |
| **KetePage** | Kete posts listed in a grouped section. Each post is a row: thumbnail (if image), title, author, date, excerpt. |
| **KetePostPage** | Article content flat on surface. Author info flat at top. No wrapping container around the article body. |
| **HostingPage** | Admin sections (events, kete, groups tabs) as grouped sections with item rows inside each. |
| **UsersPage** | User list in a grouped section. Each user is a row: avatar, name, email, role badge, status. |
| **ModerationPage** | Reports in a grouped section by status tab (Pending/Reviewed/All). Each report is a row with reporter, target, reason, status. |

---

## 6. Component Changes

### Cards → Rows

These components currently render as individual shadow cards. They become compact rows:

| Component | Current | After |
|-----------|---------|-------|
| **EventCard** | `bg-white rounded-lg shadow-sm` standalone card | Compact row: date badge + title + time + RSVP status. No container, no shadow. Border-bottom divider. |
| **KeteCard** | `bg-white rounded-lg shadow-sm` with image | Row: optional small thumbnail + title + author + date. No container. Border-bottom divider. On KetePage list only — homepage feed uses the activity row pattern. |
| **GatheringCard** | `bg-white rounded-lg shadow-sm` with colored header | Row: group icon/color dot + name + member count + description snippet. No container. Border-bottom divider. |
| **BoardPost** | `bg-white rounded-lg shadow-sm p-4` | Row within grouped section: avatar + author + content + reactions. No individual container. Divider between posts. |

### Components Unchanged (structurally)

| Component | Notes |
|-----------|-------|
| **Modal** | Keep structure. Remove shadow-sm/md, keep shadow-lg on the overlay. Border instead of shadow on the modal card itself. |
| **ConfirmModal** | Same as Modal. |
| **EventModal** | Same as Modal. |
| **ReportModal** | Same as Modal. |
| **Toast** | Keep shadow-lg — toasts float above content. |
| **Button** | No shadow changes needed (buttons don't use shadow). |
| **Avatar** | Unchanged. |
| **Badge** | Unchanged. |
| **EmptyState** | Remove any container/shadow. Flat on surface. |
| **Skeleton** | Match new row patterns instead of card patterns. |
| **MentionInput** | Dropdown keeps shadow-lg (floating overlay). |
| **QuillEditor** | Apply border treatment, remove shadow. |
| **PullToRefresh** | Unchanged (behavioral, not visual). |

### Layout Components

| Component | Changes |
|-----------|---------|
| **AppHeader** | Remove shadow-sm from bottom edge. Use border-bottom (clay) instead. |
| **DesktopSidebar** | Remove any shadow. Use border-right if needed for edge definition. |
| **BottomNav** | Remove shadow. Use border-top (clay) instead. |
| **SearchPanel** | Keep shadow-lg (overlay). |
| **NotificationPanel** | Keep shadow-lg (overlay). |

### CalendarView

Full rewrite per section 4. Month grid with event chips, week view toggle.

---

## 7. CSS / Tailwind Changes

### Shadows

- Remove `--shadow-sm`, `--shadow-md` from portal usage entirely.
- Keep `--shadow-lg`, `--shadow-xl` for modals/overlays/toasts only.
- Remove all `shadow-sm`, `shadow-md`, `hover:shadow-md` classes from portal components.

### Font

- Update `--font-body` from Nunito Sans to Source Sans 3 in portal styles.
- Remove `font-display` / `font-serif` class from everything except page h1 elements.
- Load Source Sans 3 (400, 500, 600 weights) via Google Fonts or local files.

### New Utility Patterns

- **Divider row**: `border-b border-[#e0dbd2]` between sibling items.
- **Grouped section**: `bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden` wrapping a list of rows.
- **Featured container**: `bg-[#1c3d31] text-[#faf8f4] rounded-lg p-4` for highlighted items.
- **Section header row**: `px-4 py-3 border-b border-[#e0dbd2] flex justify-between items-center` inside a grouped section.
- **Internal divider**: `border-b border-[#ebe6dc]` between rows within a grouped section (lighter than outer border).

---

## 8. Activity Feed (New Feature)

### Data Model

No new Firestore collections needed. The feed is assembled client-side from existing data:

- Board posts from user's groups (already fetched per group)
- Events with recent RSVPs
- New Kete posts
- New group members

### Implementation

- New hook: `useActivityFeed` — composite TanStack Query that merges recent items from multiple sources, sorts by `createdAt`, and limits to ~20 items.
- New component: `ActivityFeedItem` — renders a single activity row (avatar, description, timestamp, link).
- Lives on HomePage only for now.
- Each activity type has a text template: "{user} posted in {group}", "{user} RSVP'd to {event}", "{user} published {kete post title}".

### Constraints

- Client-side aggregation means we can't do a true server-side feed query. Acceptable for a community this size (~50-200 members).
- Feed shows activity from the user's groups only (privacy). Public events and kete posts visible to all.
- No infinite scroll for v1 — show the 20 most recent items with no pagination.

---

## Scope

**In scope:**
- Container treatment (shadow removal, flat + featured / grouped sections) across all 16 pages
- Typography revision (serif reduction, font swap to Source Sans 3) across all components
- Homepage redesign (events + activity feed)
- Calendar overhaul (event chips in month grid, week view toggle)
- Activity feed feature (new hook + component)
- All 28 components updated

**Out of scope:**
- Dark mode
- New features beyond activity feed
- Static website pages (already redesigned)
- Firestore rule changes
- Navigation restructure (sidebar/bottom nav stay as-is)
