# Portal Design Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate drop shadows, narrow serif font to h1 only, swap body font to Source Sans 3, convert card layouts to flat rows / grouped sections, redesign homepage with activity feed, and overhaul calendar with event chips — across all 16 pages and 28 components.

**Architecture:** Foundation-first approach. CSS/font changes land first so all subsequent component work inherits the new baseline. Card components convert to row layouts before pages are updated. New features (activity feed, calendar) build last on the updated component library.

**Tech Stack:** React 18, TypeScript, Tailwind v4, TanStack Query 5, Zustand 5, Firebase/Firestore, Lucide React

**Design Spec:** `docs/superpowers/specs/2026-05-06-portal-design-revision.md`

**Testing:** This project has no test framework. After each task: `npm run typecheck && npm run build`. Visual verification via `npm run dev` after major structural changes.

---

## File Structure

### New Files
- `src/hooks/useActivityFeed.ts` — composite hook merging recent activity across groups, events, kete
- `src/components/home/ActivityFeedItem.tsx` — single activity row (avatar, description, timestamp, link)

### Major Rewrites
- `src/components/events/CalendarView.tsx` — month grid with event chips + week view toggle
- `src/pages/HomePage.tsx` — events-first layout with activity feed

### Modified (all pages + components)
- `index.html` — Google Fonts link (add Source Sans 3, keep Cormorant)
- `src/styles/app.css` — font-body variable, remove shadow-sm/shadow-md from theme
- `src/styles/styles.css` — font-body variable in :root
- All 16 pages in `src/pages/` — shadow removal, font-display removal, layout restructure
- All card components — convert from standalone shadow cards to row layouts
- All layout components — shadow → border
- Common components (Modal, Toast, EmptyState, Skeleton) — shadow cleanup

---

### Task 1: Font Foundation

**Files:**
- Modify: `index.html:28` (Google Fonts link)
- Modify: `src/styles/app.css:23` (Tailwind theme font-body)
- Modify: `src/styles/styles.css:31` (CSS variable font-body)

- [ ] **Step 1: Add Source Sans 3 to Google Fonts link in index.html**

Replace the existing fonts link (line 28):
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

This drops Nunito Sans and adds Source Sans 3 (400, 500, 600 + italic 400).

- [ ] **Step 2: Update font-body in Tailwind theme (app.css line 23)**

```css
--font-body: 'Source Sans 3', system-ui, -apple-system, sans-serif;
```

- [ ] **Step 3: Update font-body in CSS variables (styles.css line 31)**

```css
--font-body: 'Source Sans 3', system-ui, -apple-system, sans-serif;
```

- [ ] **Step 4: Verify fonts load**

Run: `npm run typecheck && npm run build`

- [ ] **Step 5: Commit**

```bash
git add index.html src/styles/app.css src/styles/styles.css
git commit -m "feat: swap body font from Nunito Sans to Source Sans 3"
```

---

### Task 2: Shadow + Font Purge (Common Components)

**Files:**
- Modify: `src/components/common/Modal.tsx`
- Modify: `src/components/common/Toast.tsx`
- Modify: `src/components/common/EmptyState.tsx`
- Modify: `src/components/common/Skeleton.tsx`
- Modify: `src/components/common/MentionInput.tsx`
- Modify: `src/components/common/QuillEditor.tsx`

- [ ] **Step 1: Modal — remove shadow, add border**

In Modal.tsx, find the modal content container div. Replace any `shadow-xl` or `shadow-lg` on the modal card itself with `border border-[#e0dbd2]`. Keep `shadow-lg` only on the backdrop overlay if present. Remove `font-display` from modal title if present.

- [ ] **Step 2: Toast — keep shadow-lg (floating element), remove any shadow-sm/shadow-md**

Toast floats above content — shadow-lg stays per spec. Remove any lesser shadows.

- [ ] **Step 3: EmptyState — remove any shadow or container styling**

Ensure EmptyState renders flat on surface with no background/shadow/border.

- [ ] **Step 4: Skeleton — remove shadow-sm**

Remove any `shadow-sm` from skeleton placeholder elements. These should be flat `bg-cream-dark rounded-lg` with animation.

