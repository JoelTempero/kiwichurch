import { Download, Share, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function InstallPrompt() {
  const { canInstall, isIos, hasNativePrompt, prompt, dismiss } = usePwaInstall()

  if (!canInstall) return null

  return (
    <div
      role="region"
      aria-label="Install app"
      className="fixed left-1/2 -translate-x-1/2 bottom-20 sm:bottom-4 z-40 w-[calc(100vw-2rem)] max-w-md"
    >
      <div className="bg-forest text-cream rounded-lg shadow-lg flex items-start gap-3 p-3 pr-2">
        <div className="flex-shrink-0 w-9 h-9 rounded-md bg-cream/15 flex items-center justify-center mt-0.5">
          <Download size={18} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold m-0">Install Kiwi Church</p>
          {hasNativePrompt ? (
            <p className="text-xs text-cream/80 m-0 mt-0.5">
              Get the app on your home screen for faster access.
            </p>
          ) : isIos ? (
            <p className="text-xs text-cream/80 m-0 mt-0.5 inline-flex items-center gap-1 flex-wrap">
              Tap <Share size={12} aria-hidden="true" /> then "Add to Home Screen".
            </p>
          ) : null}
          {hasNativePrompt && (
            <button
              type="button"
              onClick={prompt}
              className="mt-2 px-3 py-1 rounded-md bg-cream text-forest text-xs font-semibold hover:bg-white transition-colors"
            >
              Install
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="flex-shrink-0 p-1.5 rounded hover:bg-cream/10 transition-colors text-cream/70 hover:text-cream"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
