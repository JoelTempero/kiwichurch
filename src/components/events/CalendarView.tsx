import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store'
import type { Event } from '@/types'

interface CalendarViewProps {
  events: Event[]
  onDateClick: (date: string) => void
  onEventClick: (event: Event) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const { calendarYear, calendarMonth, selectedDate, changeMonth, setSelectedDate } = useUIStore()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1)
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0)
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: Array<{ date: string | null; day: number | null; isToday: boolean; hasEvents: boolean }> = []

    // Add padding for days before the month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, day: null, isToday: false, hasEvents: false })
    }

    const today = new Date().toISOString().split('T')[0]

    // Add actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const hasEvents = events.some(e => e.date === date)
      days.push({
        date,
        day,
        isToday: date === today,
        hasEvents
      })
    }

    return days
  }, [calendarYear, calendarMonth, events])

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return events.filter(e => e.date === selectedDate)
  }, [events, selectedDate])

  const handleDayClick = (date: string | null) => {
    if (!date) return
    setSelectedDate(date === selectedDate ? null : date)
    onDateClick(date)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-full hover:bg-cream transition-colors"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-display text-forest">
          {MONTHS[calendarMonth]} {calendarYear}
        </h3>
        <button
          className="p-2 rounded-full hover:bg-cream transition-colors"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-text-light py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            className={cn(
              'aspect-square flex flex-col items-center justify-center rounded-full text-sm relative transition-colors',
              !day.date && 'invisible',
              day.date && 'hover:bg-cream cursor-pointer',
              day.isToday && 'font-bold text-terracotta',
              day.date === selectedDate && 'bg-forest text-white hover:bg-forest'
            )}
            onClick={() => handleDayClick(day.date)}
            disabled={!day.date}
          >
            {day.day && (
              <>
                <span>{day.day}</span>
                {day.hasEvents && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-terracotta" />}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Selected Date Events */}
      {selectedDate && eventsForSelectedDate.length > 0 && (
        <div className="mt-4 border-t border-cream-dark pt-4">
          <h4 className="text-sm font-semibold text-text-light mb-2">
            Events on {new Date(selectedDate).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
          </h4>
          {eventsForSelectedDate.map(event => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-2 rounded-sm hover:bg-cream cursor-pointer transition-colors"
              onClick={() => onEventClick(event)}
              role="button"
              tabIndex={0}
            >
              <span className="text-sm text-text-light font-mono w-12 flex-shrink-0">
                {event.time.split(':').slice(0, 2).join(':')}
              </span>
              <span className="text-sm text-text-primary">{event.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
