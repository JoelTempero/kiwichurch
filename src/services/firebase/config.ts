import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDbGRbr1D2difpQWfxoZqPy58FmNrQ2HbA",
  authDomain: "kiwichurch-1ef0f.firebaseapp.com",
  projectId: "kiwichurch-1ef0f",
  storageBucket: "kiwichurch-1ef0f.firebasestorage.app",
  messagingSenderId: "295588695621",
  appId: "1:295588695621:web:7320e07a05229564a45d2c"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Secondary app for admin user creation (avoids signing out the current user)
export const secondaryApp = initializeApp(firebaseConfig, 'secondary')

// Initialize services
export const auth = getAuth(app)
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
export const storage = getStorage(app)
// Fail fast on flaky mobile connections instead of silently retrying for the
// 10-minute default — a stalled upload otherwise looks like a frozen "posting…"
// spinner with no error. 45s is plenty for a 25MB cap on a usable connection.
storage.maxUploadRetryTime = 45_000
storage.maxOperationRetryTime = 30_000

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
  console.log('[Firebase] Connected to emulators')
}

console.log('[Firebase] Initialized successfully')

export default app
