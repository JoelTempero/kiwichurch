import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import { useKetePosts } from '@/hooks/useKete'
import { useGatherings } from '@/hooks/useGatherings'
import { Button, EmptyState, Skeleton } from '@/components/common'
import { EventForm } from '@/components/events'
import { KeteForm } from '@/components/kete'
import { GroupForm } from '@/components/groups'
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
      <div className="hosting-page">
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
    <div className="hosting-page">
      <div className="hosting-header">
        <h1 className="hosting-title">Hosting</h1>
        <p className="hosting-subtitle">Manage events, content, and groups</p>
      </div>

      {/* Tabs */}
      <div className="hosting-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'events'}
          className={`hosting-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'kete'}
          className={`hosting-tab ${activeTab === 'kete' ? 'active' : ''}`}
          onClick={() => setActiveTab('kete')}
        >
          Kete Posts
        </button>
        {isAdmin && (
          <button
            role="tab"
            aria-selected={activeTab === 'groups'}
            className={`hosting-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'events' && (
        <div className="hosting-section" role="tabpanel">
          <div className="hosting-section-header">
            <h2 className="hosting-section-title">Upcoming Events</h2>
            <Button variant="primary" size="sm" onClick={handleCreateEvent}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Event
            </Button>
          </div>

          {loadingEvents ? (
            <div className="hosting-list">
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
            <div className="hosting-list">
              {events.map((event: Event) => (
                <div key={event.id} className="hosting-item">
                  <div className="hosting-item-info">
                    <h3 className="hosting-item-title">{event.title}</h3>
                    <p className="hosting-item-meta">
                      {formatDate(event.date)} at {event.time}
                      {event.location && ` • ${event.location}`}
                      {event.gatheringName && ` • ${event.gatheringName}`}
                    </p>
                  </div>
                  <div className="hosting-item-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      aria-label={`Edit ${event.title}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
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
        <div className="hosting-section" role="tabpanel">
          <div className="hosting-section-header">
            <h2 className="hosting-section-title">Kete Posts</h2>
            <Button variant="primary" size="sm" onClick={handleCreatePost}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Post
            </Button>
          </div>

          {loadingKete ? (
            <div className="hosting-list">
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
            <div className="hosting-list">
              {ketePosts.map((post: KetePost) => (
                <div key={post.id} className="hosting-item">
                  <div className="hosting-item-info">
                    <div className="hosting-item-title-row">
                      <h3 className="hosting-item-title">{post.title}</h3>
                      {!post.published && (
                        <span className="hosting-item-badge hosting-item-badge-draft">Draft</span>
                      )}
                    </div>
                    <p className="hosting-item-meta">
                      By {post.authorName}
                      {post.publishedAt && ` • ${formatPostDate(post.publishedAt as Date)}`}
                    </p>
                  </div>
                  <div className="hosting-item-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                      aria-label={`Edit ${post.title}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
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
        <div className="hosting-section" role="tabpanel">
          <div className="hosting-section-header">
            <h2 className="hosting-section-title">Groups</h2>
            <Button variant="primary" size="sm" onClick={handleCreateGroup}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Group
            </Button>
          </div>

          {loadingGroups ? (
            <div className="hosting-list">
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
            <div className="hosting-list">
              {groups.map((group: Gathering) => (
                <div key={group.id} className="hosting-item">
                  <div className="hosting-item-info">
                    <div className="hosting-item-title-row">
                      <div
                        className="hosting-item-color"
                        style={{ backgroundColor: group.color || '#2d5a4a' }}
                      />
                      <h3 className="hosting-item-title">{group.name}</h3>
                      {group.featured && (
                        <span className="hosting-item-badge hosting-item-badge-featured">Featured</span>
                      )}
                      {!group.isPublic && (
                        <span className="hosting-item-badge hosting-item-badge-private">Private</span>
                      )}
                    </div>
                    <p className="hosting-item-meta">
                      {group.rhythm || 'No schedule set'}
                      {group.location && ` • ${group.location}`}
                    </p>
                  </div>
                  <div className="hosting-item-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                      aria-label={`Edit ${group.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
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
