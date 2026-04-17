import { NavLink } from 'react-router-dom'
import { Home, Calendar, Users, BookOpen, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/kete', label: 'Kete', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User }
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav-inner" role="menubar">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'active' : ''}`
              }
              role="menuitem"
              aria-label={item.label}
            >
              <Icon size={24} strokeWidth={1.75} />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
