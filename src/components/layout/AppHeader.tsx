import { useLocation, useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  onSearchClick?: () => void
  onNotificationsClick?: () => void
  notificationCount?: number
}

const pageTitles: Record<string, string> = {
  '/home': 'Home',
  '/events': 'Events',
  '/groups': 'Groups',
  '/kete': 'Kete',
  '/profile': 'Profile',
  '/giving': 'Giving',
  '/hosting': 'Hosting',
  '/settings': 'Settings',
  '/users': 'Users',
  '/directory': 'Directory'
}

export function AppHeader({
  onSearchClick,
  onNotificationsClick,
  notificationCount = 0
}: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Get page title from route
  const getTitle = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname]
    }

    // Check for group detail page
    if (location.pathname.startsWith('/groups/')) {
      return 'Group'
    }

    // Check for kete post page
    if (location.pathname.startsWith('/kete/')) {
      return 'Post'
    }

    return 'Home'
  }

  return (
    <header className="app-header" id="app-header">
      <h1 className="app-header-title">{getTitle()}</h1>

      <div className="app-header-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onSearchClick}
          title="Search"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={onNotificationsClick}
          title="Notifications"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notificationCount > 0 && (
            <span
              className="notification-badge"
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                background: '#dc2626',
                borderRadius: '50%'
              }}
            />
          )}
        </button>

        <button
          className="btn btn-ghost btn-sm desktop-hide"
          onClick={() => navigate('/profile')}
          title="Profile"
          aria-label="Profile"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  )
}
