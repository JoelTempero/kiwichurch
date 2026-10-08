import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
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
import { useAppBadge } from '@/hooks/useAppBadge'
import { dbService } from '@/services/firebase'
import { useKeyboardShortcuts, useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Dismiss the overlay panels whenever the route changes, so navigating
  // (bottom nav, sidebar, a notification's link, keyboard shortcuts) always
  // clears them instead of leaving a panel stuck in front of the new page.
  useEffect(() => {
    setShowNotifications(false)
    setShowSearch(false)
  }, [location.pathname])
  // Tapping a push lands on `<link>?n=<notificationId>` (see src/sw.ts):
  // mark that notification read, then drop the param from the URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const notificationId = params.get('n')
    if (!notificationId) return
    dbService.markNotificationRead(notificationId).catch(() => {})
    params.delete('n')
    const search = params.toString()
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '', hash: location.hash }, { replace: true })
  }, [location.search, location.pathname, location.hash, navigate])

  const unreadCount = useUnreadNotificationCount(user?.id || null, user?.mutedNotificationCategories || [])
  useNotificationsSubscription(user?.id || null)
  useConversationsSubscription(user?.id ?? null)
  useAppBadge(user?.id ?? null, user?.mutedNotificationCategories || [])

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
