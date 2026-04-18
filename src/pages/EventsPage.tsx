import { useState, useMemo } from 'react'
import { List, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'
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
      <div className="max-w-3xl mx-auto p-4">
        {/* View Toggle */}
        <div className="flex gap-1 p-1 bg-cream rounded-md mb-4">
          <button
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-colors',
              eventsViewMode === 'list'
                ? 'bg-white text-forest shadow-sm'
                : 'text-text-light hover:text-text-primary'
            )}
            onClick={() => setEventsViewMode('list')}
          >
            <List size={18} />
            List
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-colors',
              eventsViewMode === 'calendar'
                ? 'bg-white text-forest shadow-sm'
                : 'text-text-light hover:text-text-primary'
            )}
            onClick={() => setEventsViewMode('calendar')}
          >
            <Calendar size={18} />
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
          <div className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
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
                <div key={date}>
                  <h3 className="text-sm font-semibold text-text-light uppercase tracking-wide mb-3">{formatDateHeader(date)}</h3>
                  <div className="space-y-2">
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
