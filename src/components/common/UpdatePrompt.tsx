import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { registerSW } from 'virtual:pwa-register'

export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
    })
    setUpdateFn(() => () => update(true))
  }, [])

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 top-3 z-50 w-[calc(100vw-1.5rem)] max-w-md"
    >
      <div className="bg-terracotta text-cream rounded-lg shadow-lg flex items-center gap-3 p-3">
        <RefreshCw size={18} aria-hidden="true" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold m-0">New version available</p>
        </div>
        <button
          type="button"
          onClick={() => updateFn?.()}
          className="px-3 py-1 rounded-md bg-cream text-terracotta-dark text-xs font-semibold hover:bg-white transition-colors flex-shrink-0"
        >
          Update
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss update prompt"
          className="flex-shrink-0 p-1 rounded hover:bg-cream/10 transition-colors text-cream/80 hover:text-cream"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
