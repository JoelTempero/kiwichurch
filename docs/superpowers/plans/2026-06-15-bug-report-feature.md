# Bug Report Feature Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This codebase has **no unit-test runner** — per-task verification is `npm run typecheck` then (final) `npm run build`. Follow existing patterns in the referenced files.

**Goal:** Let members file bug/feedback reports with photos and auto-captured diagnostics; let admins triage them in-app; let Claude read + action them via the Firebase MCP.

**Architecture:** Client-side writes to a new `bugReports` Firestore collection (no Cloud Functions), photos in Storage, gated by Firestore/Storage rules. A boot-time error ring-buffer captures recent console/runtime errors so each report carries a debugging trail. Admin review page mirrors the existing `ModerationPage` pattern.

**Tech Stack:** React 18 + TS + Vite 6, Firebase 11 (Firestore/Storage), TanStack Query 5, Tailwind v4, Lucide, existing `Modal`/`TopTabs`/`Button`/`Avatar` primitives.

**Spec:** `docs/superpowers/specs/2026-06-15-bug-report-feature-design.md`

---

### Task 1: Build constants (`__BUILD_TIME__`, `__GIT_SHA__`, `__APP_VERSION__`)

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Add a `define` block in `vite.config.ts`** (inside the `defineConfig({...})` object, top level). Add an import `import { execSync } from 'node:child_process'` and `import pkg from './package.json'` (the repo uses `resolveJsonModule` via Vite; if `pkg` import errors, read version with `JSON.parse(readFileSync(...))`). Compute:

```ts
function gitSha(): string {
  try { return execSync('git rev-parse --short HEAD').toString().trim() }
  catch { return 'unknown' }
}

// inside defineConfig({ ... }):
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_SHA__: JSON.stringify(gitSha()),
  },
```

- [ ] **Step 2: Declare the globals** in `src/vite-env.d.ts`:

```ts
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
declare const __GIT_SHA__: string
```

- [ ] **Step 3: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 4: Commit** — `git add vite.config.ts src/vite-env.d.ts && git commit -m "feat: inject build version/time/git-sha constants"`

---

### Task 2: Error buffer + diagnostics module

**Files:**
- Create: `src/utils/errorBuffer.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/utils/errorBuffer.ts`:**

```ts
export interface CapturedError {
  at: string
  route: string
  kind: 'error' | 'unhandledrejection' | 'console.error'
  message: string
}

export interface BugReportDiagnostics {
  route: string
  url: string
  userAgent: string
  platform: string
  viewport: string
  appVersion: string
  buildTime: string
  gitSha: string
  recentErrors: CapturedError[]
}

const MAX_ERRORS = 20
const MAX_MSG = 1000
const buffer: CapturedError[] = []
let installed = false

function push(kind: CapturedError['kind'], message: string) {
  try {
    buffer.push({
      at: new Date().toISOString(),
      route: window.location.pathname + window.location.search,
      kind,
      message: (message || '').slice(0, MAX_MSG),
    })
    if (buffer.length > MAX_ERRORS) buffer.shift()
  } catch {
    /* never let capture break the app */
  }
}

export function installErrorBuffer(): void {
  if (installed) return
  installed = true

  window.addEventListener('error', (e) => {
    push('error', e.message || String(e.error || 'Unknown error'))
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    push('unhandledrejection', reason?.message || String(reason))
  })

  const originalConsoleError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    push('console.error', args.map((a) => {
      if (a instanceof Error) return a.message
      if (typeof a === 'string') return a
      try { return JSON.stringify(a) } catch { return String(a) }
    }).join(' '))
    originalConsoleError(...args)
  }
}

export function getRecentErrors(): CapturedError[] {
  return buffer.slice()
}

export function getDiagnostics(): BugReportDiagnostics {
  return {
    route: window.location.pathname + window.location.search,
    url: window.location.href,
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown',
    buildTime: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown',
    gitSha: typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown',
    recentErrors: getRecentErrors(),
  }
}
```

- [ ] **Step 2: Call `installErrorBuffer()` at boot** in `src/main.tsx` — import it and call it as the first statement before `ReactDOM.createRoot(...).render(...)`.

- [ ] **Step 3: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 4: Commit** — `git add src/utils/errorBuffer.ts src/main.tsx && git commit -m "feat: boot-time error buffer + diagnostics snapshot"`

---

