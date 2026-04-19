# Workstream A: Portal Polish & Kete Audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete deferred portal items (report UI, unread badges, accessibility, CSS cleanup) and audit the Kete system for correctness before the static website redesign.

**Architecture:** All changes are within the React portal app (`src/`). No new dependencies needed. Tasks are independent and can be executed in any order except Task 5 (Kete audit) which is research-only and informs future work.

**Tech Stack:** React 18, TypeScript, Vite 6, TanStack Query 5, Firebase 11, Zustand 5, Tailwind CSS v4, Lucide React

---

### Task 1: Report Button UI on BoardPost

**Files:**
- Create: `src/components/groups/ReportModal.tsx`
- Modify: `src/components/groups/BoardPost.tsx`

**Context:** The report backend is fully built — `Report` type in `src/types/report.ts`, `createReport()` in `src/services/firebase/db.ts:574-580`, `useCreateReport()` hook in `src/hooks/useReports.ts:17-23`. The `ModerationPage` already displays and manages reports. We just need the UI trigger.

- [ ] **Step 1: Create ReportModal component**

Create `src/components/groups/ReportModal.tsx`:

```tsx
import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Modal } from '../common/Modal'
import type { ReportReason, ReportTargetType } from '../../types/report'
import { useCreateReport } from '../../hooks/useReports'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../hooks/useToast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
  targetAuthorId: string
  targetAuthorName: string
  targetContent: string
  contextId?: string
  contextName?: string
}

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
]

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetAuthorId,
  targetAuthorName,
  targetContent,
  contextId,
  contextName,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('inappropriate')
  const [details, setDetails] = useState('')
  const { user } = useAuthStore()
  const createReport = useCreateReport()
  const { showToast } = useToast()

  const handleSubmit = async () => {
    if (!user) return
    try {
      await createReport.mutateAsync({
        reporterId: user.uid,
        reporterName: user.displayName || 'Unknown',
        targetType,
        targetId,
        targetAuthorId,
        targetAuthorName,
        targetContent: targetContent.slice(0, 500),
        contextId,
        contextName,
        reason,
        details: details.trim() || undefined,
        status: 'pending',
      })
      showToast('Report submitted. A moderator will review it.', 'success')
      setReason('inappropriate')
      setDetails('')
      onClose()
    } catch {
      showToast('Failed to submit report. Please try again.', 'error')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Content" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            className="w-full rounded-md border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Any additional context..."
            className="w-full rounded-md border border-cream-dark bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReport.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Add Report button to BoardPost menu**

In `src/components/groups/BoardPost.tsx`:

1. Add imports at top:
```tsx
import { Flag } from 'lucide-react'
import { ReportModal } from './ReportModal'
```

2. Add state inside the component (near other state declarations):
```tsx
const [showReportModal, setShowReportModal] = useState(false)
```

3. The menu currently renders inside `{(canEdit || canDelete) && (`. Change this condition to always show the menu (any authenticated user can report), and add Report as a menu option. Replace the menu container condition:

```tsx
{user && (
  <div className="relative" ref={menuRef}>
    <button
      className="p-1 rounded-full hover:bg-cream transition-colors"
      onClick={() => setShowMenu(!showMenu)}
      aria-label="Post options"
      aria-expanded={showMenu}
    >
      <MoreVertical size={18} />
    </button>
    {showMenu && (
      <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-md py-1 min-w-[120px] z-10" role="menu">
        {canEdit && (
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-cream transition-colors text-left"
            onClick={handleEditPost}
            role="menuitem"
          >
            <Edit size={16} />
            Edit
          </button>
        )}
        {canDelete && (
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            onClick={handleDeletePost}
            role="menuitem"
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
        {user.uid !== post.authorId && (
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-cream transition-colors text-left"
            onClick={() => {
              setShowMenu(false)
              setShowReportModal(true)
            }}
            role="menuitem"
          >
            <Flag size={16} />
            Report
          </button>
        )}
      </div>
    )}
  </div>
)}
```

4. Add ReportModal render before the closing fragment/div of the component:
```tsx
<ReportModal
  isOpen={showReportModal}
  onClose={() => setShowReportModal(false)}
  targetType="post"
  targetId={post.id}
  targetAuthorId={post.authorId}
  targetAuthorName={post.authorName}
  targetContent={post.content}
  contextId={gatheringId}
  contextName={gatheringName}
/>
```

Note: `gatheringId` and `gatheringName` need to be available in BoardPost. Check if they're already in props — if not, pass them from GroupDetailPage.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors

- [ ] **Step 4: Commit**

```bash
git add src/components/groups/ReportModal.tsx src/components/groups/BoardPost.tsx
git commit -m "feat: add report button and modal to BoardPost menu"
```

---

### Task 2: Unread Badge on Messages Nav

**Files:**
- Create: `src/hooks/useUnreadMessages.ts`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/components/layout/DesktopSidebar.tsx`
- Modify: `src/components/layout/AppLayout.tsx`

**Context:** Conversations have `lastMessage.createdAt` and `lastReadAt: Record<string, Timestamp | Date>`. Comparing these per-conversation gives unread status. `useConversationsSubscription` already provides real-time updates. We need a hook that derives unread count from the conversations query data.

- [ ] **Step 1: Create useUnreadMessages hook**

Create `src/hooks/useUnreadMessages.ts`:

```tsx
import { useMemo } from 'react'
import { useConversations } from './useDirectMessages'
import type { Conversation } from '../types/directMessage'
import type { Timestamp } from 'firebase/firestore'

function toMillis(ts: Timestamp | Date | undefined): number {
  if (!ts) return 0
  if ('toMillis' in ts) return ts.toMillis()
  return ts.getTime()
}

function isUnread(conversation: Conversation, userId: string): boolean {
  const lastMessageTime = toMillis(conversation.lastMessage?.createdAt)
  if (!lastMessageTime) return false
  if (conversation.lastMessage?.senderId === userId) return false
  const lastReadTime = toMillis(conversation.lastReadAt[userId])
  return lastMessageTime > lastReadTime
}

export function useUnreadMessageCount(userId: string | null) {
  const { data: conversations } = useConversations(userId)

  return useMemo(() => {
    if (!conversations || !userId) return 0
    return conversations.filter((c) => isUnread(c, userId)).length
  }, [conversations, userId])
}
```

- [ ] **Step 2: Wire up conversations subscription in AppLayout**

In `src/components/layout/AppLayout.tsx`, the conversations subscription should run at the app level so unread count stays current. Check if `useConversationsSubscription` is already called there. If not, add:

```tsx
import { useConversationsSubscription } from '../../hooks/useDirectMessages'
```

And inside the component body:
```tsx
useConversationsSubscription(user?.uid ?? null)
```

- [ ] **Step 3: Add unread badge to BottomNav**

In `src/components/layout/BottomNav.tsx`:

1. Add imports:
```tsx
import { useUnreadMessageCount } from '../../hooks/useUnreadMessages'
import { useAuthStore } from '../../store/authStore'
```

2. Inside the component, add:
```tsx
const { user } = useAuthStore()
const unreadCount = useUnreadMessageCount(user?.uid ?? null)
```

3. In the NavLink render for Messages, add a badge. Find the icon render and wrap it:
```tsx
<div className="relative">
  <item.icon size={24} />
  {item.label === 'Messages' && unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
```

- [ ] **Step 4: Add unread badge to DesktopSidebar**

In `src/components/layout/DesktopSidebar.tsx`:

1. Add same imports as BottomNav:
```tsx
import { useUnreadMessageCount } from '../../hooks/useUnreadMessages'
import { useAuthStore } from '../../store/authStore'
```

2. Inside the component:
```tsx
const { user } = useAuthStore()
const unreadCount = useUnreadMessageCount(user?.uid ?? null)
```

3. In the NavLink render for Messages, add badge after the label:
```tsx
<div className="relative flex items-center gap-3 flex-1">
  <item.icon size={20} />
  <span>{item.label}</span>
  {item.label === 'Messages' && unreadCount > 0 && (
    <span className="ml-auto min-w-[20px] h-[20px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useUnreadMessages.ts src/components/layout/BottomNav.tsx src/components/layout/DesktopSidebar.tsx src/components/layout/AppLayout.tsx
git commit -m "feat: add unread message count badge to navigation"
```

---

### Task 3: Accessibility Fixes

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/components/layout/DesktopSidebar.tsx`
- Modify: `src/components/common/Button.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/EventsPage.tsx`
- Modify: `src/pages/GroupsPage.tsx`
- Modify: `src/pages/ConversationPage.tsx`
- Modify: `src/pages/ModerationPage.tsx`

**Context:** Audit found 5 pages missing h1 tags, no skip-to-main link, no `aria-current="page"` on nav links, and Button component lacking focus styles.

- [ ] **Step 1: Add skip-to-main link in AppLayout**

In `src/components/layout/AppLayout.tsx`, add as the first child inside the outer wrapper:

```tsx
<a
  href="#app-main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
>
  Skip to main content
</a>
```

The `.sr-only` class is already defined in styles.css. The `focus:not-sr-only` makes it visible on keyboard focus.

- [ ] **Step 2: Add aria-current to BottomNav**

In `src/components/layout/BottomNav.tsx`, update the NavLink to include `aria-current`:

React Router's `NavLink` accepts a function for `aria-current`. Update the NavLink render:

```tsx
<NavLink
  to={item.to}
  aria-current={({ isActive }) => isActive ? 'page' : undefined}
  // ... rest of props
>
```

Note: Check how NavLink is currently rendered. If it uses the `className` function form `({ isActive }) =>`, add `aria-current` the same way. If NavLink doesn't support `aria-current` as a function, use a wrapper approach — render `aria-current="page"` conditionally using `useLocation()` to check if the current path matches.

- [ ] **Step 3: Add aria-current to DesktopSidebar**

Same pattern as BottomNav. Update NavLink in DesktopSidebar to include `aria-current="page"` when active.

- [ ] **Step 4: Add focus:ring to Button component**

In `src/components/common/Button.tsx`, add focus styles to the base classes string (line ~42):

Add `focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2` to the base className string.

- [ ] **Step 5: Add h1 to pages missing them**

For each page, add an h1 as the first heading element:

**HomePage.tsx** — Add before the existing content:
```tsx
<h1 className="sr-only">Home</h1>
```
(Visually hidden because the home page greeting serves as the visual heading)

**EventsPage.tsx** — Add as the page title:
```tsx
<h1 className="text-2xl font-display text-forest mb-4">Events</h1>
```

**GroupsPage.tsx** — Add as the page title:
```tsx
<h1 className="text-2xl font-display text-forest mb-4">Groups</h1>
```

**ConversationPage.tsx** — Add as sr-only with participant name:
```tsx
<h1 className="sr-only">Conversation with {otherParticipantName}</h1>
```

**ModerationPage.tsx** — Change the existing h2 to h1:
```tsx
<h1 className="text-2xl font-display text-forest">Moderation</h1>
```

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: Clean build, no type errors

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/AppLayout.tsx src/components/layout/BottomNav.tsx src/components/layout/DesktopSidebar.tsx src/components/common/Button.tsx src/pages/HomePage.tsx src/pages/EventsPage.tsx src/pages/GroupsPage.tsx src/pages/ConversationPage.tsx src/pages/ModerationPage.tsx
git commit -m "fix: accessibility improvements - h1 tags, skip link, focus states, aria-current"
```

---

### Task 4: styles.css Portal Audit & Cleanup

**Files:**
- Modify: `src/styles/styles.css`

**Context:** `styles.css` is 3,133 lines shared between the static HTML site and the React portal. The portal only uses ~17 class families (layout/structural). Static-site-only classes must NOT be removed (needed for Workstream B). This task removes classes that are dead to BOTH the portal AND the static site.

- [ ] **Step 1: Identify truly dead CSS**

Search for classes in styles.css that are NOT referenced in any `.html` file OR any `.tsx` file. Candidates from the audit:

Check these specific patterns against all HTML and TSX files:
- `.blog-card` family — are these used in `kete.html`? (likely yes, keep)
- `.bank-details` — used in `giving.html`? (likely yes, keep)
- `.notification-*` classes — used in portal's NotificationPanel? Check.
- `.search-*` classes — used in portal's SearchPanel? Check.
- `.loading-*` classes — used in `index.html` loading screen? Check `index.css` too.
- Any duplicate rules (the audit found duplicate `.form-input:focus` at lines 1230 and 2709)

- [ ] **Step 2: Remove confirmed dead CSS and deduplicate**

Remove only classes confirmed unused by both systems. Deduplicate any repeated rules.

- [ ] **Step 3: Add section comments for maintainability**

Add clear section markers:
```css
/* ============================================
   STATIC SITE STYLES — used by public HTML pages
   ============================================ */

/* ============================================
   PORTAL LAYOUT — used by React app (load-bearing)
   ============================================ */

/* ============================================
   SHARED UTILITIES — used by both
   ============================================ */
```

- [ ] **Step 4: Verify nothing broke**

Run: `npm run build`
Open static HTML pages in browser to spot-check they still render.

- [ ] **Step 5: Commit**

```bash
git add src/styles/styles.css
git commit -m "chore: audit and organize styles.css, remove dead CSS, add section markers"
```

---

### Task 5: Kete System Audit (Research Only)

**Files:** No modifications — this is an audit task that produces findings.

**Context:** The Kete (blog) system needs verification before we redesign the static `kete.html` page. The research surfaced several issues that need confirmation.

- [ ] **Step 1: Verify CRUD operations**

Start the dev server (`npm run dev`) and test in the browser:

1. **Create a post:** Open KeteForm, fill in title/content, publish. Verify it appears in the Kete listing.
2. **Edit a post:** Open an existing post, modify title, save. Verify changes persist.
3. **Draft vs Published:** Create a draft (uncheck publish). Verify it doesn't appear in the public listing but the author can still see it.
4. **Delete a post:** Delete a test post. Verify it's removed.

- [ ] **Step 2: Verify content rendering**

1. **HTML content:** The KetePostPage uses `dangerouslySetInnerHTML`. Test: create a post with content containing `<strong>`, `<em>`, `<a>`, `<ul>/<li>` tags. Verify they render correctly.
2. **XSS check:** Try content with `<script>alert('xss')</script>` and `<img onerror="alert('xss')" src="x">`. Note if these execute (they shouldn't in React's dangerouslySetInnerHTML for script tags, but img onerror WILL execute).

- [ ] **Step 3: Verify comments**

1. Add a comment to a post. Verify it appears.
2. Delete a comment. Verify it's removed.
3. Try commenting as a non-author, then try deleting (should only allow own comments or admin).

- [ ] **Step 4: Document findings**

Create a findings section with:
- **Working correctly:** List features that pass
- **Issues found:** List any bugs or problems
- **Known gaps (from research):**
  - KeteForm uses plain textarea, not Quill rich text editor
  - `dangerouslySetInnerHTML` without DOMPurify sanitization (XSS risk)
  - `category`, `series`, `tags` fields defined in type but not in form
  - Featured image is URL-only (no Firebase Storage upload)
  - No pagination for posts or comments
  - Query options `authorId`/`category`/`series` defined but not implemented in db.ts

- [ ] **Step 5: Decide scope for fixes**

Based on findings, decide which issues to fix now vs defer:
- **Fix now (if found):** Any broken CRUD, rendering bugs, or security issues
- **Fix with Workstream B:** Rich text editor integration (needed for the kete.html redesign to have good content)
- **Defer to later:** Pagination, category/series/tags management, image upload

No commit for this task unless bugs are fixed.
