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

interface CalendarDay {
  date: string | null
  day: number | null
  isToday: boolean
  events: Event[]
}

const WEEKDAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getEventColor(event: Event): string {
  const name = (event.gatheringName || '').toLowerCase()
  if (name.includes('gathering') || name.includes('sunday') || name.includes('worship')) return 'bg-forest'
  if (name.includes('prayer') || name.includes('study') || name.includes('small')) return 'bg-sage'
  return 'bg-terracotta'
}

function formatChipTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return minutes === '00' ? `${displayHour}${ampm}` : `${displayHour}:${minutes}${ampm}`
}

function getWeekDays(weekOffset: number): CalendarDay[] {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Monday-start: getDay() returns 0=Sun, so Mon = day - (day===0?6:day-1)
  const dayOfWeek = today.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - daysToMonday + weekOffset * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    return {
      date: dateStr,
      day: date.getDate(),
      isToday: dateStr === todayStr,
      events: [] // filled by caller
    }
  })
}

function formatWeekRange(weekDays: CalendarDay[]): string {
  if (!weekDays[0].date || !weekDays[6].date) return ''
  const start = new Date(weekDays[0].date + 'T00:00:00')
  const end = new Date(weekDays[6].date + 'T00:00:00')
  const startStr = start.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} – ${endStr}`
}

export function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const {
    calendarYear,
    calendarMonth,
    calendarViewMode,
    calendarWeekOffset,
    changeMonth,
    changeWeek,
    setCalendarViewMode,
  } = useUIStore()

  // Month grid days (Monday-start)
  const calendarDays = useMemo((): CalendarDay[] => {
    const firstDay = new Date(calendarYear, calendarMonth, 1)
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0)
    // getDay(): 0=Sun, shift so Mon=0
    const startPadding = (firstDay.getDay() + 6) % 7
    const totalDays = lastDay.getDate()
    const today = new Date().toISOString().split('T')[0]

    const days: CalendarDay[] = []

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, day: null, isToday: false, events: [] })
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        date,
        day,
        isToday: date === today,
        events: events.filter(e => e.date === date)
      })
    }

    return days
  }, [calendarYear, calendarMonth, events])

  // Week view days
  const weekDays = useMemo((): CalendarDay[] => {
    const days = getWeekDays(calendarWeekOffset)
    return days.map(d => ({
      ...d,
      events: d.date ? events.filter(e => e.date === d.date) : []
    }))
  }, [calendarWeekOffset, events])

  const handleDayClick = (date: string | null) => {
    if (!date) return
    onDateClick(date)
  }

  const goToToday = () => {
    const now = new Date()
    if (calendarViewMode === 'week') {
      useUIStore.setState({ calendarWeekOffset: 0 })
    } else {
      useUIStore.setState({ calendarYear: now.getFullYear(), calendarMonth: now.getMonth() })
    }
  }

  // Shared header controls
  const ViewToggle = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setCalendarViewMode('month')}
        className={cn(
          'px-2 py-1 text-xs rounded transition-colors',
          calendarViewMode === 'month'
            ? 'bg-forest text-cream'
            : 'text-text-light hover:text-text-primary'
        )}
      >
        Month
      </button>
      <button
        onClick={() => setCalendarViewMode('week')}
        className={cn(
          'px-2 py-1 text-xs rounded transition-colors',
          calendarViewMode === 'week'
            ? 'bg-forest text-cream'
            : 'text-text-light hover:text-text-primary'
        )}
      >
        Week
      </button>
    </div>
  )

  if (calendarViewMode === 'week') {
    return (
      <div className="border border-[#e0dbd2] rounded-lg bg-[#faf8f4] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebe6dc]">
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded hover:bg-cream transition-colors"
              onClick={() => changeWeek(-1)}
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-text-primary font-sans">
              {formatWeekRange(weekDays)}
            </span>
            <button
              className="p-1.5 rounded hover:bg-cream transition-colors"
              onClick={() => changeWeek(1)}
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="text-xs text-text-light hover:text-text-primary px-2 py-1 rounded hover:bg-cream transition-colors"
            >
              Today
            </button>
            {ViewToggle}
          </div>
        </div>

        {/* Week rows */}
        <div>
          {weekDays.map((dayData, i) => {
            const dayName = WEEKDAYS_MON[i]
            return (
              <div
                key={dayData.date ?? i}
                className={cn(
                  'grid grid-cols-[56px_1fr] gap-3 py-3 px-3 border-b border-[#ebe6dc] last:border-b-0',
                  dayData.isToday && 'bg-cream'
                )}
              >
                {/* Day label */}
                <div className="flex flex-col items-center pt-0.5">
                  <span className="text-[10px] uppercase tracking-wide text-text-light font-medium">{dayName}</span>
                  <span className={cn(
                    'text-lg font-semibold leading-tight',
                    dayData.isToday ? 'text-forest' : 'text-text-primary'
                  )}>
                    {dayData.day}
                  </span>
                </div>

                {/* Events */}
                <div className="flex flex-col gap-2">
                  {dayData.events.length === 0 ? (
                    <span className="text-xs text-text-light italic py-2">No events</span>
                  ) : (
                    dayData.events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-left text-cream w-full transition-opacity hover:opacity-90',
                          getEventColor(event)
                        )}
                      >
                        <div className="font-semibold text-sm truncate">{event.title}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {formatChipTime(event.time)}
                          {event.location && ` · ${event.location}`}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Month view
  return (
    <div className="border border-[#e0dbd2] rounded-lg bg-[#faf8f4] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebe6dc]">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-cream transition-colors"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-text-primary font-sans">
            {MONTHS[calendarMonth]} {calendarYear}
          </span>
          <button
            className="p-1.5 rounded hover:bg-cream transition-colors"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="text-xs text-text-light hover:text-text-primary px-2 py-1 rounded hover:bg-cream transition-colors"
          >
            Today
          </button>
          {ViewToggle}
        </div>
      </div>

      {/* Weekday headers (Mon–Sun) */}
      <div className="grid grid-cols-7 border-b border-[#ebe6dc]">
        {WEEKDAYS_SUN_MON_ORDER.map(day => (
          <div key={day} className="text-center text-[10px] uppercase tracking-wide text-text-light font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayData, index) => {
          const visibleEvents = dayData.events.slice(0, 2)
          const extraCount = dayData.events.length - 2

          return (
            <button
              key={index}
              className={cn(
                'min-h-[52px] sm:min-h-[72px] flex flex-col p-1 text-left border-b border-r border-[#ebe6dc]',
                'last:border-r-0 [&:nth-child(7n)]:border-r-0',
                !dayData.date && 'pointer-events-none bg-[#f5f2ee]',
                dayData.date && 'hover:bg-cream/60 cursor-pointer transition-colors',
                dayData.isToday && 'bg-cream'
              )}
              onClick={() => handleDayClick(dayData.date)}
              disabled={!dayData.date}
              aria-label={dayData.date ? `${dayData.date}, ${dayData.events.length} events` : undefined}
            >
              {dayData.day !== null && (
                <>
                  <span className={cn(
                    'text-xs font-medium mb-0.5 self-start leading-none px-0.5',
                    dayData.isToday
                      ? 'text-forest font-semibold'
                      : 'text-text-primary'
                  )}>
                    {dayData.day}
                  </span>

                  {/* Event chips */}
                  <div className="flex flex-col gap-0.5 w-full">
                    {visibleEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className={cn(
                          'text-[10px] text-white px-1.5 py-0.5 rounded truncate text-left w-full cursor-pointer transition-opacity hover:opacity-90',
                          getEventColor(event)
                        )}
                        title={`${formatChipTime(event.time)} ${event.title}`}
                      >
                        {formatChipTime(event.time)} {event.title}
                      </button>
                    ))}
                    {extraCount > 0 && (
                      <span className="text-[10px] text-text-light px-0.5">+{extraCount} more</span>
                    )}
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Monday-first weekday order for the month grid header
const WEEKDAYS_SUN_MON_ORDER = WEEKDAYS_MON
