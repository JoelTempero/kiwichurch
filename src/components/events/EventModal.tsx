import { useState } from 'react'
import { Modal, Button, Badge } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useEventRSVPs, useUserRSVP, useRSVP, useCancelRSVP } from '@/hooks/useEvents'
import { useToast } from '@/components/common/Toast'
import type { Event } from '@/types'

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
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

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isRsvping, setIsRsvping] = useState(false)
  const [showRsvpForm, setShowRsvpForm] = useState(false)
  const [rsvpNotes, setRsvpNotes] = useState('')

  const { data: rsvps = [] } = useEventRSVPs(event?.id || null)
  const { data: userRsvp } = useUserRSVP(event?.id || null, user?.id || null)

  const rsvpMutation = useRSVP()
  const cancelRsvpMutation = useCancelRSVP()

  if (!event) return null

  const handleRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!user?.id) return

    setIsRsvping(true)
    try {
      await rsvpMutation.mutateAsync({
        eventId: event.id,
        userId: user.id,
        status,
        notes: rsvpNotes
      })
      showToast(
        status === 'yes' ? "You're going!" : status === 'maybe' ? 'Marked as maybe' : 'RSVP updated',
        'success'
      )
      setShowRsvpForm(false)
      setRsvpNotes('')
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

  const goingCount = rsvps.filter(r => r.status === 'yes').length
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="lg">
      <div className="event-modal-content">
        {event.imageURL && (
          <div className="event-modal-image">
            <img src={event.imageURL} alt={event.title} />
          </div>
        )}

        <div className="event-modal-details">
          <div className="event-modal-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="event-modal-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</span>
          </div>

          {event.location && (
            <div className="event-modal-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{event.location}</span>
            </div>
          )}

          {event.gatheringName && (
            <div className="event-modal-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
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

        {/* RSVP Status */}
        <div className="event-modal-rsvp-stats">
          <span className="rsvp-stat">
            <Badge variant="success">{goingCount} going</Badge>
          </span>
          {maybeCount > 0 && (
            <span className="rsvp-stat">
              <Badge variant="warning">{maybeCount} maybe</Badge>
            </span>
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
            </p>
            <div className="event-modal-rsvp-actions">
              <Button variant="outline" size="sm" onClick={() => setShowRsvpForm(true)}>
                Change RSVP
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelRsvp} loading={isRsvping}>
                Cancel
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
            <Button variant="ghost" onClick={() => handleRsvp('no')} loading={isRsvping}>
              Can't make it
            </Button>
          </div>
        )}

        {/* RSVP Form */}
        {showRsvpForm && (
          <div className="event-modal-rsvp-form">
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                value={rsvpNotes}
                onChange={(e) => setRsvpNotes(e.target.value)}
                placeholder="Any notes or dietary requirements?"
                rows={3}
              />
            </div>
            <div className="event-modal-rsvp-buttons">
              <Button variant="primary" onClick={() => handleRsvp('yes')} loading={isRsvping}>
                Going
              </Button>
              <Button variant="outline" onClick={() => handleRsvp('maybe')} loading={isRsvping}>
                Maybe
              </Button>
              <Button variant="ghost" onClick={() => setShowRsvpForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
