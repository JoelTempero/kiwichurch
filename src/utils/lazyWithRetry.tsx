import { lazy, type ComponentType } from 'react'

const RELOAD_FLAG = 'kc-lazy-reloaded'

type LazyModule = { default: ComponentType<unknown> }

// Wraps React.lazy so a failed dynamic import — which happens when an
// older cached app.html references chunk filenames that the new deploy
// no longer has — triggers a one-shot full page reload. The flag in
// sessionStorage prevents reload loops if the chunk genuinely doesn't
// exist anymore.
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
        window.location.reload()
        // Stall the original import so React doesn't render an error frame
        // before the reload kicks in.
        return new Promise<LazyModule>(() => {})
      }
      throw err
    }
  })
}
