import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, Users, MessageCircle, BookOpen, Settings, BookMarked, SlidersHorizontal, Shield, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const mainNavItems: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/kete', label: 'Kete', icon: BookOpen },
  { to: '/directory', label: 'Directory', icon: BookMarked }
]

const adminNavItems: NavItem[] = [
  { to: '/hosting', label: 'Hosting', icon: Settings },
  { to: '/moderation', label: 'Moderation', icon: Shield }
]

export function DesktopSidebar() {
  const { user, isAdminOrHost } = useAuth()
  const navigate = useNavigate()
  const unreadCount = useUnreadMessageCount(user?.id ?? null)

  return (
    <aside className="desktop-sidebar" id="desktop-sidebar">
      <div className="desktop-sidebar-logo">
        <a href="/">
          <img src="/Images/KiwiChurch_Old_White.png" alt="Kiwi Church" />
        </a>
      </div>

      <nav className="desktop-sidebar-nav">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `desktop-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.label === 'Messages' && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-[20px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}

        {isAdminOrHost && (
          <>
            <div className="desktop-nav-divider" />
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `desktop-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </>
        )}

        <div className="desktop-nav-divider" />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `desktop-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <SlidersHorizontal size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="desktop-sidebar-footer">
        <a href="/" className="desktop-nav-item" aria-label="Visit Kiwi Church website">
          <ExternalLink size={20} />
          <span>Visit website</span>
        </a>
        <div
          className="desktop-user-info"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >
          <div className="desktop-user-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user?.displayName || ''} className="size-full rounded-full object-cover" />
            ) : (
              <span>{user?.displayName?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="desktop-user-name">{user?.displayName}</div>
        </div>
      </div>
    </aside>
  )
}
