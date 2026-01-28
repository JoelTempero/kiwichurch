import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useGatherings } from '@/hooks/useGatherings'
import { usePublishedKetePosts, useCreateKetePost } from '@/hooks/useKete'
import { Button, Modal, EmptyState, Skeleton } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import type { Event, KetePost } from '@/types'

export function HostingPage() {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'events' | 'kete'>('events')
  const [showEventModal, setShowEventModal] = useState(false)
  const [showKeteModal, setShowKeteModal] = useState(false)

  const { data: events = [], isLoading: loadingEvents } = useUpcomingEvents()
  const { data: gatherings = [] } = useGatherings()
  const { data: ketePosts = [], isLoading: loadingKete } = usePublishedKetePosts()

  const createEvent = useCreateEvent()
  const deleteEvent = useDeleteEvent()
  const createKetePost = useCreateKetePost()

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    gatheringId: ''
  })

  // Kete post form state
  const [keteForm, setKeteForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: ''
  })

  const [isSaving, setIsSaving] = useState(false)

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      const gathering = gatherings.find(g => g.id === eventForm.gatheringId)
      await createEvent.mutateAsync({
        ...eventForm,
        createdBy: user.id,
        gatheringName: gathering?.name,
        isPublic: true
      })
      showToast('Event created', 'success')
      setShowEventModal(false)
      setEventForm({
        title: '',
        date: '',
        time: '',
        endTime: '',
        location: '',
        description: '',
        gatheringId: ''
      })
    } catch (error) {
      showToast('Failed to create event', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent.mutateAsync(eventId)
      showToast('Event deleted', 'success')
    } catch (error) {
      showToast('Failed to delete event', 'error')
    }
  }

  const handleCreateKetePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      await createKetePost.mutateAsync({
        ...keteForm,
        authorId: user.id,
        authorName: user.displayName,
        authorPhotoURL: user.photoURL,
        published: true,
        publishedAt: new Date()
      })
      showToast('Post created', 'success')
      setShowKeteModal(false)
      setKeteForm({
        title: '',
        content: '',
        excerpt: '',
        featuredImage: ''
      })
    } catch (error) {
      showToast('Failed to create post', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="hosting-page">
      <div className="hosting-header">
        <h1 className="hosting-title">Hosting</h1>
        <p className="hosting-subtitle">Manage events and content</p>
      </div>

      {/* Tabs */}
      <div className="hosting-tabs">
        <button
          className={`hosting-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={`hosting-tab ${activeTab === 'kete' ? 'active' : ''}`}
          onClick={() => setActiveTab('kete')}
        >
          Kete Posts
        </button>
      </div>

      {/* Content */}
      {activeTab === 'events' ? (
        <div className="hosting-section">
          <div className="hosting-section-header">
            <h2 className="hosting-section-title">Upcoming Events</h2>
            <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Event
            </Button>
          </div>

          {loadingEvents ? (
            <div className="hosting-list">
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              message="Create an event to get started"
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
                    </p>
                  </div>
                  <div className="hosting-item-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="hosting-section">
          <div className="hosting-section-header">
            <h2 className="hosting-section-title">Kete Posts</h2>
            <Button variant="primary" size="sm" onClick={() => setShowKeteModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Post
            </Button>
          </div>

          {loadingKete ? (
            <div className="hosting-list">
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
            </div>
          ) : ketePosts.length === 0 ? (
            <EmptyState
              icon="book"
              title="No posts yet"
              message="Create a post to share with the community"
            />
          ) : (
            <div className="hosting-list">
              {ketePosts.map((post: KetePost) => (
                <div key={post.id} className="hosting-item">
                  <div className="hosting-item-info">
                    <h3 className="hosting-item-title">{post.title}</h3>
                    <p className="hosting-item-meta">
                      By {post.authorName}
                      {post.publishedAt && ` • ${formatDate(post.publishedAt instanceof Date ? post.publishedAt.toISOString() : '')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Create Event"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Time (optional)</label>
            <input
              type="time"
              className="form-input"
              value={eventForm.endTime}
              onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Group (optional)</label>
            <select
              className="form-select"
              value={eventForm.gatheringId}
              onChange={(e) => setEventForm({ ...eventForm, gatheringId: e.target.value })}
            >
              <option value="">No group</option>
              {gatherings.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <Button type="submit" variant="primary" loading={isSaving}>
              Create Event
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Kete Post Modal */}
      <Modal
        isOpen={showKeteModal}
        onClose={() => setShowKeteModal(false)}
        title="Create Post"
        size="lg"
      >
        <form onSubmit={handleCreateKetePost}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={keteForm.title}
              onChange={(e) => setKeteForm({ ...keteForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt</label>
            <textarea
              className="form-textarea"
              value={keteForm.excerpt}
              onChange={(e) => setKeteForm({ ...keteForm, excerpt: e.target.value })}
              placeholder="Brief summary for the card"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Featured Image URL</label>
            <input
              type="url"
              className="form-input"
              value={keteForm.featuredImage}
              onChange={(e) => setKeteForm({ ...keteForm, featuredImage: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={keteForm.content}
              onChange={(e) => setKeteForm({ ...keteForm, content: e.target.value })}
              rows={10}
              required
            />
            <span className="form-hint">HTML is supported</span>
          </div>

          <div className="modal-actions">
            <Button type="submit" variant="primary" loading={isSaving}>
              Publish
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowKeteModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
