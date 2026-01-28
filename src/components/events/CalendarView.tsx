import { useMemo } from 'react'
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
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className="calendar-title">
          {MONTHS[calendarMonth]} {calendarYear}
        </h3>
        <button
          className="calendar-nav-btn"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            className={`calendar-day ${day.date ? '' : 'calendar-day-empty'} ${day.isToday ? 'calendar-day-today' : ''} ${day.date === selectedDate ? 'calendar-day-selected' : ''} ${day.hasEvents ? 'calendar-day-has-events' : ''}`}
            onClick={() => handleDayClick(day.date)}
            disabled={!day.date}
          >
            {day.day && (
              <>
                <span className="calendar-day-number">{day.day}</span>
                {day.hasEvents && <span className="calendar-day-dot" />}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Selected Date Events */}
      {selectedDate && eventsForSelectedDate.length > 0 && (
        <div className="calendar-events-preview">
          <h4 className="calendar-events-title">
            Events on {new Date(selectedDate).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
          </h4>
          {eventsForSelectedDate.map(event => (
            <div
              key={event.id}
              className="calendar-event-item"
              onClick={() => onEventClick(event)}
              role="button"
              tabIndex={0}
            >
              <span className="calendar-event-time">
                {event.time.split(':').slice(0, 2).join(':')}
              </span>
              <span className="calendar-event-title">{event.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
