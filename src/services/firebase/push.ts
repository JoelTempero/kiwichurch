// Web push (FCM) registration for this device. The server side lives in
// functions/src/index.ts (onNotificationCreated); display happens in src/sw.ts.
import { getMessaging, getToken, deleteToken, isSupported, type Messaging } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { app, db } from './config'
import { withTimeout } from '@/utils/withTimeout'

const TOKEN_KEY = (uid: string) => `kc-push-token:${uid}`
const SW_READY_TIMEOUT_MS = 10_000
const CLEANUP_TIMEOUT_MS = 3_000

let messagingPromise: Promise<Messaging | null> | null = null

function messaging(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((ok) => (ok ? getMessaging(app) : null))
      .catch(() => null)
  }
  return messagingPromise
}

export function getStoredToken(uid: string): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY(uid))
  } catch {
    return null
  }
}

function storeToken(uid: string, token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY(uid), token)
    else localStorage.removeItem(TOKEN_KEY(uid))
  } catch {
    // storage blocked — status falls back to 'off', which is harmless
  }
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return false
  return (await messaging()) !== null
}

async function swRegistration(): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('The app is still starting up — try again in a moment.')), SW_READY_TIMEOUT_MS)
    ),
  ])
}

async function fetchToken(): Promise<string> {
  const m = await messaging()
  if (!m) throw new Error('Notifications are not supported on this device.')
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined
  return getToken(m, { vapidKey, serviceWorkerRegistration: await swRegistration() })
}

function tokenRef(uid: string, token: string) {
  return doc(db, 'users', uid, 'pushTokens', token)
}

async function saveToken(uid: string, token: string, isNew: boolean) {
  await setDoc(
    tokenRef(uid, token),
    {
      token,
      userAgent: navigator.userAgent.slice(0, 300),
      lastSeenAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true }
  )
}

/** Must run from a user gesture (tap) — iOS rejects permission prompts otherwise. */
export async function enablePush(uid: string): Promise<'on' | 'off' | 'blocked'> {
  const permission = await Notification.requestPermission()
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'off'
  const token = await fetchToken()
  await saveToken(uid, token, true)
  storeToken(uid, token)
  return 'on'
}

/** On app load: tokens rotate, so re-save the current one (and drop a stale one). */
export async function refreshPushToken(uid: string): Promise<void> {
  const stored = getStoredToken(uid)
  if (!stored || Notification.permission !== 'granted') return
  const token = await fetchToken()
  if (token !== stored) {
    await deleteDoc(tokenRef(uid, stored)).catch(() => {})
    storeToken(uid, token)
  }
  await saveToken(uid, token, token !== stored)
}

/** Stop pushes to this device for this user (Settings toggle-off and sign-out). */
export async function disablePush(uid: string): Promise<void> {
  const stored = getStoredToken(uid)
  storeToken(uid, null)
  if (!stored) return
  // Bounded: offline, a Firestore delete never settles (persistentLocalCache waits
  // for server ack) and sign-out must not hang on it.
  await withTimeout(deleteDoc(tokenRef(uid, stored)), CLEANUP_TIMEOUT_MS)
  const m = await messaging()
  if (m) await withTimeout(deleteToken(m), CLEANUP_TIMEOUT_MS)
}
