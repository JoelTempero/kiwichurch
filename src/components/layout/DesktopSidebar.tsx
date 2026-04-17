import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, Users, BookOpen, Heart, Settings, UserPlus, BookMarked, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
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
  { to: '/kete', label: 'Kete', icon: BookOpen },
  { to: '/giving', label: 'Giving', icon: Heart }
]

const adminNavItems: NavItem[] = [
  { to: '/hosting', label: 'Hosting', icon: Settings },
  { to: '/users', label: 'Users', icon: UserPlus },
  { to: '/directory', label: 'Directory', icon: BookMarked },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal }
]

export function DesktopSidebar() {
  const { user, isAdminOrHost, isAdmin } = useAuth()
  const navigate = useNavigate()

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
            </NavLink>
          )
        })}

        {isAdminOrHost && (
          <>
            <div className="desktop-nav-divider" />
            {adminNavItems
              .filter(item => {
                if (item.to === '/users' || item.to === '/settings') {
                  return isAdmin
                }
                return true
              })
              .map((item) => {
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
      </nav>

      <div className="desktop-sidebar-footer">
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
