import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, EmptyState } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Users, Calendar, BookOpen } from 'lucide-react'

export function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)

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
      notifications,
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
      <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-display text-forest mb-3">Preferences</h2>

        <div className="flex items-center justify-between py-3 border-b border-cream last:border-none">
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

        <div className="flex items-center justify-between py-3 border-b border-cream last:border-none">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary">Push Notifications</h3>
            <p className="text-xs text-text-light mt-0.5">Receive push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-cream last:border-none">
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

        <Button variant="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </section>

      {/* Account */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-display text-forest mb-3">Account</h2>

        <div className="flex justify-between py-2 border-b border-cream last:border-none">
          <span className="text-text-light text-sm">Email</span>
          <span className="text-text-primary text-sm font-medium">{user.email}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-cream last:border-none">
          <span className="text-text-light text-sm">Role</span>
          <span className="text-text-primary text-sm font-medium capitalize">{user.role}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-cream last:border-none">
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
        <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-display text-forest mb-3">Admin</h2>
          <p className="text-text-light text-sm mb-4">
            Admin-only settings and tools
          </p>

          <div className="space-y-2">
            <a href="/users" className="flex items-center gap-3 p-3 rounded-md hover:bg-cream transition-colors text-text-primary no-underline">
              <Users size={20} />
              Manage Users
            </a>
            <a href="/hosting" className="flex items-center gap-3 p-3 rounded-md hover:bg-cream transition-colors text-text-primary no-underline">
              <Calendar size={20} />
              Content Hosting
            </a>
            <a href="/directory" className="flex items-center gap-3 p-3 rounded-md hover:bg-cream transition-colors text-text-primary no-underline">
              <BookOpen size={20} />
              Member Directory
            </a>
          </div>
        </section>
      )}

      {/* About */}
      <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h2 className="text-lg font-display text-forest mb-3">About</h2>
        <div className="text-center py-2">
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
