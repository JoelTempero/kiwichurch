import { useState } from 'react'
import { Bell, Share, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

const DISMISS_KEY = 'kc-push-banner-dismissed-at'
const DISMISS_DAYS = 30

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

/** Home-page nudge to switch on push for this device (or install first on iPhone). */
export function EnablePushBanner({ userId }: { userId: string }) {
  const { status, enable, busy } = usePushNotifications(userId)
  const [dismissed, setDismissed] = useState(recentlyDismissed)

  if (dismissed || (status !== 'off' && status !== 'needs-install')) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // storage blocked — just hide for this session
    }
    setDismissed(true)
  }

  return (
    <div className="mt-3 flex items-center gap-3 bg-forest/5 border border-forest/20 rounded-md px-4 py-3 text-sm text-forest">
      <Bell size={18} className="shrink-0" />
      {status === 'needs-install' ? (
        <span className="flex-1">
          To get notifications on your iPhone, tap <Share size={14} className="inline -mt-0.5" aria-label="Share" /> then{' '}
          <strong>Add to Home Screen</strong>, and open Kiwi Church from there.
        </span>
      ) : (
        <>
          <span className="flex-1">Get notified about comments, messages and announcements.</span>
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="shrink-0 bg-forest text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-forest/90 disabled:opacity-60"
          >
            {busy ? 'Turning on…' : 'Turn on'}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 p-1 -mr-1 rounded hover:bg-forest/10"
      >
        <X size={16} />
      </button>
    </div>
  )
}
