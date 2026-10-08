# Web Push Notifications — Design

**Date:** 2026-10-09
**Status:** Approved in conversation, awaiting spec review
**Approach:** Firebase Cloud Messaging (FCM) + Firestore-triggered Cloud Function + custom service worker

## Problem

Notifications don't reach phones. Testers report the app's notifications feel unreliable, most of all "they just don't show up on phones."

Root causes found:
1. **OS notifications are created page-side with `new Notification()`** (`src/utils/webNotifications.ts:28`). Android Chrome throws `Illegal constructor` on that, and iOS doesn't let pages create notifications at all (push only). On phones this path has never worked.
2. **There is no server push.** A closed app gets nothing. The bell only works while the app is open, through a Firestore `onSnapshot`.
3. **The service worker caches `firestore.googleapis.com` with `NetworkFirst`** (`vite.config.ts`), which plausibly serves stale Firestore listen responses. This is a likely contributor to "the bell missing things."
4. The app-icon badge (`useAppBadge`, shipped 2026-10-09) only updates while the app is running.

## Goals and success criteria

- When something lights up a member's bell, their phone gets a real OS notification, **even with the app closed**, and the home-screen icon badge updates.
- **Success:** Darryl gets a comment notification on his iPhone lock screen with the app closed, and tapping it opens that post with comments showing.
- Works on: iPhone (iOS 16.4+, home-screen app), Android Chrome (installed or browser), desktop Chrome/Edge.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Billing | Project `kiwichurch-1ef0f` is already on Blaze (billing verified enabled 2026-10-09). |
| Delivery pipe | FCM (chosen over raw VAPID web-push and OneSignal). |
| Opt-in UX | A home-page banner nudge plus a per-device toggle in Settings. |
| Mute settings | The existing `mutedNotificationCategories` also suppress push. |
| Badge formula | **One formula everywhere:** count of unread, non-muted notifications. |
| iPhone | Push requires the home-screen app; the banner shows the install hint otherwise. |

## Architecture

```
any client write ─► notifications/{id} ─► onNotificationCreated (Cloud Function)
                                            │  load user → skip if deactivated / muted
                                            │  load users/{uid}/pushTokens
                                            │  badge = count unread non-muted
                                            ▼
                                     FCM sendEachForMulticast (data-only)
                                            ▼
                                 src/sw.ts 'push' → showNotification + setAppBadge
                                            ▼
                         'notificationclick' → focus/open  link?n={notificationId}
                                            ▼
                         AppLayout: mark notification read, strip ?n=
```

All ~8 existing notification write sites in `db.ts` (comments, mentions, DMs, announcements, RSVPs, event updates, group adds, family links) get push automatically. **No change to existing write paths.**

## Components

### 1. Token storage
- `users/{uid}/pushTokens/{token}`: one doc per device. The doc ID is the FCM token (dedupes re-registration; tokens contain no `/`).
- Fields: `token: string`, `userAgent: string`, `createdAt: Timestamp`, `lastSeenAt: Timestamp`.
- `firestore.rules`: nested match under `/users/{userId}`. Only the owner (`request.auth.uid == userId`) can read, create, update or delete. No admin access.

### 2. Cloud Function: `onNotificationCreated`
- New `functions/` codebase (TypeScript, firebase-functions v2, firebase-admin). Add the `functions` block to `firebase.json`.
- Trigger: `onDocumentCreated('notifications/{id}')`. **Region `us-central1`**, because the Firestore database is in the `nam5` multi-region.
- Steps:
  1. Read the notification doc (`userId`, `type`, `title`, `message`, `link`).
  2. Read `users/{userId}`. Return early if `status === 'deactivated'` or `type ∈ mutedNotificationCategories`.
  3. Read `users/{userId}/pushTokens`. Return early if there are none.
  4. Compute `badge` = number of the user's notifications with `read == false` and type not muted. (Query `where userId == X, where read == false`; this uses the existing `(userId, read, createdAt)` index. Filter muted types in memory, capped at 99.)
  5. `admin.messaging().sendEachForMulticast({ tokens, data: { title, body, link, notificationId, type, badge, tag }, webpush: { headers: { Urgency: 'high', TTL: '86400' } } })`. **Data-only**, so the service worker controls display. `tag` = `dm:{link}` for `direct_message`, otherwise `n:{notificationId}`.
  6. For each response with error `messaging/registration-token-not-registered` or `messaging/invalid-registration-token`, delete that token doc.
- Pure helpers in `functions/src/pushLogic.ts` (unit-tested): `shouldSend(user, notification)`, `computeBadge(unreadTypes, muted)`, `deadTokens(tokens, responses)`, `buildPayload(notification, badge)`.
- Failures are logged per token and never thrown back at the trigger, so the notification doc and the bell are unaffected by push failures.

### 3. Service worker (`src/sw.ts`)
- vite-plugin-pwa: `strategies: 'injectManifest'`, `srcDir: 'src'`, `filename: 'sw.ts'`. `registerType: 'autoUpdate'` stays. Same output path `/sw.js`.
- Must keep today's behaviour:
  - `precacheAndRoute(self.__WB_MANIFEST)` with the same glob patterns and ignores, plus `cleanupOutdatedCaches()`
  - Navigation fallback to `/app.html` with the denylist `[/^\/$/, /\.html/]`
  - Google Fonts runtime caching (stylesheets CacheFirst; webfonts CacheFirst with a 1-year expiry)
  - `self.skipWaiting()` + `clientsClaim()` (autoUpdate semantics; prompt mode stays rejected, see the 2026-05-13 decision log)
