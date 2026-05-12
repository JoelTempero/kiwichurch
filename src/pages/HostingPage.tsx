import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { useGatherings } from '@/hooks/useGatherings'
import { Button, EmptyState, Spinner } from '@/components/common'
import { EventForm } from '@/components/events'
import { GroupForm } from '@/components/groups'
import { Plus, Pencil, Search, Repeat, Users as UsersIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { dbService } from '@/services/firebase'
import { recurrenceLabel } from '@/utils/recurrence'
import type { Event, Gathering } from '@/types'

type TopTab = 'events' | 'groups'
type EventScope = 'upcoming' | 'past'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function isoMonthsAgo(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: new Date(dateStr).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })
}

// Top-level tablist with arrow-key keyboard navigation. Roving tabindex
// keeps a single tab in the tab order; arrow keys move both focus and
// selection per the WAI-ARIA tabs pattern.
function TopTabs({
  activeTab,
  setActiveTab,
  showGroups,
}: {
  activeTab: TopTab
  setActiveTab: (t: TopTab) => void
  showGroups: boolean
}) {
  const tabs = showGroups ? (['events', 'groups'] as TopTab[]) : (['events'] as TopTab[])
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.indexOf(activeTab)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = tabs[(idx + 1) % tabs.length]
      setActiveTab(next)
      refs.current[tabs.indexOf(next)]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = tabs[(idx - 1 + tabs.length) % tabs.length]
      setActiveTab(next)
      refs.current[tabs.indexOf(next)]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveTab(tabs[0])
      refs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveTab(tabs[tabs.length - 1])
      refs.current[tabs.length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-1 p-1 bg-cream rounded-md mb-6" role="tablist" onKeyDown={onKey} aria-label="Hosting sections">
      {tabs.map((t, i) => {
        const selected = activeTab === t
        return (
          <button
            key={t}
            id={`hosting-tab-${t}`}
            ref={(el) => { refs.current[i] = el }}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`hosting-panel-${t}`}
            tabIndex={selected ? 0 : -1}
            className={cn(
              'px-4 py-2 rounded-sm text-sm font-medium transition-colors capitalize',
              selected ? 'bg-forest text-cream' : 'text-text-light hover:text-text-primary',
            )}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

export function HostingPage() {
  const { isAdminOrHost, isAdmin } = useAuth()

  const [activeTab, setActiveTab] = useState<TopTab>('events')

  // Event filters
  const [eventScope, setEventScope] = useState<EventScope>('upcoming')
  const [eventQuery, setEventQuery] = useState('')
  const [eventGroupFilter, setEventGroupFilter] = useState('')

  // Forms
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Gathering | null>(null)

  const today = todayISO()
  const upcomingRange = useMemo(() => ({
    startDate: today,
    // Show up to a year ahead so recurring series are visible
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }), [today])
  const pastRange = useMemo(() => ({
    startDate: isoMonthsAgo(6),
    endDate: today,
  }), [today])

  const range = eventScope === 'upcoming' ? upcomingRange : pastRange

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useEvents(range)
  const { data: groups = [], isLoading: loadingGroups, refetch: refetchGroups } = useGatherings()

  // Prefer the denormalised rsvpYesCount; fall back to an aggregate read for
  // legacy events that pre-date the counter. Most loads pay zero extra reads.
  const eventsMissingCount = useMemo(
    () => events.filter((e) => typeof e.rsvpYesCount !== 'number').slice(0, 60).map((e) => e.id),
    [events],
  )
  const { data: rsvpCountFallback = {} } = useQuery<Record<string, number>>({
    queryKey: ['hostingRsvpCountFallback', eventsMissingCount.join(',')],
    queryFn: () => dbService.getEventGoingCounts(eventsMissingCount),
    enabled: eventsMissingCount.length > 0,
    staleTime: 60_000,
  })
  const rsvpCounts = useMemo(() => {
    const out: Record<string, number> = {}
    for (const e of events) {
      out[e.id] = typeof e.rsvpYesCount === 'number' ? e.rsvpYesCount : (rsvpCountFallback[e.id] ?? 0)
    }
    return out
  }, [events, rsvpCountFallback])

  const filteredEvents = useMemo(() => {
    const q = eventQuery.toLowerCase().trim()
    const filtered = events.filter((e) => {
      if (eventGroupFilter && e.gatheringId !== eventGroupFilter) return false
      if (!q) return true
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.gatheringName || '').toLowerCase().includes(q)
      )
    })
    if (eventScope === 'past') filtered.reverse() // newest past first
    return filtered
  }, [events, eventQuery, eventGroupFilter, eventScope])

  // For Past: group events by month for easier scanning
  const groupedByMonth = useMemo(() => {
    if (eventScope !== 'past') return null
    const map = new Map<string, Event[]>()
    filteredEvents.forEach((e) => {
      const key = monthLabel(e.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return Array.from(map.entries())
  }, [filteredEvents, eventScope])

  if (!isAdminOrHost) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <EmptyState
          icon="lock"
          title="Access Denied"
          message="You need host or admin permissions to access this page"
        />
      </div>
    )
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleEventFormClose = () => {
    setShowEventForm(false)
    setEditingEvent(null)
  }

  const handleEventSuccess = () => {
    refetchEvents()
  }

  const handleCreateGroup = () => {
    setEditingGroup(null)
    setShowGroupForm(true)
  }

  const handleEditGroup = (group: Gathering) => {
    setEditingGroup(group)
    setShowGroupForm(true)
  }

  const handleGroupFormClose = () => {
    setShowGroupForm(false)
    setEditingGroup(null)
  }

  const handleGroupSuccess = () => {
    refetchGroups()
  }

  const renderEventRow = (event: Event) => {
    const goingCount = rsvpCounts[event.id] ?? 0
    return (
      <div key={event.id} className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary text-sm m-0 truncate">{event.title}</h3>
            {event.seriesId && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20"
                title={`Part of a ${event.recurrence} series`}
              >
                <Repeat size={11} />
                {recurrenceLabel(event.recurrence)}
              </span>
            )}
          </div>
          <p className="text-xs text-text-light mt-0.5 m-0">
            {formatDate(event.date)} at {event.time}
            {event.location && ` • ${event.location}`}
            {event.gatheringName && ` • ${event.gatheringName}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {goingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-text-light">
              <UsersIcon size={12} />
              {goingCount}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditEvent(event)}
            aria-label={`Edit ${event.title}`}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Hosting</h1>
        <p className="text-text-light text-sm">Manage events, content, and groups</p>
      </div>

      {/* Top tabs */}
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} showGroups={isAdmin} />

      {activeTab === 'events' && (
        <div id="hosting-panel-events" role="tabpanel" aria-labelledby="hosting-tab-events" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-forest">Events</h2>
            <Button variant="primary" size="sm" onClick={handleCreateEvent}>
              <Plus size={16} aria-hidden="true" />
              New Event
            </Button>
          </div>

          {/* Scope toggle */}
          <div className="flex gap-1 p-1 bg-cream rounded-md mb-3" role="group" aria-label="Event time range">
            {(['upcoming', 'past'] as EventScope[]).map((s) => (
              <button
                key={s}
                onClick={() => setEventScope(s)}
                aria-pressed={eventScope === s}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors capitalize',
                  eventScope === s ? 'bg-forest text-cream' : 'text-text-light hover:text-text-primary',
                )}
              >
                {s === 'upcoming' ? 'Upcoming' : 'Past 6 months'}
              </button>
            ))}
          </div>

          {/* Search + group filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#e0dbd2] rounded-md bg-[#faf8f4]">
              <Search size={16} className="text-text-light shrink-0" />
              <input
                type="text"
                className="w-full border-none p-0 bg-transparent text-sm outline-none"
                placeholder="Search by title, location, or group..."
                value={eventQuery}
                onChange={(e) => setEventQuery(e.target.value)}
              />
            </div>
            <select
              value={eventGroupFilter}
              onChange={(e) => setEventGroupFilter(e.target.value)}
              className="sm:w-48 px-3 py-2 rounded-md border border-[#e0dbd2] bg-transparent text-sm focus:outline-none focus:border-forest"
              aria-label="Filter by group"
            >
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {loadingEvents ? (
            <Spinner />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={eventScope === 'upcoming' ? 'No upcoming events' : 'No past events'}
              message={
                eventScope === 'upcoming'
                  ? (eventQuery || eventGroupFilter ? 'Try clearing filters' : 'Create an event to get started')
                  : 'Past events from the last 6 months will appear here'
              }
              action={
                eventScope === 'upcoming' && !eventQuery && !eventGroupFilter ? (
                  <Button variant="primary" onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                ) : undefined
              }
            />
          ) : groupedByMonth ? (
            <div className="space-y-4">
              {groupedByMonth.map(([month, list]) => (
                <div key={month}>
                  <p className="text-xs uppercase tracking-widest font-medium text-text-light mb-2">{month}</p>
                  <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
                    {list.map(renderEventRow)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {filteredEvents.map(renderEventRow)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && isAdmin && (
        <div id="hosting-panel-groups" role="tabpanel" aria-labelledby="hosting-tab-groups" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-forest">Groups</h2>
            <Button variant="primary" size="sm" onClick={handleCreateGroup}>
              <Plus size={16} aria-hidden="true" />
              New Group
            </Button>
          </div>

          {loadingGroups ? (
            <Spinner />
          ) : groups.length === 0 ? (
            <EmptyState
              icon="users"
              title="No groups yet"
              message="Create a group for members to connect"
              action={
                <Button variant="primary" onClick={handleCreateGroup}>
                  Create Group
                </Button>
              }
            />
          ) : (
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {groups.map((group: Gathering) => (
                <div key={group.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color || '#2d5a4a' }}
                      />
                      <h3 className="font-semibold text-text-primary text-sm truncate">{group.name}</h3>
                      {group.featured && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gold/20 text-gold">Featured</span>
                      )}
                      {!group.isPublic && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Private</span>
                      )}
                    </div>
                    <p className="text-xs text-text-light mt-0.5">
                      {group.rhythm || 'No schedule set'}
                      {group.location && ` • ${group.location}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                      aria-label={`Edit ${group.name}`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        onClose={handleEventFormClose}
        onSuccess={handleEventSuccess}
      />

      <GroupForm
        group={editingGroup}
        isOpen={showGroupForm}
        onClose={handleGroupFormClose}
        onSuccess={handleGroupSuccess}
      />
    </div>
  )
}
