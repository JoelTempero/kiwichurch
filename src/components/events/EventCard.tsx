import { cn } from '@/utils/cn'
import type { Event } from '@/types'
import { Badge } from '@/components/common'
import { Repeat } from 'lucide-react'

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
        'flex items-center gap-3 cursor-pointer hover:bg-cream/50 transition-colors',
        compact ? 'py-2 px-1' : 'py-3 px-2'
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-forest rounded-lg flex flex-col items-center justify-center">
        <span className="text-[9px] uppercase text-cream leading-none">{month}</span>
        <span className="text-base font-semibold text-cream leading-tight">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-text-primary text-[15px] truncate">{event.title}</span>
          {event.seriesId && (
            <Repeat size={12} className="text-text-light shrink-0" aria-label="Recurring event" />
          )}
        </div>
        <div className="text-sm text-text-light">
          {weekday} {formatTime(event.time)}
          {event.location && ` · ${event.location}`}
        </div>
        {event.gatheringName && (
          <div className="text-xs text-terracotta mt-0.5">{event.gatheringName}</div>
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
