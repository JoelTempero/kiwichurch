import { useState, useMemo } from 'react'
import { useUIStore } from '@/store'
import { useEvents } from '@/hooks/useEvents'
import { EventCard, EventModal, CalendarView } from '@/components/events'
import { EmptyState, EventCardSkeleton, PullToRefresh, Button } from '@/components/common'
import type { Event } from '@/types'

export function EventsPage() {
  const { eventsViewMode, setEventsViewMode } = useUIStore()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get events for the next 3 months
  const today = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3)

  const { data: events = [], isLoading, refetch } = useEvents({
    startDate: today.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  })

  const handleRefresh = async () => {
    await refetch()
  }

  // Group events by date for list view
  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {}
    events.forEach(event => {
      if (!groups[event.date]) {
        groups[event.date] = []
      }
      groups[event.date].push(event)
    })
    return groups
  }, [events])

  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort()
  }, [groupedEvents])

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today'
    }
    if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow'
    }

    return date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="events-page">
        {/* View Toggle */}
      <div className="events-view-toggle">
        <button
          className={`view-toggle-btn ${eventsViewMode === 'list' ? 'active' : ''}`}
          onClick={() => setEventsViewMode('list')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          List
        </button>
        <button
          className={`view-toggle-btn ${eventsViewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setEventsViewMode('calendar')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Calendar
        </button>
      </div>

      {/* Content */}
      {eventsViewMode === 'calendar' ? (
        <CalendarView
          events={events}
          onDateClick={() => {}}
          onEventClick={handleEventClick}
        />
      ) : (
        <div className="events-list">
          {isLoading ? (
            <div className="events-loading">
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              message="Switch to calendar view to browse past and future months"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEventsViewMode('calendar')}
                >
                  View Calendar
                </Button>
              }
            />
          ) : (
            sortedDates.map(date => (
              <div key={date} className="events-date-group">
                <h3 className="events-date-header">{formatDateHeader(date)}</h3>
                <div className="events-date-list">
                  {groupedEvents[date].map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </PullToRefresh>
  )
}
