import { cn } from '@/utils/cn'
import type { Event } from '@/types'
import { Badge } from '@/components/common'

interface EventCardProps {
  event: Event
  onClick?: () => void
  rsvpStatus?: 'yes' | 'no' | 'maybe' | null
  compact?: boolean
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
}

function formatDate(dateStr: string): { day: number; month: string; weekday: string } {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-NZ', { month: 'short' }),
    weekday: date.toLocaleDateString('en-NZ', { weekday: 'short' })
  }
}

export function EventCard({ event, onClick, rsvpStatus, compact = false }: EventCardProps) {
  const { day, month, weekday } = formatDate(event.date)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow',
        compact ? 'p-2' : 'p-3'
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex-shrink-0 w-14 text-center">
        <span className="block text-2xl font-bold text-forest leading-none">{day}</span>
        <span className="block text-xs text-text-light uppercase tracking-wide">{month}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary truncate">{event.title}</div>
        <div className="text-sm text-text-light mt-0.5">
          {weekday} {formatTime(event.time)}
          {event.location && ` · ${event.location}`}
        </div>
        {event.gatheringName && (
          <div className="text-xs text-terracotta mt-1">{event.gatheringName}</div>
        )}
      </div>
      {rsvpStatus && (
        <div className="flex-shrink-0">
          <Badge variant={rsvpStatus === 'yes' ? 'success' : rsvpStatus === 'maybe' ? 'warning' : 'default'}>
            {rsvpStatus === 'yes' ? 'Going' : rsvpStatus === 'maybe' ? 'Maybe' : 'Not going'}
          </Badge>
        </div>
      )}
    </div>
  )
}
