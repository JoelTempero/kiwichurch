# Bug Report Feature — Design

**Date:** 2026-06-15
**Status:** Approved (design), pending implementation plan
**Author:** Claude + Joel

## Purpose

Give members a way to report things that aren't working or changes they'd like, including photos. Admins review and triage them in-app. Claude Code (running on Joel's machine) reads the reports via the Firebase MCP — including the attached photos and auto-captured technical diagnostics — and actions them, then closes the loop by marking the report resolved.

The diagnostics capture is the load-bearing part: it turns a vague "the image post didn't work" into a report carrying the route, device, app build, and recent console/network errors — exactly what was missing when diagnosing the silent upload hang (issue #1, fixed 2026-06-15).

## Non-goals

- Not a replacement for the existing `reports` collection (that reports *content/users* for moderation) or `contactMessages` (static-site contact form). This is about the *app itself*.
- No email/push notification to admins on new reports (v1 — admins check the page; a "New" count badge in the nav is enough).
- No public/anonymous reporting — reporter must be a signed-in active member.
- No Cloud Functions. All writes are client-side, gated by Firestore rules, matching the rest of the platform.

## Data model

### Firestore: `bugReports/{reportId}`

```ts
interface BugReport {
  id: string
  // Reporter
  reporterId: string
  reporterName: string
  reporterEmail: string
  // Content
  description: string            // required, trimmed, 1–4000 chars
  photoURLs: string[]            // 0–5 Storage download URLs
  // Triage
  status: 'new' | 'in_progress' | 'resolved' | 'wontfix'
  adminNotes?: string            // admin-only triage notes
  // Auto-captured diagnostics (see below)
  diagnostics: BugReportDiagnostics
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface BugReportDiagnostics {
  route: string                  // e.g. "/groups/KG4..."
  url: string                    // full href
  userAgent: string
  platform: string               // navigator.platform / UA-CH where available
  viewport: string               // "390x844"
  appVersion: string             // package.json version
  buildTime: string              // injected __BUILD_TIME__ (ISO)
  gitSha: string                 // injected __GIT_SHA__ (short)
  recentErrors: CapturedError[]  // last ~20, newest last
}

interface CapturedError {
  at: string                     // ISO timestamp
  route: string                  // route when it fired
  kind: 'error' | 'unhandledrejection' | 'console.error'
  message: string                // truncated to ~1000 chars
}
```

### Storage: `bugReports/{reportId}/{fileName}`

Photos uploaded via the existing `storageService.uploadFile` resumable path. New
`storageService.uploadBugReportPhoto(reportId, file, onProgress)` helper: image-only,
8MB cap, reuses `generateFileName`.

## Diagnostics capture mechanism

New module `src/utils/errorBuffer.ts`:

- A module-level ring buffer holding the last 20 `CapturedError` entries.
- `installErrorBuffer()` — called once at app boot (in `main.tsx`, before render):
  - `window.addEventListener('error', …)` → captures uncaught errors.
  - `window.addEventListener('unhandledrejection', …)` → captures rejected promises.
  - Wraps `console.error` (chaining to the original) → captures app-logged errors
    (e.g. the `console.error('Failed to create post', …)` calls).
- `getRecentErrors()` — returns a snapshot copy of the buffer for the report.
- `getDiagnostics()` — assembles the full `BugReportDiagnostics` object from
  `window.location`, `navigator`, `window.innerWidth/Height`, the injected build
  constants, and `getRecentErrors()`.

Guards: messages truncated to ~1000 chars; buffer is capped; the `console.error`
wrapper must never throw (defensive try/catch) so it can't itself break the app.
Route is read live at capture time, not error time, for the top-level fields.

### Build constants

`vite.config.ts` gains a `define` block injecting:
- `__APP_VERSION__` — from `package.json` version.
- `__BUILD_TIME__` — `new Date().toISOString()` at build time.
- `__GIT_SHA__` — `git rev-parse --short HEAD` via `execSync`, wrapped in try/catch
  (falls back to `'unknown'` so a non-git environment still builds).

Declared in `src/vite-env.d.ts` as `declare const __APP_VERSION__: string` etc.

## User-facing surface

### `BugReportModal` (`src/components/common/BugReportModal.tsx`)

- Built on the existing `Modal` primitive.
- Fields:
  - Description `textarea` (required, placeholder "What went wrong, or what would you like changed?").
  - Optional photo picker — multi-select, `accept="image/*"`, shows thumbnails with
    remove buttons, max 5. Reuses the drag/preview conventions from the post composer.
  - A muted note: "Some technical details about your device and recent errors are
    attached automatically to help us fix it." (transparency — no hidden surveillance feel).
- Submit flow:
  1. Validate description non-empty.
  2. `dbService.createBugReport(...)` to mint the doc id (pre-allocate, like Kete) so
     photo Storage paths are stable.
  3. Upload each photo via `uploadBugReportPhoto` (sequential, with a combined
     progress indicator); collect `photoURLs`.
  4. Patch the report doc with `photoURLs` + `diagnostics` (diagnostics snapshotted at
     submit time).
  5. Success toast ("Thanks — your report's been sent"), close modal, reset.
- Errors surface the real message (matching the #1 fix), and the 45s upload timeout
  applies, so it can't hang.

### Triggers

A reusable "Report a problem" button (bug icon) placed in:
- **ProfilePage** account-actions section (next to Settings / Sign out).
- **SettingsPage** (its own small row/section, visible to all users).

Both open the same `BugReportModal`. A shared `useBugReportModal` context or a simple
local `useState` per page — lean toward a tiny `BugReportProvider` so the modal mounts
once and both triggers just call `open()`. (Decide in the plan; either is fine.)

## Admin review surface

### `BugReportsPage` (`src/pages/BugReportsPage.tsx`)

Mirrors `ModerationPage` conventions. Admin-only (gated in the page + the rules).

- Route `/bug-reports`, lazy-loaded via `lazyWithRetry`.
- Nav entry in the **admin section** of `DesktopSidebar` (Bug icon) with a count badge
  of `status === 'new'` reports.
- Status tabs: **New / In progress / Resolved / Won't-fix / All** (the `TopTabs`
  primitive).
- Each report card shows: reporter name + email, relative time, description, photo
  thumbnails (click → lightbox / open in new tab), and a **collapsible Diagnostics**
  block (route, device, build, and the recent-errors list rendered monospace).
- Admin controls per card: status `<select>` and an admin-notes textarea (debounced
  save), via `dbService.updateBugReport(id, { status, adminNotes })`.

### Hooks

`src/hooks/useBugReports.ts`:
- `useBugReports(statusFilter?)` — admin list query, newest-first.
- `useNewBugReportCount()` — count of `status === 'new'` for the nav badge.
- `useCreateBugReport()`, `useUpdateBugReport()` mutations.

## Security rules

### Firestore (`firestore.rules`)

```
match /bugReports/{reportId} {
  // Any active member can file a report about themselves.
  allow create: if isActive()
    && request.resource.data.reporterId == request.auth.uid
    && request.resource.data.description is string
    && request.resource.data.description.size() > 0
    && request.resource.data.description.size() <= 4000
    && request.resource.data.photoURLs.size() <= 5;

  // Reporter can read their own; admins read all.
  allow read: if isAdmin()
    || (isAuthenticated() && resource.data.reporterId == request.auth.uid);

  // Only admins triage (status / notes). The two-step create→patch for
  // photoURLs+diagnostics is done by the reporter, so allow a self-update
  // limited to those fields while status is still 'new'.
  allow update: if isAdmin()
    || (isActive()
        && resource.data.reporterId == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['photoURLs', 'diagnostics', 'updatedAt']));

  allow delete: if isAdmin();
}
```

(Exact helper names — `isActive()`, `isAdmin()`, `isAuthenticated()` — already exist
in the rules file.)

### Storage (`storage.rules`)

```
match /bugReports/{reportId}/{fileName} {
  allow read: if isAuthenticated();      // admin + reporter view; URLs are unguessable
  allow write: if isAuthenticated() && isImage() && isValidSize(8);
  allow delete: if false;
}
```

## How Claude actions reports

No new tooling — uses the existing Firebase MCP:
1. `firestore_query_collection` on `bugReports` filtered to `status == 'new'`,
   ordered by `createdAt`.
2. For each: read description + diagnostics (route/build/recentErrors give the
   root-cause lead), and for photos call `storage_get_object_download_url`, `curl`
   the file locally, and view it with the Read tool.
3. Fix the issue in source.
4. `firestore_update_document` to set `status: 'in_progress'` → `'resolved'` and append
   an `adminNotes` line ("Fixed in <deploy> — <summary>"), closing the loop so Joel and
   the reporter see it's handled.

A composite index `bugReports(status ASC, createdAt DESC)` is added to
`firestore.indexes.json` for the admin list + Claude's query.

## Files

**New:**
- `src/types/bugReport.ts`
- `src/utils/errorBuffer.ts`
- `src/components/common/BugReportModal.tsx`
- `src/hooks/useBugReports.ts`
- `src/pages/BugReportsPage.tsx`

**Modified:**
- `src/main.tsx` — `installErrorBuffer()` at boot.
- `vite.config.ts` + `src/vite-env.d.ts` — build constants.
- `src/services/firebase/storage.ts` — `uploadBugReportPhoto`.
- `src/services/firebase/db.ts` — `createBugReport`, `updateBugReport`, `getBugReports`, `getNewBugReportCount`.
- `src/pages/ProfilePage.tsx`, `src/pages/SettingsPage.tsx` — trigger button.
- `src/components/layout/DesktopSidebar.tsx` — admin nav entry + badge.
- `src/App.tsx` (or router) — `/bug-reports` route.
- `firestore.rules`, `storage.rules`, `firestore.indexes.json`.

## Open decisions deferred to the plan

- Modal mount strategy: shared provider vs per-page local state (lean: provider).
- Whether the reporter sees their own past reports (nice-to-have; out of v1 unless cheap).