- **Removed:** the `firestore.googleapis.com` runtime cache rule.
- `push` handler: parse `event.data.json().data`. In `event.waitUntil`:
  - `showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/badge-96.png', tag, data: { link, notificationId } })`
  - **New asset `public/icons/badge-96.png`**: a 96×96 white logo silhouette on transparent, used by Android for the status-bar icon (it renders only the alpha channel). Generate it from the existing logo with a script; fall back to `icon-192.png` if it isn't ready.
  - `navigator.setAppBadge(Number(badge))` where supported
  - **Always show**: iOS revokes push permission for pushes that don't display anything.
- `notificationclick` handler: close the notification. Target URL = `link` + `?n={notificationId}` (or `&n=` if the link already has a query). Focus an existing client and `navigate()` it if one exists, otherwise `clients.openWindow(target)`.

### 4. Client push service (`src/services/firebase/push.ts`)
- `isPushSupported()`: needs `serviceWorker`, `PushManager`, `Notification` and `isSupported()` from `firebase/messaging`.
- `enablePush(uid)`: `Notification.requestPermission()`, then `getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: await navigator.serviceWorker.ready })`, then `setDoc(users/{uid}/pushTokens/{token})`. Must be called from a user gesture.
- `refreshPushToken(uid)`: on app load when permission is `granted`. Gets the token, then upserts the doc with `lastSeenAt` (tokens rotate).
- `disablePush(uid)`: `deleteToken(messaging)` + delete the doc.
- `VITE_FIREBASE_VAPID_KEY` added to `.env` and `.env.example` (a public key, generated once in Firebase Console → Cloud Messaging → Web Push certificates).

### 5. `usePushNotifications()` hook
- Status: `'unsupported' | 'needs-install' | 'off' | 'on' | 'blocked'`.
  - `needs-install` = iOS and not running as the installed app (reuse the detection from `usePwaInstall`).
  - `on` = permission granted **and** this device's token is saved.
  - `blocked` = permission `denied`.
- Exposes `enable()` / `disable()`, and calls `refreshPushToken` on mount when the status is `on`.

### 6. UI
- **`EnablePushBanner`** on HomePage, styled like the forest-tinted `mustChangePassword` banner:
  - `off`: "Get notified about comments, messages and announcements" + **Turn on** button
  - `needs-install`: "Add Kiwi Church to your Home Screen to get notifications" + the Share → Add to Home Screen hint
  - `on` / `blocked` / `unsupported`: hidden
  - Dismiss = 30-day `localStorage` cooldown (try/catch wrapped)
- **Settings → Notifications:** replace the browser-notifications toggle with **"Notifications on this device"**, driven by the hook. `blocked` shows help text for re-enabling in phone or browser settings. The 7 category toggles are unchanged.

### 7. Consistency changes
- **`useAppBadge`** switches to the shared formula: unread, non-muted notifications. Drop the separate conversation count and the `direct_message` exclusion.
- **Opening a conversation marks its DM notifications read.** `markConversationRead` also batch-updates the user's unread `direct_message` notifications whose `link` matches that conversation. Without this, the badge and bell keep counting messages already read.
- **`?n=` handling** in `AppLayout`: on a route with `?n=<id>`, call `markNotificationRead(id)` (ignore errors) and `replace`-navigate without the parameter.
- **Remove the page-side `new Notification()`** path: `showNotification` in `src/utils/webNotifications.ts` and its call in `useNotificationsSubscription`. The real-time subscription stays (bell + cache invalidation). Delete `webNotifications.ts` if nothing else uses it.
- **Sign out** calls `disablePush(uid)` first, so a shared device stops getting the previous user's pushes.

## Error handling
- Function: per-token try/log. A dead token is deleted, nothing throws back at the trigger, and the notification doc is unaffected.
- Client: `enablePush` failures show a toast with the real error message (same pattern as the 2026-06-15 upload fix). Permission denied moves the status to `blocked`, not an error.
- `setAppBadge` / `clearAppBadge` rejections are swallowed (already the pattern in `useAppBadge`).

## Testing
- **Vitest:** `functions/src/pushLogic.ts` helpers (should-send matrix, badge formula with mutes, dead-token selection, payload/tag building).
- **Service-worker regression via `vite preview`, before any deploy:**
  - a fresh install registers `/sw.js`
  - updating over the current production service worker activates without a stuck waiting state
  - an offline reload serves `/app.html`
  - the static `.html` pages are not intercepted
  - stale-chunk recovery through `lazyWithRetry` still works
- **Function:** deploy, then trigger by creating a test notification for Joel's account. Check the logs and that the token cleanup path runs.
- **Manual device matrix** (needs Joel or a tester): desktop Chrome, Android Chrome (installed PWA), and iPhone home-screen app, each with the app **closed / backgrounded / open**:
  - the notification arrives
  - the badge number is correct
  - tapping deep-links to the post with comments open and clears it from the bell
  - a muted category doesn't push
  - after sign-out, that device stops receiving

## Deploy order
1. `functions` (+ `firestore:rules` for `pushTokens`), with `--account leojfx@gmail.com`
2. `hosting` (new service worker + client)
3. Post a community announcement telling testers to tap **Turn on** (iPhone: add to Home Screen first).

## Out of scope
Email/SMS, scheduled reminders (e.g. "event tomorrow"), quiet hours, per-device category settings, and push for the public static site.
