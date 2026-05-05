import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { EventCard, EventModal, CalendarView } from '@/components/events'
import { EmptyState, EventCardSkeleton, PullToRefresh, Button } from '@/components/common'
import type { Event, RSVP } from '@/types'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'

export function EventsPage() {
  const { eventsViewMode, setEventsViewMode, calendarViewMode, setCalendarViewMode } = useUIStore()
  const { user } = useAuth()
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

  const { data: userRsvps = {} } = useQuery({
    queryKey: ['user-rsvps-all', user?.id, events.map(e => e.id).join(',')],
    queryFn: async () => {
      if (!user?.id || events.length === 0) return {}
      const rsvpMap: Record<string, RSVP> = {}
      await Promise.all(
        events.map(async (event) => {
          const rsvp = await dbService.getUserRSVP(event.id, user.id)
          if (rsvp) rsvpMap[event.id] = rsvp
        })
      )
      return rsvpMap
    },
    enabled: !!user?.id && events.length > 0,
    staleTime: 2 * 60 * 1000,
  })

  const handleRefresh = async () => {
    await refetch()
  }

  // Group events by month for list view
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Event[]> = {}
    events.forEach(event => {
      const monthKey = event.date.slice(0, 7) // "YYYY-MM"
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(event)
    })
    return groups
  }, [events])

  const sortedMonths = useMemo(() => {
    return Object.keys(groupedByMonth).sort()
  }, [groupedByMonth])

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month - 1)
    const now = new Date()
    if (year === now.getFullYear() && month - 1 === now.getMonth()) {
      return 'This Month'
    }
    return date.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-display text-forest mb-4">Events</h1>
        {/* View Toggle */}
        <div className="inline-flex bg-[#ebe6dc] rounded-md p-1 gap-1 mb-4">
          <button
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              eventsViewMode === 'list'
                ? 'bg-forest text-cream'
                : 'text-text-light hover:text-forest'
            )}
            onClick={() => setEventsViewMode('list')}
          >
            List
          </button>
          <button
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              eventsViewMode === 'calendar' && calendarViewMode === 'month'
                ? 'bg-forest text-cream'
                : 'text-text-light hover:text-forest'
            )}
            onClick={() => {
              setCalendarViewMode('month')
              setEventsViewMode('calendar')
            }}
          >
            Month
          </button>
          <button
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium transition-colors',
              eventsViewMode === 'calendar' && calendarViewMode === 'week'
                ? 'bg-forest text-cream'
                : 'text-text-light hover:text-forest'
            )}
            onClick={() => {
              setCalendarViewMode('week')
              setEventsViewMode('calendar')
            }}
          >
            Week
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
          <div>
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
              sortedMonths.map(month => (
                <div key={month} className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden mb-4">
                  <div className="px-4 py-2.5 border-b border-[#e0dbd2] bg-[#faf8f4]">
                    <h3 className="text-sm font-semibold text-text-primary">{formatMonthHeader(month)}</h3>
                  </div>
                  <div className="divide-y divide-[#ebe6dc]">
                    {groupedByMonth[month].map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                        rsvpStatus={userRsvps[event.id]?.status || null}
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
