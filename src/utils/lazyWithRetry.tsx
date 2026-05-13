import { lazy, type ComponentType } from 'react'

const RELOAD_FLAG = 'kc-lazy-reloaded'

type LazyModule = { default: ComponentType<unknown> }

// Nuke service workers and Cache Storage, then hard-reload. The plain
// `window.location.reload()` is not enough when the SW itself is the source
// of staleness — it intercepts the reload and serves the same old shell.
async function nukeAndReload(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch { /* ignore */ }
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch { /* ignore */ }
  window.location.reload()
}

// Wraps React.lazy so a failed dynamic import — which happens when an
// older cached app.html references chunk filenames that the new deploy
// no longer has — unregisters the SW, clears caches, then full-page-reloads.
// The flag in sessionStorage prevents reload loops if the chunk genuinely
// doesn't exist anymore.
//
// Use this for every page-level lazy import in App.tsx.
export function lazyWithRetry(factory: () => Promise<LazyModule>) {
  return lazy(async () => {
    try {
      const mod = await factory()
      try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ }
      return mod
    } catch (err) {
      const alreadyReloaded = (() => {
        try { return sessionStorage.getItem(RELOAD_FLAG) === '1' } catch { return false }
      })()
      if (!alreadyReloaded && typeof window !== 'undefined') {
        try { sessionStorage.setItem(RELOAD_FLAG, '1') } catch { /* ignore */ }
        await nukeAndReload()
        // Stall the original import so React doesn't render an error frame
        // before the reload kicks in.
        return new Promise<LazyModule>(() => {})
      }
      throw err
    }
  })
}