- [ ] **Step 5: MentionInput — keep dropdown shadow-lg**

The dropdown overlay keeps shadow-lg. Remove shadow from the input itself if present.

- [ ] **Step 6: QuillEditor — remove shadow, add border**

Replace any shadow with `border border-[#e0dbd2]`.

- [ ] **Step 7: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/common/
git commit -m "feat: remove shadows from common components, add border treatment"
```

---

### Task 3: Layout Components (Shadow → Border)

**Files:**
- Modify: `src/components/layout/AppHeader.tsx`
- Modify: `src/components/layout/DesktopSidebar.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/styles/styles.css` (portal layout section, lines 1877+)

- [ ] **Step 1: Find shadow/border styles for layout components in styles.css**

The layout components (AppHeader, BottomNav, DesktopSidebar) use CSS classes from styles.css (`.app-header`, `.bottom-nav`, `.desktop-sidebar`). Search for these class definitions in the portal layout section (after line 1877).

- [ ] **Step 2: AppHeader — replace box-shadow with border-bottom**

In styles.css, find `.app-header`. Replace any `box-shadow` property with:
```css
border-bottom: 1px solid #e0dbd2;
```
Remove the `font-display` class from the title element in AppHeader.tsx if present. The h1 uses `.app-header-title` CSS class — check if that has font-family set to display font in styles.css and keep it (it's the page h1, which stays serif per spec).

- [ ] **Step 3: BottomNav — replace box-shadow with border-top**

In styles.css, find `.bottom-nav`. Replace any `box-shadow` with:
```css
border-top: 1px solid #e0dbd2;
```

- [ ] **Step 4: DesktopSidebar — replace box-shadow with border-right**

In styles.css, find `.desktop-sidebar`. Replace any `box-shadow` with:
```css
border-right: 1px solid #e0dbd2;
```

- [ ] **Step 5: SearchPanel + NotificationPanel — keep shadow-lg (overlays)**

Verify these keep shadow-lg. No changes needed if they already use it.

- [ ] **Step 6: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/layout/ src/styles/styles.css
git commit -m "feat: replace layout shadows with border treatment"
```

---

### Task 4: EventCard → Row Layout

**Files:**
- Modify: `src/components/events/EventCard.tsx`

- [ ] **Step 1: Convert EventCard from shadow card to divider row**

Replace the entire component JSX. The new EventCard is a compact row designed to sit inside a parent container (either flat on surface with border-bottom, or inside a grouped section). No standalone background, shadow, or rounded corners.

```tsx
export function EventCard({ event, onClick, rsvpStatus, compact = false }: EventCardProps) {
  const { day, month, weekday } = formatDate(event.date)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 cursor-pointer hover:bg-cream/50 transition-colors',
        compact ? 'py-2 px-1' : 'py-3 px-2'
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-forest rounded-lg flex flex-col items-center justify-center">
        <span className="text-[9px] uppercase text-cream leading-none">{month}</span>
        <span className="text-base font-semibold text-cream leading-tight">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary text-[15px] truncate">{event.title}</div>
        <div className="text-sm text-text-light">
          {weekday} {formatTime(event.time)}
          {event.location && ` · ${event.location}`}
        </div>
        {event.gatheringName && (
          <div className="text-xs text-terracotta mt-0.5">{event.gatheringName}</div>
        )}
      </div>
      {rsvpStatus && (
        <div className="flex-shrink-0">
          <Badge variant={rsvpStatus === 'yes' ? 'success' : rsvpStatus === 'maybe' ? 'warning' : 'default'}>
            {rsvpStatus === 'yes' ? 'Going' : rsvpStatus === 'maybe' ? 'Maybe' : 'Not going'}
          </Badge>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/events/EventCard.tsx
git commit -m "feat: convert EventCard from shadow card to compact row"
```

---

### Task 5: KeteCard + GatheringCard → Row Layout

**Files:**
- Modify: `src/components/kete/KeteCard.tsx`
- Modify: `src/components/groups/GatheringCard.tsx`

- [ ] **Step 1: Convert KeteCard to row layout**

Replace the card wrapper. Remove `shadow-sm`, `hover:shadow-md`, standalone `bg-white rounded-lg`. New pattern: compact row with optional small thumbnail, title, author, date. No container — parent provides dividers.

