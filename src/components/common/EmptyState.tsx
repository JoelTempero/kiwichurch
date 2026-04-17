import type { ReactNode } from 'react'
import { Calendar, Users, BookOpen, MessageSquare, Search, Bell, Heart, Lock, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type IconType = 'calendar' | 'users' | 'book' | 'message' | 'search' | 'bell' | 'heart' | 'lock' | 'settings'

interface EmptyStateProps {
  icon?: IconType
  title: string
  message?: string
  action?: ReactNode
}

const iconMap: Record<IconType, LucideIcon> = {
  calendar: Calendar,
  users: Users,
  book: BookOpen,
  message: MessageSquare,
  search: Search,
  bell: Bell,
  heart: Heart,
  lock: Lock,
  settings: Settings
}

export function EmptyState({ icon = 'search', title, message, action }: EmptyStateProps) {
  const Icon = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-light">
      <Icon size={64} strokeWidth={1.5} className="text-sage-light mb-4" />
      <h4 className="text-lg font-medium text-text-primary mb-1">{title}</h4>
      {message && <p className="text-text-light m-0">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
