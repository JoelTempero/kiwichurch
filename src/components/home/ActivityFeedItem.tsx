import { Link } from 'react-router-dom'
import { MessageSquare, BookOpen } from 'lucide-react'
import type { ActivityItem } from '@/hooks/useActivityFeed'

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

const typeIcons = {
  post: MessageSquare,
  kete: BookOpen
} as const

interface ActivityFeedItemProps {
  item: ActivityItem
}

export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const Icon = typeIcons[item.type]

  return (
    <Link
      to={item.link}
      className="flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors no-underline text-inherit"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
        <Icon size={16} className="text-text-light" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm">
          <span className="font-semibold text-text-primary">{item.title}</span>
          {' '}
          <span className="text-text-light">{item.description}</span>
        </span>
      </div>
      <span className="text-xs text-text-lighter flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
    </Link>
  )
}