```tsx
// Outer wrapper: remove bg-white rounded-lg shadow-sm hover:shadow-md
// New: 'flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors'
// If has featured image: show as 48x48 rounded-lg thumbnail on left
// Title: font-semibold text-[15px] (no font-display)
// Author + date: text-sm text-text-light
```

- [ ] **Step 2: Convert GatheringCard to row layout**

Remove colored header block, shadow, standalone card wrapper. New pattern: group color dot + name + member count + description.

```tsx
// Outer wrapper: remove bg-white rounded-lg shadow-sm overflow-hidden
// New: 'flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors'
// Left: 10x10 colored circle (use gathering color or forest default)
// Center: name (font-semibold), member count + description (text-sm text-text-light)
// Remove font-display from any heading
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/kete/KeteCard.tsx src/components/groups/GatheringCard.tsx
git commit -m "feat: convert KeteCard and GatheringCard to row layouts"
```

---

### Task 6: BoardPost → Row in Grouped Section

**Files:**
- Modify: `src/components/groups/BoardPost.tsx`

- [ ] **Step 1: Remove standalone card styling from BoardPost**

Replace `bg-white rounded-lg shadow-sm p-4 mb-3` with `py-4 px-4`. The parent (GroupDetailPage) will wrap posts in a grouped section container. BoardPost becomes a row within that container — no individual background, shadow, or margin-bottom.

