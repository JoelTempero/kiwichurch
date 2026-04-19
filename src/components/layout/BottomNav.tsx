import { NavLink } from 'react-router-dom'
import { Home, Calendar, Users, MessageCircle, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages'

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/kete', label: 'Kete', icon: BookOpen }
]

export function BottomNav() {
  const { user } = useAuth()
  const unreadCount = useUnreadMessageCount(user?.id ?? null)

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
              <div className="relative">
                <Icon size={24} strokeWidth={1.75} />
                {item.label === 'Messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
