import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { DesktopSidebar } from './DesktopSidebar'
import { AppHeader } from './AppHeader'
import { NotificationPanel } from './NotificationPanel'
import { SearchPanel } from './SearchPanel'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useKeyboardShortcuts, useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const unreadCount = useUnreadNotificationCount(user?.id || null)

  const handleSearchClick = () => {
    setShowSearch(true)
  }

  const handleNotificationsClick = () => {
    setShowNotifications(true)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: handleSearchClick,
    onNotifications: handleNotificationsClick
  })

  // Navigation shortcuts (g + h/e/g/k/p/s)
  useNavigationShortcuts(navigate)

  return (
    <div id="app-view">
      <DesktopSidebar />

      <AppHeader
        onSearchClick={handleSearchClick}
        onNotificationsClick={handleNotificationsClick}
        notificationCount={unreadCount}
      />

      <main id="app-main">
        <Outlet />
      </main>

      <BottomNav />

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <SearchPanel
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
  )
}
