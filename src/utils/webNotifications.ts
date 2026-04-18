const PERMISSION_KEY = 'kiwichurch-notif-permission-asked'

export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  localStorage.setItem(PERMISSION_KEY, 'true')
  return result
}

export function hasAskedPermission(): boolean {
  return localStorage.getItem(PERMISSION_KEY) === 'true'
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return

  const notification = new Notification(title, {
    icon: '/Images/KiwiChurch_Old_White.png',
    badge: '/Images/KiwiChurch_Old_White.png',
    ...options,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
    if (options?.data?.link) {
      window.location.href = options.data.link
    }
  }
}
