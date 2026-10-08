export type PushStatus = 'unsupported' | 'needs-install' | 'off' | 'on' | 'blocked'

export interface PushStatusInput {
  supported: boolean
  ios: boolean
  standalone: boolean
  permission: NotificationPermission
  hasToken: boolean
}

/** Pure status resolution for usePushNotifications (kept separate so it tests without Firebase). */
export function resolvePushStatus({ supported, ios, standalone, permission, hasToken }: PushStatusInput): PushStatus {
  // iOS only exposes web push to the installed home-screen app.
  if (ios && !standalone) return 'needs-install'
  if (!supported) return 'unsupported'
  if (permission === 'denied') return 'blocked'
  if (permission === 'granted' && hasToken) return 'on'
  return 'off'
}
