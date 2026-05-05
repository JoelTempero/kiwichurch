import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Users, Calendar, BookOpen } from 'lucide-react'
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/utils/webNotifications'

export function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  )

  useEffect(() => {
    setNotifPermission(getNotificationPermission())
  }, [])

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto p-4">
        <EmptyState
          icon="settings"
          title="Not signed in"
          message="Please sign in to access settings"
        />
      </div>
    )
  }

  const notifEnabled = notifPermission === 'granted'
  const notifBlocked = notifPermission === 'denied'
  const notifUnsupported = notifPermission === 'unsupported'

  return (
    <div className="max-w-[600px] mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Settings</h1>
      </div>

      {/* Notifications */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Notifications</p>

        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Browser Notifications</h3>
            <p className="text-xs text-text-light mt-0.5">
              {notifUnsupported
                ? 'Not supported in this browser'
                : notifEnabled
                  ? 'You\'ll get notified of new messages and mentions'
                  : notifBlocked
                    ? 'Blocked by browser — update in your browser\'s site settings'
                    : 'Get notified when you receive messages'}
            </p>
          </div>
          <label className={`relative inline-flex items-center ${notifBlocked || notifUnsupported ? 'opacity-50' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notifEnabled}
              disabled={notifBlocked || notifUnsupported}
              onChange={async () => {
                if (!notifEnabled && !notifBlocked) {
                  const result = await requestNotificationPermission()
                  setNotifPermission(result)
                  if (result === 'granted') {
                    showToast('Notifications enabled', 'success')
                  }
                }
              }}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>
      </section>

      {/* Admin Section */}
      {isAdmin && (
        <section className="mb-6">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Admin</p>

          <div className="space-y-1">
            <a href="/users" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <Users size={20} />
              Manage Users
            </a>
            <a href="/hosting" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <Calendar size={20} />
              Content Hosting
            </a>
            <a href="/directory" className="flex items-center gap-3 py-3 border-b border-[#e0dbd2] hover:bg-cream/50 transition-colors text-text-primary no-underline">
              <BookOpen size={20} />
              Member Directory
            </a>
          </div>
        </section>
      )}

      {/* About */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">About</p>
        <div className="py-2">
          <p className="font-semibold text-text-primary">Kiwi Church Portal</p>
          <p className="text-sm text-text-lighter">Version 2.0.0</p>
        </div>
      </section>
    </div>
  )
}