### Task 3: BugReport type

**Files:**
- Create: `src/types/bugReport.ts`

- [ ] **Step 1: Create `src/types/bugReport.ts`** (import diagnostics from errorBuffer to keep one source of truth):

```ts
import type { Timestamp } from 'firebase/firestore'
import type { BugReportDiagnostics } from '../utils/errorBuffer'

export type BugReportStatus = 'new' | 'in_progress' | 'resolved' | 'wontfix'

export interface BugReport {
  id: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  description: string
  photoURLs: string[]
  status: BugReportStatus
  adminNotes?: string
  diagnostics: BugReportDiagnostics
  createdAt: Timestamp | Date | null
  updatedAt: Timestamp | Date | null
}

export const BUG_REPORT_STATUS_LABELS: Record<BugReportStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  wontfix: "Won't fix",
}
```

> Note: match the `createdAt`/`updatedAt` typing convention used in `src/types/report.ts` — if that file uses `Timestamp` only or a custom `FirestoreDate`, mirror it exactly instead of the union above.

- [ ] **Step 2: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 3: Commit** — `git add src/types/bugReport.ts && git commit -m "feat: BugReport type"`

---

### Task 4: Storage upload helper

**Files:**
- Modify: `src/services/firebase/storage.ts`

- [ ] **Step 1: Add `uploadBugReportPhoto`** alongside `uploadBoardAttachment` (follow that method's shape). Image-only, 8MB cap:

```ts
  async uploadBugReportPhoto(
    reportId: string,
    file: File,
    onProgress?: ProgressCallback
  ): Promise<UploadResult> {
    if (!isValidImage(file)) {
      throw new Error('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
    }
    if (!isValidSize(file, 8)) {
      throw new Error('Image must be smaller than 8MB')
    }
    const fileName = generateFileName(file.name)
    const path = `bugReports/${reportId}/${fileName}`
    return this.uploadFile(path, file, onProgress)
  },
```

- [ ] **Step 2: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 3: Commit** — `git add src/services/firebase/storage.ts && git commit -m "feat: bug report photo upload helper"`

---

### Task 5: DB service methods

**Files:**
- Modify: `src/services/firebase/db.ts`

- [ ] **Step 1: Add CRUD methods.** Locate the existing `report`/moderation methods in `db.ts` and follow their exact import/collection/`serverTimestamp()` conventions. Add:

```ts
  // ---- Bug reports ----
  createBugReportRef(): string {
    return doc(collection(db, 'bugReports')).id
  },

  async createBugReport(
    id: string,
    data: {
      reporterId: string
      reporterName: string
      reporterEmail: string
      description: string
    }
  ): Promise<void> {
    await setDoc(doc(db, 'bugReports', id), {
      ...data,
      photoURLs: [],
      status: 'new',
      diagnostics: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  async finalizeBugReport(
    id: string,
    photoURLs: string[],
    diagnostics: BugReportDiagnostics
  ): Promise<void> {
    await updateDoc(doc(db, 'bugReports', id), {
      photoURLs,
      diagnostics,
      updatedAt: serverTimestamp(),
    })
  },

  async getBugReports(status?: BugReportStatus): Promise<BugReport[]> {
    const col = collection(db, 'bugReports')
    const q = status
      ? query(col, where('status', '==', status), orderBy('createdAt', 'desc'))
      : query(col, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BugReport)
  },

  async getNewBugReportCount(): Promise<number> {
    const col = collection(db, 'bugReports')
    const snap = await getCountFromServer(query(col, where('status', '==', 'new')))
    return snap.data().count
  },

  async updateBugReport(
    id: string,
    updates: { status?: BugReportStatus; adminNotes?: string }
  ): Promise<void> {
    await updateDoc(doc(db, 'bugReports', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  },
```

Add imports as needed (`setDoc`, `getCountFromServer`, `where`, `orderBy`, `query`, `getDocs` — most already imported) and `import type { BugReport, BugReportStatus } from '../../types/bugReport'`, `import type { BugReportDiagnostics } from '../../utils/errorBuffer'`.

> The two-step create→finalize matches the Kete pre-allocated-id pattern: mint the id, upload photos to `bugReports/{id}/...`, then patch `photoURLs` + `diagnostics`. The rules (Task 8) permit the reporter's self-update to exactly those fields.

- [ ] **Step 2: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 3: Commit** — `git add src/services/firebase/db.ts && git commit -m "feat: bug report db service methods"`

---

### Task 6: TanStack Query hooks

**Files:**
- Create: `src/hooks/useBugReports.ts`

- [ ] **Step 1: Create the hooks** (follow the query-key + invalidation style in `src/hooks/useGatherings.ts`):

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbService } from '../services/firebase/db'
import type { BugReportStatus } from '../types/bugReport'

