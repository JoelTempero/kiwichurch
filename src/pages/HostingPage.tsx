import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { useKetePosts } from '@/hooks/useKete'
import { useGatherings } from '@/hooks/useGatherings'
import { Button, EmptyState, Skeleton } from '@/components/common'
import { EventForm } from '@/components/events'
import { KeteForm } from '@/components/kete'
import { GroupForm } from '@/components/groups'
import { Plus, Pencil } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Event, KetePost, Gathering } from '@/types'

export function HostingPage() {
  const { isAdminOrHost, isAdmin } = useAuth()

  const [activeTab, setActiveTab] = useState<'events' | 'kete' | 'groups'>('events')

  // Event form state
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Kete form state
  const [showKeteForm, setShowKeteForm] = useState(false)
  const [editingPost, setEditingPost] = useState<KetePost | null>(null)

  // Group form state
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Gathering | null>(null)

  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents()
  const { data: ketePosts = [], isLoading: loadingKete, refetch: refetchKete } = useKetePosts()
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

  const handleCreatePost = () => {
    setEditingPost(null)
    setShowKeteForm(true)
  }

  const handleEditPost = (post: KetePost) => {
    setEditingPost(post)
    setShowKeteForm(true)
  }

  const handleKeteFormClose = () => {
    setShowKeteForm(false)
    setEditingPost(null)
  }

  const handleKeteSuccess = () => {
    refetchKete()
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

  const formatPostDate = (date: Date | { toDate: () => Date } | null) => {
    if (!date) return ''
    const d = date instanceof Date ? date : date.toDate()
    return d.toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
        <button
          role="tab"
          aria-selected={activeTab === 'kete'}
          className={cn(
            'px-4 py-2 rounded-sm text-sm font-medium transition-colors',
            activeTab === 'kete'
              ? 'bg-forest text-cream'
              : 'text-text-light hover:text-text-primary'
          )}
          onClick={() => setActiveTab('kete')}
        >
          Kete Posts
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
            <div className="space-y-2">
              <Skeleton variant="rectangular" height={70} />
              <Skeleton variant="rectangular" height={70} />
            </div>
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

      {activeTab === 'kete' && (
        <div className="mb-8" role="tabpanel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-forest">Kete Posts</h2>
            <Button variant="primary" size="sm" onClick={handleCreatePost}>
              <Plus size={16} aria-hidden="true" />
              New Post
            </Button>
          </div>

          {loadingKete ? (
            <div className="space-y-2">
              <Skeleton variant="rectangular" height={70} />
              <Skeleton variant="rectangular" height={70} />
            </div>
          ) : ketePosts.length === 0 ? (
            <EmptyState
              icon="book"
              title="No posts yet"
              message="Create a post to share with the community"
              action={
                <Button variant="primary" onClick={handleCreatePost}>
                  Create Post
                </Button>
              }
            />
          ) : (
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {ketePosts.map((post: KetePost) => (
                <div key={post.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{post.title}</h3>
                      {!post.published && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-text-light mt-0.5">
                      By {post.authorName}
                      {post.publishedAt && ` \u2022 ${formatPostDate(post.publishedAt as Date)}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                      aria-label={`Edit ${post.title}`}
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
            <div className="space-y-2">
              <Skeleton variant="rectangular" height={70} />
              <Skeleton variant="rectangular" height={70} />
            </div>
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

      {/* Kete Form Modal */}
      <KeteForm
        post={editingPost}
        isOpen={showKeteForm}
        onClose={handleKeteFormClose}
        onSuccess={handleKeteSuccess}
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
