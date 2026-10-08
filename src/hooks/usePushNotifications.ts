import { useCallback, useEffect, useRef, useState } from 'react'
import { isPushSupported, enablePush, disablePush, refreshPushToken, getStoredToken } from '@/services/firebase/push'
import { resolvePushStatus, type PushStatus } from '@/utils/pushStatus'
import { isIos, isStandalone } from './usePwaInstall'
import { useToast } from '@/components/common/Toast'

let refreshedThisSession = false

/** Push-notification state for THIS device + the signed-in user. */
export function usePushNotifications(uid: string | null) {
  const { showToast } = useToast()
  const [status, setStatus] = useState<PushStatus>('unsupported')
  const [busy, setBusy] = useState(false)
  const supportedRef = useRef(false)

  const recompute = useCallback(() => {
    setStatus(
      resolvePushStatus({
        supported: supportedRef.current,
        ios: isIos(),
        standalone: isStandalone(),
        permission: 'Notification' in window ? Notification.permission : 'denied',
        hasToken: !!uid && !!getStoredToken(uid),
      })
    )
  }, [uid])

  useEffect(() => {
    let cancelled = false
    isPushSupported().then((ok) => {
      if (cancelled) return
      supportedRef.current = ok
      recompute()
      if (ok && uid && !refreshedThisSession && getStoredToken(uid)) {
        refreshedThisSession = true
        refreshPushToken(uid).catch((err) => console.warn('[push] token refresh failed', err))
      }
    })
    return () => {
      cancelled = true
    }
  }, [uid, recompute])

  const enable = useCallback(async () => {
    if (!uid) return
    setBusy(true)
    try {
      const result = await enablePush(uid)
      if (result === 'on') showToast('Notifications are on for this device', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't turn on notifications", 'error')
    } finally {
      setBusy(false)
      recompute()
    }
  }, [uid, showToast, recompute])

  const disable = useCallback(async () => {
    if (!uid) return
    setBusy(true)
    try {
      await disablePush(uid)
    } finally {
      setBusy(false)
      recompute()
    }
  }, [uid, recompute])

  return { status, enable, disable, busy }
}
