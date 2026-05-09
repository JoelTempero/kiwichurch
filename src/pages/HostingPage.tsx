import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { useGatherings } from '@/hooks/useGatherings'
import { Button, EmptyState, Spinner } from '@/components/common'
import { EventForm } from '@/components/events'
import { GroupForm } from '@/components/groups'
import { Plus, Pencil } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Event, Gathering } from '@/types'

export function HostingPage() {
  const { isAdminOrHost, isAdmin } = useAuth()

  const [activeTab, setActiveTab] = useState<'events' | 'groups'>('events')

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Group form state
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Gathering | null>(null)

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents()
  const { data: groups = [], isLoading: loadingGroups, refetch: refetchGroups } = useGatherings()

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-display text-forest">Hosting</h1>
        <p className="text-text-light text-sm">Manage events, content, and groups</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cream rounded-md mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'events'}
          className={cn(
            'px-4 py-2 rounded-sm text-sm font-medium transition-colors',
            activeTab === 'events'
              ? 'bg-forest text-cream'
              : 'text-text-light hover:text-text-primary'
          )}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        {isAdmin && (
          <button
            role="tab"
            aria-selected={activeTab === 'groups'}
            className={cn(
              'px-4 py-2 rounded-sm text-sm font-medium transition-colors',
              activeTab === 'groups'
                ? 'bg-forest text-cream'
                : 'text-text-light hover:text-text-primary'
            )}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'events' && (
        <div className="mb-8" role="tabpanel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-forest">Upcoming Events</h2>
            <Button variant="primary" size="sm" onClick={handleCreateEvent}>
              <Plus size={16} aria-hidden="true" />
              New Event
            </Button>
          </div>

          {loadingEvents ? (
            <Spinner />
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              message="Create an event to get started"
              action={
                <Button variant="primary" onClick={handleCreateEvent}>
                  Create Event
                </Button>
              }
            />
          ) : (
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {events.map((event: Event) => (
                <div key={event.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm truncate">{event.title}</h3>
                    <p className="text-xs text-text-light mt-0.5">
                      {formatDate(event.date)} at {event.time}
                      {event.location && ` \u2022 ${event.location}`}
                      {event.gatheringName && ` \u2022 ${event.gatheringName}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
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
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && isAdmin && (
        <div className="mb-8" role="tabpanel">
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
                    <div className="flex items-center gap-2">
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
                      {group.location && ` \u2022 ${group.location}`}
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

      {/* Event Form Modal */}
      <EventForm
        event={editingEvent}
        isOpen={showEventForm}
        onClose={handleEventFormClose}
        onSuccess={handleEventSuccess}
      />

      {/* Group Form Modal */}
      <GroupForm
        group={editingGroup}
        isOpen={showGroupForm}
        onClose={handleGroupFormClose}
        onSuccess={handleGroupSuccess}
      />
    </div>
  )
}
