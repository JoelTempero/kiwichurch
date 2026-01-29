import { useState } from 'react'
import { Modal, Button, Badge, Avatar } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useEventRSVPs, useUserRSVP, useRSVP, useCancelRSVP } from '@/hooks/useEvents'
import { useToast } from '@/components/common/Toast'
import { EventForm } from './EventForm'
import type { Event } from '@/types'

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onEventUpdated?: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
}

export function EventModal({ event, isOpen, onClose, onEventUpdated }: EventModalProps) {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [isRsvping, setIsRsvping] = useState(false)
  const [showRsvpForm, setShowRsvpForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [rsvpNotes, setRsvpNotes] = useState('')
  const [guestCount, setGuestCount] = useState(0)
  const [showAttendees, setShowAttendees] = useState(false)

  const { data: rsvps = [] } = useEventRSVPs(event?.id || null)
  const { data: userRsvp } = useUserRSVP(event?.id || null, user?.id || null)

  const rsvpMutation = useRSVP()
  const cancelRsvpMutation = useCancelRSVP()

  if (!event) return null

  const canEdit = isAdminOrHost || event.createdBy === user?.id

  const handleRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!user?.id) return

    setIsRsvping(true)
    try {
      await rsvpMutation.mutateAsync({
        eventId: event.id,
        userId: user.id,
        status,
        notes: rsvpNotes,
        guestCount: status === 'yes' ? guestCount : 0
      })
      showToast(
        status === 'yes' ? "You're going!" : status === 'maybe' ? 'Marked as maybe' : 'RSVP updated',
        'success'
      )
      setShowRsvpForm(false)
      setRsvpNotes('')
      setGuestCount(0)
    } catch (error) {
      showToast('Failed to update RSVP', 'error')
    } finally {
      setIsRsvping(false)
    }
  }

  const handleCancelRsvp = async () => {
    if (!user?.id) return

    setIsRsvping(true)
    try {
      await cancelRsvpMutation.mutateAsync({
        eventId: event.id,
        userId: user.id
      })
      showToast('RSVP cancelled', 'success')
    } catch (error) {
      showToast('Failed to cancel RSVP', 'error')
    } finally {
      setIsRsvping(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    onEventUpdated?.()
  }

  const goingRsvps = rsvps.filter(r => r.status === 'yes')
  const maybeRsvps = rsvps.filter(r => r.status === 'maybe')
  const goingCount = goingRsvps.length
  const maybeCount = maybeRsvps.length
  const totalGuests = goingRsvps.reduce((sum, r) => sum + (r.guestCount || 0), 0)

  return (
    <>
      <Modal isOpen={isOpen && !showEditForm} onClose={onClose} title={event.title} size="lg">
        <div className="event-modal-content">
          {/* Edit Button for authorized users */}
          {canEdit && (
            <div className="event-modal-admin-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                aria-label="Edit this event"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Event
              </Button>
            </div>
          )}

          {event.imageURL && (
            <div className="event-modal-image">
              <img src={event.imageURL} alt={event.title} />
            </div>
          )}

          <div className="event-modal-details">
            <div className="event-modal-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>

            <div className="event-modal-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</span>
            </div>

            {event.location && (
              <div className="event-modal-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}

            {event.gatheringName && (
              <div className="event-modal-detail">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{event.gatheringName}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="event-modal-description">
              <p>{event.description}</p>
            </div>
          )}

          {/* RSVP Status with Attendee List */}
          <div className="event-modal-rsvp-section">
            <div className="event-modal-rsvp-stats">
              <button
                className="rsvp-stat-button"
                onClick={() => setShowAttendees(!showAttendees)}
                aria-expanded={showAttendees}
              >
                <Badge variant="success">{goingCount} going</Badge>
                {totalGuests > 0 && <span className="rsvp-guests">+{totalGuests} guests</span>}
              </button>
              {maybeCount > 0 && (
                <span className="rsvp-stat">
                  <Badge variant="warning">{maybeCount} maybe</Badge>
                </span>
              )}
            </div>

            {/* Attendee List */}
            {showAttendees && goingRsvps.length > 0 && (
              <div className="event-modal-attendees">
                <h4 className="event-modal-attendees-title">Who's going</h4>
                <ul className="event-modal-attendees-list">
                  {goingRsvps.map(rsvp => (
                    <li key={rsvp.userId} className="event-modal-attendee">
                      <Avatar size="sm" name={rsvp.userId} />
                      <span className="event-modal-attendee-name">
                        {rsvp.userId === user?.id ? 'You' : rsvp.userId}
                        {rsvp.guestCount ? ` (+${rsvp.guestCount})` : ''}
                      </span>
                      {rsvp.notes && (
                        <span className="event-modal-attendee-notes">{rsvp.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Current User RSVP */}
          {userRsvp ? (
            <div className="event-modal-user-rsvp">
              <p>
                Your RSVP:{' '}
                <Badge variant={userRsvp.status === 'yes' ? 'success' : userRsvp.status === 'maybe' ? 'warning' : 'default'}>
                  {userRsvp.status === 'yes' ? 'Going' : userRsvp.status === 'maybe' ? 'Maybe' : 'Not going'}
                </Badge>
                {userRsvp.guestCount ? ` with ${userRsvp.guestCount} guest${userRsvp.guestCount > 1 ? 's' : ''}` : ''}
              </p>
              <div className="event-modal-rsvp-actions">
                <Button variant="outline" size="sm" onClick={() => setShowRsvpForm(true)}>
                  Change RSVP
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancelRsvp} loading={isRsvping}>
                  Cancel RSVP
                </Button>
              </div>
            </div>
          ) : (
            <div className="event-modal-rsvp-buttons">
              <Button variant="primary" onClick={() => handleRsvp('yes')} loading={isRsvping}>
                I'm going
              </Button>
              <Button variant="outline" onClick={() => handleRsvp('maybe')} loading={isRsvping}>
                Maybe
              </Button>
              <Button variant="ghost" onClick={() => setShowRsvpForm(true)}>
                More options
              </Button>
            </div>
          )}

          {/* RSVP Form with Guest Count */}
          {showRsvpForm && (
            <div className="event-modal-rsvp-form">
              <div className="form-group">
                <label className="form-label" htmlFor="rsvp-guests">
                  Bringing guests?
                </label>
                <select
                  id="rsvp-guests"
                  className="form-select"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                >
                  <option value={0}>Just me</option>
                  <option value={1}>+1 guest</option>
                  <option value={2}>+2 guests</option>
                  <option value={3}>+3 guests</option>
                  <option value={4}>+4 guests</option>
                  <option value={5}>+5 guests</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rsvp-notes">
                  Notes (dietary requirements, etc.)
                </label>
                <textarea
                  id="rsvp-notes"
                  className="form-textarea"
                  value={rsvpNotes}
                  onChange={(e) => setRsvpNotes(e.target.value)}
                  placeholder="Any notes or dietary requirements?"
                  rows={2}
                />
              </div>
              <div className="event-modal-rsvp-buttons">
                <Button variant="primary" onClick={() => handleRsvp('yes')} loading={isRsvping}>
                  Going
                </Button>
                <Button variant="outline" onClick={() => handleRsvp('maybe')} loading={isRsvping}>
                  Maybe
                </Button>
                <Button variant="ghost" onClick={() => handleRsvp('no')} loading={isRsvping}>
                  Can't make it
                </Button>
                <Button variant="ghost" onClick={() => setShowRsvpForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Form Modal */}
      <EventForm
        event={event}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
