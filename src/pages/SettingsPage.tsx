import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, EmptyState } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Users, Calendar, BookOpen } from 'lucide-react'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/utils/webNotifications'

export function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [darkMode, setDarkMode] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  )
  const [emailUpdates, setEmailUpdates] = useState(true)

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

  const handleSavePreferences = () => {
    // Save to localStorage for now
    localStorage.setItem('preferences', JSON.stringify({
      darkMode,
      emailUpdates
    }))
    showToast('Preferences saved', 'success')
  }

  return (
    <div className="max-w-[600px] mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Settings</h1>
      </div>

      {/* Preferences */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Preferences</p>

        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Dark Mode</h3>
            <p className="text-xs text-text-light mt-0.5">Use dark theme</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Browser Notifications</h3>
            <p className="text-xs text-text-light mt-0.5">
              {notifPermission === 'unsupported'
                ? 'Not supported in this browser'
                : notifPermission === 'granted'
                  ? 'Enabled — you\'ll get notified of new messages and mentions'
                  : notifPermission === 'denied'
                    ? 'Blocked — enable in browser settings'
                    : 'Get notified when you receive messages'}
            </p>
          </div>
          {notifPermission === 'default' && isNotificationSupported() && (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={false}
                onChange={async () => {
                  const result = await requestNotificationPermission()
                  setNotifPermission(result)
                  if (result === 'granted') {
                    showToast('Notifications enabled', 'success')
                  }
                }}
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
            </label>
          )}
          {notifPermission === 'granted' && (
            <label className="relative inline-flex items-center">
              <input type="checkbox" className="sr-only peer" checked disabled />
              <div className="w-10 h-5 bg-forest rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:translate-x-5" />
            </label>
          )}
          {notifPermission === 'denied' && (
            <span className="text-xs text-red-600 font-medium px-2 py-1 bg-red-50 rounded-full">Blocked</span>
          )}
        </div>

        <div className="flex items-center justify-between py-3 border-b border-[#e0dbd2]">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Email Updates</h3>
            <p className="text-xs text-text-light mt-0.5">Receive email notifications about events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="pt-4">
          <Button variant="primary" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </section>

      {/* Account */}
      <section className="mb-6">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Account</p>

        <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
          <span className="text-text-light text-sm">Email</span>
          <span className="text-text-primary text-sm font-medium">{user.email}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
          <span className="text-text-light text-sm">Role</span>
          <span className="text-text-primary text-sm font-medium capitalize">{user.role}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-[#e0dbd2]">
          <span className="text-text-light text-sm">Member since</span>
          <span className="text-text-primary text-sm font-medium">
            {user.createdAt instanceof Date
              ? user.createdAt.toLocaleDateString('en-NZ')
              : 'Unknown'}
          </span>
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
          <p className="text-xs text-text-lighter mt-1">
            Built with React, TypeScript, and Firebase
          </p>
        </div>
      </section>
    </div>
  )
}
