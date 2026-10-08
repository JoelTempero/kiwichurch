# Web Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Per Joel's global rules this plan is a task list (<200 lines); code lives in source files, not here.

**Goal:** Real OS push notifications (app closed included) plus the icon badge on iPhone, Android and desktop, driven by every `notifications` doc.

**Architecture:** A Firestore `onDocumentCreated('notifications/{id}')` Cloud Function sends data-only FCM messages to per-device tokens in `users/{uid}/pushTokens`. A custom `injectManifest` service worker displays them and sets the badge. The client gets a push service, a hook, a home banner and a Settings toggle.

**Tech Stack:** firebase-functions v2 + firebase-admin (Node 20, TS), `firebase/messaging` 11, vite-plugin-pwa `injectManifest` + workbox-* modules, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-09-web-push-notifications-design.md`

## Global Constraints
- Function region `us-central1` (Firestore is `nam5`). Deploy with `--account leojfx@gmail.com`.
- Data-only FCM payload; the service worker ALWAYS calls `showNotification` per push (iOS revokes permission for silent pushes).
- `registerType: 'autoUpdate'` stays; the service worker must `skipWaiting()` + `clientsClaim()`. Never prompt mode.
- Badge = unread, non-muted notifications, capped at 99. The same formula on server and client.
- Do not modify the existing notification write sites in `db.ts` (except `markConversationRead`, Task 7).
- `VITE_FIREBASE_VAPID_KEY` is optional: if unset, `getToken` uses FCM's default key (no console step needed).
- Every `localStorage` / `setAppBadge` call is wrapped so it can never throw into the UI.
- Hooks sit above any early `return` (React #310 lesson).

## Review Focus
1. iPhone Safari (not installed) taps the banner → status `needs-install`, the install hint shows, and `requestPermission` is never called. (Task 5 test)
2. A notification with no `link` → the click opens `/home?n=id`. A link that already has a query (`/home?post=x`) → `&n=id`, not a second `?`. (Task 1 test, `buildClickUrl`)
3. 0 unread → the badge is cleared (no "0"). >99 → `99`. All unread muted → 0. (Task 1 test)
4. A send where some tokens are dead and some fine → only the dead ones are deleted; any other error code (e.g. `messaging/internal-error`) keeps its token. (Task 1 test)
5. Shared device: user A signs out, user B signs in and enables → A's token doc is gone (deleted on sign-out) so A's pushes don't land on B's device. (Task 6 manual check)

---

### Task 1: `functions/` scaffold + pure push logic (TDD)
**Files:** Create `functions/package.json`, `functions/tsconfig.json`, `functions/src/pushLogic.ts`, `functions/src/pushLogic.test.ts`; modify `firebase.json` (add `"functions": { "source": "functions", "predeploy": ["npm --prefix functions run build"] }`), `.gitignore` (`functions/lib`, `functions/node_modules`).
**Produces:** `shouldSend(user: {status?: string; mutedNotificationCategories?: string[]} | undefined, type: string): boolean` · `computeBadge(unreadTypes: string[], muted: string[]): number` · `deadTokens(tokens: string[], responses: {success: boolean; error?: {code: string}}[]): string[]` · `buildPayload(n: {title; message; link?; type}, id: string, badge: number): Record<string,string>` (keys `title, body, link, notificationId, type, badge, tag`; tag `dm:{link}` for `direct_message`, else `n:{id}`; link defaults to `/home`) · `buildClickUrl(link: string, id: string): string`.
`buildClickUrl` is also needed by the service worker, so put it in a shared `src/utils/pushClickUrl.ts` that both import. The functions tsconfig `include`s that one file via a relative path, or it's duplicated with a test in each; pick the copy if the cross-package import fights tsc.
- [ ] Write Vitest tests: shouldSend (deactivated→false, muted type→false, missing user→false, normal→true); computeBadge (0, mixed muted, 150→99); deadTokens (not-registered + invalid-registration-token removed, internal-error kept, success kept); buildPayload (DM tag, default link, badge stringified); buildClickUrl (no query, existing query, empty link)
- [ ] Run → FAIL
- [ ] Implement `pushLogic.ts`
- [ ] `npm --prefix functions test` → PASS
- [ ] Commit `feat(functions): push logic helpers`

### Task 2: `onNotificationCreated` trigger + `pushTokens` rules
**Files:** Create `functions/src/index.ts`; modify `firestore.rules` (nested `match /pushTokens/{token}` under `/users/{userId}`: read/write only if `request.auth.uid == userId`).
**Consumes:** Task 1 helpers. **Produces:** exported function `onNotificationCreated`.
- [ ] Implement the spec §2 steps 1–6 with `setGlobalOptions({ region: 'us-central1' })`. Unread query = `where('userId','==',uid).where('read','==',false).limit(200)` (existing index). Per-token errors are logged and never rethrown.
- [ ] `npm --prefix functions run build` clean; validate rules (`firebase emulators:exec` compile, or a rules-validate call)
- [ ] Commit `feat(functions): push on notification create + pushTokens rules`

### Task 3: Status-bar badge icon
**Files:** Create `scripts/make-badge-icon.cjs`, `public/icons/badge-96.png`.
- [ ] Script (using `sharp` if present, else a pure-PNG approach via an already-installed dep) turns `public/icons/icon-512.png` into a 96×96 white silhouette on transparent: alpha = luminance-thresholded logo. Eyeball the output with Read. If it isn't clean, fall back to using `icon-192.png` as the badge (note it in the commit).
- [ ] Commit `feat(pwa): monochrome notification badge icon`

### Task 4: Custom service worker (`injectManifest`)
**Files:** Create `src/sw.ts`; modify `vite.config.ts` (VitePWA → `strategies:'injectManifest'`, `srcDir:'src'`, `filename:'sw.ts'`, `injectManifest:{ globPatterns, globIgnores }` copied from today's workbox block; delete the `workbox` block, including the Firestore runtime cache); add the needed `workbox-*` devDeps; `tsconfig` excludes `src/sw.ts` from the DOM lib or gets a `/// <reference lib="webworker" />` header.
**Consumes:** `buildClickUrl`.
- [ ] `sw.ts`: `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`, `precacheAndRoute(self.__WB_MANIFEST)`, `NavigationRoute(createHandlerBoundToURL('/app.html'), { denylist: [/^\/$/, /\.html/] })`, the two Google Fonts `CacheFirst` routes (webfonts `ExpirationPlugin` 1y)
- [ ] `push` handler + `notificationclick` handler exactly as spec §3 (focus a matching client + `navigate`, else `openWindow`)
- [ ] `npm run build` → `dist/sw.js` exists, contains the precache manifest and no `firestore.googleapis` string
- [ ] `vite preview` regression list (spec §Testing): fresh register; update over the prod service worker (build at `HEAD~` first, load it, then build the new one and reload, checking it activates); offline reload → app shell; `/` and `*.html` not intercepted
- [ ] Commit `feat(pwa): custom service worker with push + click handling, drop firestore SW cache`

