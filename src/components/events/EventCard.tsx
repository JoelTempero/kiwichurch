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
      className={`app-event-card ${compact ? 'app-event-card-compact' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="app-event-date">
        <span className="app-event-date-day">{day}</span>
        <span className="app-event-date-month">{month}</span>
      </div>
      <div className="app-event-info">
        <div className="app-event-title">{event.title}</div>
        <div className="app-event-meta">
          {weekday} {formatTime(event.time)}
          {event.location && ` · ${event.location}`}
        </div>
        {event.gatheringName && (
          <div className="app-event-gathering">{event.gatheringName}</div>
        )}
      </div>
      {rsvpStatus && (
        <div className="app-event-status">
          <Badge variant={rsvpStatus === 'yes' ? 'success' : rsvpStatus === 'maybe' ? 'warning' : 'default'}>
            {rsvpStatus === 'yes' ? 'Going' : rsvpStatus === 'maybe' ? 'Maybe' : 'Not going'}
          </Badge>
        </div>
      )}
    </div>
  )
}
