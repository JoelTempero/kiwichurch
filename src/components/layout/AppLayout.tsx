import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { DesktopSidebar } from './DesktopSidebar'
import { AppHeader } from './AppHeader'
import { NotificationPanel } from './NotificationPanel'
import { SearchPanel } from './SearchPanel'
import { PendingApprovalGate } from './PendingApprovalGate'
import { InstallPrompt } from '@/components/common/InstallPrompt'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadNotificationCount, useNotificationsSubscription } from '@/hooks/useNotifications'
import { useConversationsSubscription } from '@/hooks/useDirectMessages'
import { useKeyboardShortcuts, useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const unreadCount = useUnreadNotificationCount(user?.id || null, user?.mutedNotificationCategories || [])
  useNotificationsSubscription(user?.id || null, user?.mutedNotificationCategories || [])
  useConversationsSubscription(user?.id ?? null)

  // Pending self-signups see only the approval gate.
  if (user?.status === 'pending') {
    return <PendingApprovalGate />
  }

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
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

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

      <InstallPrompt />
      <UpdatePrompt />
    </div>
  )
}
