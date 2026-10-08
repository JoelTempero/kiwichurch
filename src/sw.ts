/// <reference lib="webworker" />
// Kiwi Church service worker (vite-plugin-pwa injectManifest).
// Replaces the old generated worker: same precache / app-shell / font caching,
// plus web push display and notification-click routing.
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { buildClickUrl } from './utils/pushClickUrl'

declare const self: ServiceWorkerGlobalScope

// autoUpdate semantics — a new worker takes over immediately (never prompt mode).
self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA app shell for portal routes; the root (static homepage) and any *.html
// page (static site) must go to the network untouched.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/app.html'), {
    denylist: [/^\/$/, /\.html/],
  })
)

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({ cacheName: 'google-fonts-stylesheets' })
)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
)

// ---------- Web push ----------

interface PushData {
  title?: string
  body?: string
  link?: string
  notificationId?: string
  badge?: string
  tag?: string
}

function readPushData(event: PushEvent): PushData {
  try {
    const json = event.data?.json() as { data?: PushData } | PushData | undefined
    if (!json) return {}
    // FCM wraps the data payload in { data: {...} }
    return ('data' in json && json.data ? json.data : json) as PushData
  } catch {
    return { body: event.data?.text() }
  }
}

self.addEventListener('push', (event) => {
  const data = readPushData(event)
  const badge = Number(data.badge ?? 0)

  // Always show something: iOS revokes push permission for silent pushes.
  const show = self.registration.showNotification(data.title || 'Kiwi Church', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: data.tag || data.notificationId,
    data: { link: data.link || '/home', notificationId: data.notificationId || '' },
  })

  const nav = self.navigator as WorkerNavigator & {
    setAppBadge?: (n?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
  const setBadge = nav.setAppBadge
    ? (badge > 0 ? nav.setAppBadge(badge) : nav.clearAppBadge?.() ?? Promise.resolve()).catch(() => {})
    : Promise.resolve()

  event.waitUntil(Promise.all([show, setBadge]))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const { link, notificationId } = (event.notification.data || {}) as { link?: string; notificationId?: string }
  const target = notificationId ? buildClickUrl(link || '/home', notificationId) : link || '/home'
  const url = new URL(target, self.location.origin).href

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existing = windows.find((c) => new URL(c.url).origin === self.location.origin) as WindowClient | undefined
      if (existing) {
        await existing.focus()
        try {
          await existing.navigate(url)
          return
        } catch {
          // navigate() fails for uncontrolled clients — fall through to a new window.
        }
      }
      await self.clients.openWindow(url)
    })()
  )
})