Keep internal structure (avatar, author, content, reactions, menu) the same. Remove any `font-display` from post content headings if present.

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/groups/BoardPost.tsx
git commit -m "feat: convert BoardPost from shadow card to flat row"
```

---

### Task 7: CalendarView Rewrite

**Files:**
- Modify: `src/components/events/CalendarView.tsx`
- Modify: `src/store/index.ts` (add calendarViewMode to UIStore if needed)

- [ ] **Step 1: Add view mode to UIStore**

Check `src/store/index.ts` for the UI store. Add a `calendarViewMode: 'month' | 'week'` state and a `setCalendarViewMode` action if not present.

- [ ] **Step 2: Rewrite CalendarView with event chips (month view)**

Replace the entire CalendarView component. Key changes:
- Remove `bg-white rounded-lg shadow-sm` wrapper — use `border border-[#e0dbd2] rounded-lg bg-[#faf8f4] overflow-hidden` (grouped section).
- Month header: sans-serif (remove `font-display`), add "Today" button.
- Grid cells: taller (`min-h-[72px]` on desktop), contain event chips instead of dots.
- Event chips: colored background (forest for gatherings, sage for prayer, terracotta for social), white text, truncated title + time, `text-[10px]`, click to open event.
- "+N more" when >2 events per day.
- View toggle: Month | Week buttons above the calendar.
- Today: highlighted cell with muted background.

```tsx
interface CalendarViewProps {
  events: Event[]
  onDateClick: (date: string) => void
  onEventClick: (event: Event) => void
}

// Event chip color mapping
function getEventColor(event: Event): string {
  if (event.gatheringName?.toLowerCase().includes('gathering')) return 'bg-forest'
  if (event.gatheringName?.toLowerCase().includes('prayer')) return 'bg-sage'
  return 'bg-terracotta'
}
```

Month grid cell rendering:
```tsx
// For each day cell:
<div className={cn(
  'min-h-[72px] p-1 border-t border-[#ebe6dc]',
  day.isToday && 'bg-cream'
)}>
  <span className={cn(
    'text-xs',
    day.isToday ? 'font-semibold text-forest' : 'text-text-light'
  )}>{day.day}</span>
  <div className="flex flex-col gap-0.5 mt-0.5">
    {day.events.slice(0, 2).map(event => (
      <button
        key={event.id}
        className={cn('text-[10px] text-white px-1.5 py-0.5 rounded truncate text-left w-full', getEventColor(event))}
        onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
      >
        {formatChipTime(event.time)} {event.title}
      </button>
    ))}
    {day.events.length > 2 && (
      <span className="text-[10px] text-text-light">+{day.events.length - 2} more</span>
    )}
  </div>
</div>
```

- [ ] **Step 3: Add week view**

Week view: 7-day vertical list below the same header/navigation.

```tsx
// Week view rendering:
<div className="flex flex-col">
  {weekDays.map(day => (
    <div key={day.date} className={cn(
      'grid grid-cols-[56px_1fr] gap-3 py-3 px-3 border-b border-[#ebe6dc]',
      day.isToday && 'bg-cream'
    )}>
      <div className="text-center">
        <div className="text-[10px] text-text-light uppercase">{day.dayName}</div>
        <div className={cn('text-lg font-semibold', day.isToday ? 'text-forest' : 'text-text-light')}>
          {day.dayNumber}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {day.events.length === 0 ? (
          <span className="text-xs text-text-lighter italic py-2">No events</span>
        ) : day.events.map(event => (
          <button
            key={event.id}
            className={cn('text-left rounded-lg px-3 py-2 text-cream', getEventColor(event))}
            onClick={() => onEventClick(event)}
          >
            <div className="font-semibold text-sm">{event.title}</div>
            <div className="text-xs opacity-80">
              {formatTime(event.time)}{event.location && ` · ${event.location}`}
            </div>
          </button>
        ))}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 4: Update calendarDays to include events per day**

Change the `calendarDays` memo to attach the actual event objects (not just `hasEvents` boolean) so chips can render title/time. Each day entry becomes:
```ts
{ date: string | null; day: number | null; isToday: boolean; events: Event[] }
```

- [ ] **Step 5: Add week navigation helpers**

Add `getWeekDays(year, month, weekOffset)` function and prev/next week buttons. Week view shows Mon-Sun for the selected week.

- [ ] **Step 6: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/components/events/CalendarView.tsx src/store/index.ts
git commit -m "feat: rewrite CalendarView with event chips and week view toggle"
```

---

### Task 8: Activity Feed Hook + Component

**Files:**
- Create: `src/hooks/useActivityFeed.ts`
- Create: `src/components/home/ActivityFeedItem.tsx`

- [ ] **Step 1: Create useActivityFeed hook**

```ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { db } from '@/services/db'
import type { BoardPost } from '@/types/gathering'
import type { KetePost } from '@/types/kete'
import type { Event } from '@/types'

export interface ActivityItem {
  id: string
  type: 'post' | 'event' | 'kete'
  title: string
  description: string
  authorName: string
  authorId: string
  groupName?: string
  timestamp: Date
  link: string
}

function postToActivity(post: BoardPost, groupName: string, groupId: string): ActivityItem {
  return {
    id: `post-${post.id}`,
    type: 'post',
    title: post.authorName,
    description: `posted in ${groupName}`,
    authorName: post.authorName,
    authorId: post.authorId,
    groupName,
    timestamp: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
    link: `/groups/${groupId}`
  }
}

function keteToActivity(post: KetePost): ActivityItem {
  return {
    id: `kete-${post.id}`,
    type: 'kete',
    title: post.authorName,
    description: `published "${post.title}"`,
    authorName: post.authorName,
    authorId: post.authorId,
    timestamp: post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt),
    link: `/kete/${post.id}`
  }
}

function eventToActivity(event: Event): ActivityItem {
  return {
    id: `event-${event.id}`,
    type: 'event',
    title: event.title,
    description: `upcoming on ${new Date(event.date).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}`,
    authorName: '',
    authorId: '',
    timestamp: new Date(event.date),
    link: '/events'
  }
}

export function useActivityFeed(limit = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['activityFeed', user?.id],
    queryFn: async () => {
      const activities: ActivityItem[] = []

      // Fetch recent kete posts
      const ketePosts = await db.getPublishedKetePosts(5)
      activities.push(...ketePosts.map(keteToActivity))

      // Fetch recent board posts from user's groups
      if (user?.groups && user.groups.length > 0) {
        for (const groupId of user.groups.slice(0, 5)) {
          const group = await db.getGathering(groupId)
          if (!group) continue
          const posts = await db.getBoardPosts(groupId, 3)
          activities.push(...posts.map(p => postToActivity(p, group.name, groupId)))
        }
      }

      // Sort by timestamp descending, limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000
  })
}
```

**Note:** Adjust the `db` method names to match actual service layer. Check `src/services/db.ts` for the real method signatures for `getPublishedKetePosts`, `getGathering`, `getBoardPosts`. The hook needs to import from the right service methods. Also check the User type for how groups are stored (might be `user.gatherings` or fetched separately).

- [ ] **Step 2: Create ActivityFeedItem component**

```tsx
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/common'
import { MessageSquare, BookOpen, Calendar } from 'lucide-react'
import type { ActivityItem } from '@/hooks/useActivityFeed'

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

const typeIcons = {
  post: MessageSquare,
  kete: BookOpen,
  event: Calendar
}

interface ActivityFeedItemProps {
  item: ActivityItem
}

export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const Icon = typeIcons[item.type]

  return (
    <Link
      to={item.link}
      className="flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors no-underline text-inherit"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
        <Icon size={16} className="text-text-light" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm">
          <span className="font-semibold text-text-primary">{item.title}</span>
          {' '}
          <span className="text-text-light">{item.description}</span>
        </span>
      </div>
      <span className="text-xs text-text-lighter flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
    </Link>
  )
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/hooks/useActivityFeed.ts src/components/home/ActivityFeedItem.tsx
git commit -m "feat: add activity feed hook and component"
```

---

### Task 9: HomePage Redesign

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Rewrite HomePage with events-first + activity feed**

Replace the entire HomePage component. New structure:

1. **Greeting** — flat on surface, sans-serif, no gradient container
2. **Upcoming Events** — featured next event (dark forest container) + remaining as rows with dividers
3. **Activity Feed** — flat rows with dividers
4. **Admin Quick Links** — flat rows, no card container

```tsx
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { Link } from 'react-router-dom'
import { Calendar, Settings, BookMarked } from 'lucide-react'
import { EventCard } from '@/components/events'
import { ActivityFeedItem } from '@/components/home/ActivityFeedItem'
import { Skeleton, PullToRefresh, EmptyState, Button } from '@/components/common'

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
}

export function HomePage() {
  const { user, isAdminOrHost } = useAuth()
  const greeting = getTimeBasedGreeting()
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents(5)
  const { data: activities = [], isLoading: loadingActivity, refetch: refetchActivity } = useActivityFeed()

  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchActivity()])
  }

  const [featuredEvent, ...remainingEvents] = events

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        {/* Page title for accessibility */}
        <h1 className="font-display text-2xl text-forest mb-1">{greeting}, {firstName}</h1>

        {/* Upcoming Events */}
        <section className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Upcoming Events</span>
            <Link to="/events" className="text-sm text-sage font-medium no-underline hover:text-forest">See all →</Link>
          </div>

          {loadingEvents ? (
            <div className="flex flex-col gap-2">
              <Skeleton variant="rectangular" height={80} />
              <Skeleton variant="rectangular" height={48} />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              message="Check the calendar for future events"
              action={<Link to="/events"><Button variant="outline" size="sm">View Calendar</Button></Link>}
            />
          ) : (
            <>
              {/* Featured next event — dark container */}
              {featuredEvent && (
                <Link to="/events" className="block bg-forest rounded-lg p-4 mb-2 no-underline">
                  <div className="text-xs uppercase tracking-widest text-gold mb-2 font-medium">Next Up</div>
                  <div className="font-semibold text-cream text-lg">{featuredEvent.title}</div>
                  <div className="text-sm text-cream/70 mt-1">
                    {new Date(featuredEvent.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}{formatTime(featuredEvent.time)}
                    {featuredEvent.location && ` · ${featuredEvent.location}`}
                  </div>
                </Link>
              )}
              {/* Remaining events as rows with dividers */}
              <div className="divide-y divide-[#e0dbd2]">
                {remainingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Activity Feed */}
        <section className="mt-8">
          <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Recent Activity</span>

          {loadingActivity ? (
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-text-light mt-3">No recent activity from your communities.</p>
          ) : (
            <div className="mt-3 divide-y divide-[#e0dbd2]">
              {activities.map(item => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Admin Quick Links */}
        {isAdminOrHost && (
          <section className="mt-8 mb-4">
            <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Admin</span>
            <div className="mt-3 divide-y divide-[#e0dbd2]">
              <Link to="/hosting" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <Settings size={18} className="text-text-light" />
                <span className="text-sm font-medium">Manage Events</span>
              </Link>
              <Link to="/directory" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <BookMarked size={18} className="text-text-light" />
                <span className="text-sm font-medium">Directory</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/HomePage.tsx
git commit -m "feat: redesign homepage with events-first layout and activity feed"
```

---

### Task 10: EventsPage Update

**Files:**
- Modify: `src/pages/EventsPage.tsx`

- [ ] **Step 1: Update EventsPage with new calendar + grouped list view**

Key changes:
- Remove `font-display` from page title (keep it as sans-serif h2; the h1 comes from AppHeader).
- View toggle: three options (Month / Week / List). Style active toggle as `bg-forest text-cream` instead of `bg-white shadow-sm`.
- List view: wrap events in grouped section containers per month — `bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden`. Month header as section header row inside the container. Events as rows with `border-b border-[#ebe6dc]` between them.
- Calendar views handled by updated CalendarView component.

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/EventsPage.tsx
git commit -m "feat: update EventsPage with grouped sections and three-way view toggle"
```

---

### Task 11: Flat + Featured Pages (Profile, Settings, Giving, Login)

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/pages/GivingPage.tsx`
- Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1: ProfilePage — flat layout**

Remove all `shadow-sm`, `bg-white rounded-lg` card wrappers. Content sits flat on surface. Profile fields as rows with dividers. Avatar prominent at top. Remove `font-display` from all headings except page h1.

- [ ] **Step 2: SettingsPage — flat rows with dividers**

Remove shadow/card wrappers. Each setting is a row with `border-b border-[#e0dbd2]`. Group settings by category with section label (uppercase, terracotta). Remove `font-display` from section headings.

- [ ] **Step 3: GivingPage — flat with featured CTA**

Remove shadow/card wrappers. Primary giving CTA becomes a featured dark container (`bg-forest text-cream rounded-lg p-4`). Other content flat with dividers. Remove `font-display` from headings except page h1.

- [ ] **Step 4: LoginPage — keep card, remove shadow, add border**

Replace `shadow-lg` / `shadow-xl` with `border border-[#e0dbd2]` on the login card. Keep the centered single-card layout (appropriate for a focused entry point). Remove `font-display` from form headings.

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/ProfilePage.tsx src/pages/SettingsPage.tsx src/pages/GivingPage.tsx src/pages/LoginPage.tsx
git commit -m "feat: apply flat + featured treatment to profile, settings, giving, login pages"
```

---

### Task 12: Grouped Section Pages — Part 1 (Groups, GroupDetail, Directory)

**Files:**
- Modify: `src/pages/GroupsPage.tsx`
- Modify: `src/pages/GroupDetailPage.tsx`
- Modify: `src/pages/DirectoryPage.tsx`

- [ ] **Step 1: GroupsPage — groups in grouped section**

Remove per-card shadows. Wrap all groups in a single grouped section: `bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden`. Each GatheringCard is a row inside with `border-b border-[#ebe6dc]` between siblings. Remove `font-display` from headings except page h1.

- [ ] **Step 2: GroupDetailPage — flat header + grouped posts/members**

Group info flat at top (no card wrapper). Board posts wrapped in a grouped section container. Members section in a separate grouped section. Each BoardPost separated by `border-b border-[#ebe6dc]`. Remove `font-display` from headings except page h1.

- [ ] **Step 3: DirectoryPage — members in grouped section**

Search bar flat above (no container). All members in a single grouped section. Each member row separated by internal dividers. Remove `font-display` from headings.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/GroupsPage.tsx src/pages/GroupDetailPage.tsx src/pages/DirectoryPage.tsx
git commit -m "feat: apply grouped section treatment to groups, group detail, directory pages"
```

---

### Task 13: Grouped Section Pages — Part 2 (DMs, Conversation, Kete, KetePost)

**Files:**
- Modify: `src/pages/DirectMessagesPage.tsx`
- Modify: `src/pages/ConversationPage.tsx`
- Modify: `src/pages/KetePage.tsx`
- Modify: `src/pages/KetePostPage.tsx`

- [ ] **Step 1: DirectMessagesPage — conversations in grouped section**

Conversations list in a single grouped section container. Each conversation row with internal dividers. Remove shadows and `font-display`.

- [ ] **Step 2: ConversationPage — flat chat bubbles, no shadows**

Chat bubbles stay structurally the same but remove any shadow classes. Flat colored backgrounds only. Remove `font-display` from any headings.

- [ ] **Step 3: KetePage — posts in grouped section**

Kete posts in a single grouped section. Each KeteCard row separated by internal dividers. Remove `font-display` from headings except page h1.

- [ ] **Step 4: KetePostPage — article flat on surface**

Remove any card wrapper around the article body. Author info flat at top. Content directly on surface. Remove `font-display` from headings except page h1.

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/DirectMessagesPage.tsx src/pages/ConversationPage.tsx src/pages/KetePage.tsx src/pages/KetePostPage.tsx
git commit -m "feat: apply grouped section treatment to DMs, conversation, kete pages"
```

---

### Task 14: Admin Pages (Hosting, Users, Moderation)

**Files:**
- Modify: `src/pages/HostingPage.tsx`
- Modify: `src/pages/UsersPage.tsx`
- Modify: `src/pages/ModerationPage.tsx`

- [ ] **Step 1: HostingPage — tabbed grouped sections**

Each tab's content (events, kete, groups) in a grouped section container. Item rows with internal dividers. Remove shadows and `font-display` from headings except page h1.

- [ ] **Step 2: UsersPage — users in grouped section**

User list in a single grouped section. Each user row with internal dividers. Remove shadows and `font-display` from headings.

- [ ] **Step 3: ModerationPage — reports in grouped section**

Reports grouped by status tab. Each tab's content in a grouped section. Report rows with internal dividers. Remove shadows and `font-display`.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run build`
```bash
git add src/pages/HostingPage.tsx src/pages/UsersPage.tsx src/pages/ModerationPage.tsx
git commit -m "feat: apply grouped section treatment to hosting, users, moderation pages"
```

---

### Task 15: Final Sweep + Cleanup

**Files:**
- Modify: `src/styles/app.css` (remove unused shadow tokens from theme)
- Modify: `DESIGN.md` (add portal typography divergence note)
- Modify: `src/components/events/EventForm.tsx` (shadow cleanup)
- Modify: `src/components/groups/GroupForm.tsx` (shadow cleanup)
- Modify: `src/components/groups/ReportModal.tsx` (shadow cleanup)
- Modify: `src/components/kete/KeteForm.tsx` (shadow cleanup)

- [ ] **Step 1: Remove shadow-sm and shadow-md from Tailwind theme**

In `src/styles/app.css`, remove `--shadow-sm` and `--shadow-md` from the `@theme` block. Keep `--shadow-lg` and `--shadow-xl` for modals/overlays.

- [ ] **Step 2: Grep for remaining shadow-sm/shadow-md in src/**

Run: `grep -rn "shadow-sm\|shadow-md\|hover:shadow" src/`

Fix any remaining instances. Form components (EventForm, GroupForm, KeteForm) may have shadow on their containers — remove them, add border if needed.

- [ ] **Step 3: Grep for remaining font-display in src/ (except h1 usage)**

Run: `grep -rn "font-display\|font-serif" src/`

Verify every instance is on a page-level h1 element only. Remove from anything else.

- [ ] **Step 4: Add portal divergence note to DESIGN.md**

Under section 3 (Typography Rules), add:
```markdown
### Portal Override
The portal (React app in `src/`) narrows serif usage: Cormorant Garamond appears only on the page-level h1 per page. All other headings (h2–h4), section titles, card titles, and dates use Source Sans 3. This gives the portal a cleaner, more tool-like feel compared to the editorial static site.
```

- [ ] **Step 5: Visual verification**

Run: `npm run dev`
Walk through every page in the browser. Check:
- No shadows anywhere except modals/toast
- Serif font only on page h1 titles
- Source Sans 3 rendering correctly for all body text
- Grouped sections have border treatment
- Homepage shows featured event + activity feed
- Calendar shows event chips in month view, week view toggle works

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: final design revision sweep — remove remaining shadows, cleanup fonts"
```
