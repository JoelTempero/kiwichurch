import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, EmptyState } from '@/components/common'
import { useToast } from '@/components/common/Toast'

export function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)

  if (!user) {
    return (
      <div className="settings-page">
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
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </div>

      {/* Preferences */}
      <section className="settings-section">
        <h2 className="settings-section-title">Preferences</h2>

        <div className="settings-option">
          <div className="settings-option-info">
            <h3 className="settings-option-title">Dark Mode</h3>
            <p className="settings-option-description">Use dark theme</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <h3 className="settings-option-title">Push Notifications</h3>
            <p className="settings-option-description">Receive push notifications</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <h3 className="settings-option-title">Email Updates</h3>
            <p className="settings-option-description">Receive email notifications about events</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
            />
            <span className="settings-toggle-slider" />
          </label>
        </div>

        <Button variant="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </section>

      {/* Account */}
      <section className="settings-section">
        <h2 className="settings-section-title">Account</h2>

        <div className="settings-info-row">
          <span className="settings-info-label">Email</span>
          <span className="settings-info-value">{user.email}</span>
        </div>

        <div className="settings-info-row">
          <span className="settings-info-label">Role</span>
          <span className="settings-info-value settings-role">{user.role}</span>
        </div>

        <div className="settings-info-row">
          <span className="settings-info-label">Member since</span>
          <span className="settings-info-value">
            {user.createdAt instanceof Date
              ? user.createdAt.toLocaleDateString('en-NZ')
              : 'Unknown'}
          </span>
        </div>
      </section>

      {/* Admin Section */}
      {isAdmin && (
        <section className="settings-section">
          <h2 className="settings-section-title">Admin</h2>
          <p className="settings-section-description">
            Admin-only settings and tools
          </p>

          <div className="settings-admin-links">
            <a href="/users" className="settings-admin-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Manage Users
            </a>
            <a href="/hosting" className="settings-admin-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Content Hosting
            </a>
            <a href="/directory" className="settings-admin-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Member Directory
            </a>
          </div>
        </section>
      )}

      {/* About */}
      <section className="settings-section">
        <h2 className="settings-section-title">About</h2>
        <div className="settings-about">
          <p className="settings-about-name">Kiwi Church Portal</p>
          <p className="settings-about-version">Version 2.0.0</p>
          <p className="settings-about-description">
            Built with React, TypeScript, and Firebase
          </p>
        </div>
      </section>
    </div>
  )
}
