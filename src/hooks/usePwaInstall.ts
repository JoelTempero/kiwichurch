import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_DAYS = 14

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
  return navStandalone === true
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function isRecentlyDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const at = parseInt(raw, 10)
  if (Number.isNaN(at)) return false
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export function usePwaInstall() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())
  const [dismissed, setDismissed] = useState(isRecentlyDismissed())

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setEvent(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const prompt = useCallback(async () => {
    if (!event) return
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setEvent(null)
  }, [event])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }, [])

  const ios = isIos()
  const canInstall = !installed && !dismissed && (!!event || (ios && !isStandalone()))

  return {
    canInstall,
    isIos: ios,
    isStandalone: installed,
    hasNativePrompt: !!event,
    prompt,
    dismiss,
  }
}
