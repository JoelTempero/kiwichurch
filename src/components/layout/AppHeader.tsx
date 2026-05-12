import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, User, BookMarked } from 'lucide-react'

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
  '/directory': 'Directory',
  '/messages': 'Messages',
  '/moderation': 'Moderation'
}

export function AppHeader({
  onSearchClick,
  onNotificationsClick,
  notificationCount = 0
}: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const getTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname]
    }
    if (location.pathname.startsWith('/groups/')) return 'Group'
    if (location.pathname.startsWith('/kete/')) return 'Post'
    if (location.pathname.startsWith('/messages/')) return 'Conversation'
    return 'Home'
  }

  return (
    <header className="app-header" id="app-header">
      <h1 className="app-header-title">{getTitle()}</h1>

      <div className="flex items-center gap-1">
        <button
          className="inline-flex items-center justify-center p-2 rounded-lg text-text-light hover:bg-cream hover:text-forest transition-colors"
          onClick={onSearchClick}
          title="Search"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          className="inline-flex items-center justify-center p-2 rounded-lg text-text-light hover:bg-cream hover:text-forest transition-colors md:hidden"
          onClick={() => navigate('/directory')}
          title="Directory"
          aria-label="Directory"
        >
          <BookMarked size={20} />
        </button>

        <button
          className="relative inline-flex items-center justify-center p-2 rounded-lg text-text-light hover:bg-cream hover:text-forest transition-colors"
          onClick={onNotificationsClick}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-red-600" />
          )}
        </button>

        <button
          className="inline-flex items-center justify-center p-2 rounded-lg text-text-light hover:bg-cream hover:text-forest transition-colors md:hidden"
          onClick={() => navigate('/profile')}
          title="Profile"
          aria-label="Profile"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  )
}