const KEY = 'bugReports'

export function useBugReports(status?: BugReportStatus) {
  return useQuery({
    queryKey: [KEY, status ?? 'all'],
    queryFn: () => dbService.getBugReports(status),
  })
}

export function useNewBugReportCount(enabled = true) {
  return useQuery({
    queryKey: [KEY, 'newCount'],
    queryFn: () => dbService.getNewBugReportCount(),
    enabled,
    staleTime: 60_000,
  })
}

export function useUpdateBugReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: BugReportStatus; adminNotes?: string } }) =>
      dbService.updateBugReport(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
```

(Create flow lives in the modal, not a hook — it pre-allocates the id and uploads photos inline.)

- [ ] **Step 2: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 3: Commit** — `git add src/hooks/useBugReports.ts && git commit -m "feat: bug report query hooks"`

---

### Task 7: BugReportModal

**Files:**
- Create: `src/components/common/BugReportModal.tsx`

- [ ] **Step 1: Build the modal** on the existing `Modal` primitive. Props: `{ open: boolean; onClose: () => void }`. Behaviour:
  - Description `<textarea>` (required).
  - Optional photo picker: hidden `<input type="file" accept="image/*" multiple>`, button to trigger, thumbnail previews (object URLs) with remove buttons, cap 5.
  - Muted note: "Some technical details about your device and recent errors are attached automatically to help us fix it."
  - Submit handler:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!description.trim() || !user) return
  setSubmitting(true)
  try {
    const id = dbService.createBugReportRef()
    await dbService.createBugReport(id, {
      reporterId: user.id,
      reporterName: user.displayName,
      reporterEmail: user.email,
      description: description.trim(),
    })
    const urls: string[] = []
    for (let i = 0; i < photos.length; i++) {
      const res = await storageService.uploadBugReportPhoto(id, photos[i], (p) =>
        setProgress(Math.round(((i + p / 100) / photos.length) * 100))
      )
      urls.push(res.url)
    }
    await dbService.finalizeBugReport(id, urls, getDiagnostics())
    showToast("Thanks — your report's been sent", 'success')
    onClose()
    // reset local state
    setDescription(''); setPhotos([]); setProgress(null)
  } catch (err) {
    showToast(err instanceof Error && err.message ? err.message : 'Failed to send report', 'error')
  } finally {
    setSubmitting(false)
  }
}
```

  - Use `getDiagnostics` from `../../utils/errorBuffer`, `dbService` from `../../services/firebase/db`, `storageService` from `../../services/firebase/storage`, `useAuth`, `useToast`.
  - Submit button: `loading={submitting}`, label shows `Sending ${progress}%` while uploading (mirror the post-composer pattern), disabled when description empty.

- [ ] **Step 2: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 3: Commit** — `git add src/components/common/BugReportModal.tsx && git commit -m "feat: BugReportModal"`

---

### Task 8: Firestore + Storage rules + index

**Files:**
- Modify: `firestore.rules`
- Modify: `storage.rules`
- Modify: `firestore.indexes.json`

- [ ] **Step 1: Add the `bugReports` match block** to `firestore.rules` (use the existing `isActive()`, `isAdmin()`, `isAuthenticated()` helpers — confirm their names in the file first):

```
    match /bugReports/{reportId} {
      allow create: if isActive()
        && request.resource.data.reporterId == request.auth.uid
        && request.resource.data.description is string
        && request.resource.data.description.size() > 0
        && request.resource.data.description.size() <= 4000;

      allow read: if isAdmin()
        || (isAuthenticated() && resource.data.reporterId == request.auth.uid);

      allow update: if isAdmin()
        || (isActive()
            && resource.data.reporterId == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys()
                 .hasOnly(['photoURLs', 'diagnostics', 'updatedAt']));

      allow delete: if isAdmin();
    }
```

- [ ] **Step 2: Add the Storage rule** to `storage.rules` (alongside the message-board block):

```
    match /bugReports/{reportId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isImage() && isValidSize(8);
      allow delete: if false;
    }
```

- [ ] **Step 3: Add the composite index** to the `indexes` array in `firestore.indexes.json`:

```json
{
  "collectionGroup": "bugReports",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

- [ ] **Step 4: Validate rules** — `npx firebase deploy --only firestore:rules --dry-run` is not reliable; instead run `npm run typecheck` (no-op for rules) and rely on deploy-time validation. Visually re-read the block for brace balance.

- [ ] **Step 5: Commit** — `git add firestore.rules storage.rules firestore.indexes.json && git commit -m "feat: bugReports security rules + index"`

---

### Task 9: BugReportsPage (admin)

**Files:**
- Create: `src/pages/BugReportsPage.tsx`
- Modify: router file (find where `ModerationPage` is lazy-registered — likely `src/App.tsx` or a routes module)

- [ ] **Step 1: Build the page** mirroring `src/pages/ModerationPage.tsx`:
  - Gate to admin (copy ModerationPage's admin gate / redirect).
  - `TopTabs` with New / In progress / Resolved / Won't-fix / All → drives `useBugReports(status)`.
  - Each report card: reporter name + email, relative time (reuse the project's time-ago helper), description, photo thumbnails (anchor `target="_blank"` to the URL), a collapsible **Diagnostics** `<details>` rendering route/device/build + `recentErrors` in a `<pre>` monospace block.
  - Controls: status `<select>` (options from `BUG_REPORT_STATUS_LABELS`) and an `adminNotes` textarea with a Save button → `useUpdateBugReport().mutate(...)`.

- [ ] **Step 2: Register the route** `/bug-reports` using `lazyWithRetry` exactly like the other pages in the router.

- [ ] **Step 3: Verify** — `npm run typecheck`. Expected: clean.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: admin BugReportsPage + route"`

---

### Task 10: Triggers + nav entry

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/components/layout/DesktopSidebar.tsx`

- [ ] **Step 1: Add the trigger button** in ProfilePage's account-actions section and in SettingsPage. Each page holds a local `const [showBugReport, setShowBugReport] = useState(false)` and renders `<BugReportModal open={showBugReport} onClose={() => setShowBugReport(false)} />`. Button uses the Lucide `Bug` icon + label "Report a problem", styled like the adjacent Settings/Sign-out rows.

- [ ] **Step 2: Add the admin nav entry** in `DesktopSidebar.tsx` admin section: a link to `/bug-reports` with the `Bug` icon. Use `useNewBugReportCount(isAdmin)` to render a small count badge when `> 0` (follow the existing unread-badge pattern in the sidebar).

- [ ] **Step 3: Verify** — `npm run typecheck` then `npm run build`. Expected: both clean.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: bug report triggers (Profile/Settings) + admin nav badge"`

---

### Task 11: Final verification + deploy prep

- [ ] **Step 1:** `npm run typecheck` — clean.
- [ ] **Step 2:** `npm run build` — clean.
- [ ] **Step 3:** Re-read `firestore.rules` bugReports block + `storage.rules` for brace balance.
- [ ] **Step 4:** Deploy command (run when Joel approves): `firebase deploy --only firestore:rules,firestore:indexes,storage:rules,hosting`. The index must reach READY before the admin list query works (check via Firebase console / MCP).
- [ ] **Step 5:** Manual dogfood checklist for Joel:
  - File a report (text only) from Profile → appears in admin page as New.
  - File a report with 2 photos → thumbnails open, diagnostics show route/build/errors.
  - Change status + save admin notes → persists.
  - Claude: query `bugReports` via MCP, fetch a photo download URL, view it.

---

## Self-Review Notes

- **Spec coverage:** data model (T3), Storage (T4), diagnostics capture (T1+T2), modal/triggers (T7+T10), admin page (T9), rules+index (T8), Claude ingestion (T11 dogfood + MCP, no code) — all covered.
- **Type consistency:** `BugReportDiagnostics` defined once in `errorBuffer.ts` and imported everywhere; `BugReportStatus` defined in `bugReport.ts`; create→`finalizeBugReport` field set (`photoURLs`,`diagnostics`,`updatedAt`) matches the rules' `hasOnly` allowlist exactly.
- **Watch-outs flagged inline:** confirm `report.ts` timestamp convention (T3), confirm rule-helper names (T8), confirm router location (T9).