### Task 5: Client push service + `usePushNotifications`
**Files:** Create `src/services/firebase/push.ts`, `src/hooks/usePushNotifications.ts`, `src/hooks/usePushNotifications.test.ts`; modify `src/services/firebase/config.ts` (export `app`), `.env.example` (`VITE_FIREBASE_VAPID_KEY=` optional), `src/vite-env.d.ts`.
**Produces:** `isPushSupported(): Promise<boolean>` · `enablePush(uid): Promise<'on'|'blocked'>` · `refreshPushToken(uid): Promise<void>` · `disablePush(uid): Promise<void>` · `usePushNotifications(uid: string|null): { status: 'unsupported'|'needs-install'|'off'|'on'|'blocked'; enable(): Promise<void>; disable(): Promise<void>; busy: boolean }` · pure `resolvePushStatus({supported, ios, standalone, permission, hasToken})` (exported for tests).
- [ ] Tests for `resolvePushStatus`: iOS non-standalone → needs-install (even if unsupported); denied → blocked; granted + token → on; granted without token → off; default → off; unsupported → unsupported
- [ ] Implement. Token presence = a `localStorage` key `kc-push-token:{uid}` (wrapped), set on enable and cleared on disable. Reuse `isIos` / standalone detection from `usePwaInstall` (export them).
- [ ] `getToken` errors surface via `toast.error(err.message)` in `enable()`
- [ ] Tests pass; typecheck clean; commit `feat(push): client push service + status hook`

### Task 6: UI: banner, Settings toggle, sign-out cleanup
**Files:** Create `src/components/common/EnablePushBanner.tsx`; modify `src/pages/HomePage.tsx` (render under the password banner), `src/pages/SettingsPage.tsx` (replace the browser-notification toggle with "Notifications on this device" from the hook + blocked help text), `src/hooks/useAuth.ts` (`signOut` awaits `disablePush(uid)` wrapped in a try/catch first).
**Consumes:** `usePushNotifications`.
- [ ] Banner copy and states per spec §6; 30-day dismiss key `kc-push-banner-dismissed-at`
- [ ] Settings: remove the `webNotifications` permission imports and state
- [ ] Typecheck + build; commit `feat(push): enable banner, settings toggle, sign-out token cleanup`

### Task 7: Consistency changes
**Files:** Modify `src/hooks/useAppBadge.ts` (formula = unread non-muted; drop messages count + DM exclusion), `src/services/firebase/db.ts` `markConversationRead` (also batch `read:true` on the user's unread `direct_message` notifications whose `link === /messages/{conversationId}`; check the actual DM link format in `sendMessage` first), `src/components/layout/AppLayout.tsx` (`?n=` → `markNotificationRead` + `navigate(pathname + rest, {replace:true})`), `src/hooks/useNotifications.ts` (remove the `showNotification` loop + `prevIdsRef`), delete `src/utils/webNotifications.ts` if it has no remaining imports.
- [ ] Implement; `grep` shows no `new Notification(` in `src`
- [ ] `npm test` + typecheck + build; commit `fix(notifications): unified badge formula, DM notifs clear on read, ?n= marks read`

### Task 8: Deploy + verify
- [ ] `cd functions && npm i`; `firebase deploy --only functions,firestore:rules --account leojfx@gmail.com` (first deploy may ask to enable APIs: Cloud Build, Artifact Registry, Eventarc. Accept)
- [ ] Smoke-test the function: create a notification doc for Joel via the Admin SDK, then check `firebase functions:log` shows "no tokens" (expected before enabling)
- [ ] `npm run build && firebase deploy --only hosting --account leojfx@gmail.com`
- [ ] Joel: enable on a phone, then Claude writes a test notification via the Admin SDK and confirms delivery, badge and deep link. Then run the device matrix from the spec.
- [ ] Draft the community announcement copy for Joel to post (iPhone: add to Home Screen → tap Turn on)
- [ ] Update CLAUDE.md (session log + Key Decisions: push architecture, SW now `injectManifest`, Firebase account); commit
