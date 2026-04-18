import { useState } from 'react'
import { Edit, Calendar, Clock, MapPin, Users } from 'lucide-react'
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
        <div className="space-y-4">
          {/* Edit Button for authorized users */}
          {canEdit && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                aria-label="Edit this event"
              >
                <Edit size={16} />
                Edit Event
              </Button>
            </div>
          )}

          {event.imageURL && (
            <div className="rounded-md overflow-hidden -mx-2">
              <img src={event.imageURL} alt={event.title} className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-text-primary">
              <Calendar size={20} aria-hidden="true" />
              <span>{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-3 text-text-primary">
              <Clock size={20} aria-hidden="true" />
              <span>{formatTime(event.time)}{event.endTime && ` - ${formatTime(event.endTime)}`}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-text-primary">
                <MapPin size={20} aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}

            {event.gatheringName && (
              <div className="flex items-center gap-3 text-text-primary">
                <Users size={20} aria-hidden="true" />
                <span>{event.gatheringName}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="text-text-primary leading-relaxed pt-2 border-t border-cream-dark">
              <p>{event.description}</p>
            </div>
          )}

          {/* RSVP Status with Attendee List */}
          <div className="pt-4 border-t border-cream-dark">
            <div className="flex items-center gap-3 mb-3">
              <button
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
                onClick={() => setShowAttendees(!showAttendees)}
                aria-expanded={showAttendees}
              >
                <Badge variant="success">{goingCount} going</Badge>
                {totalGuests > 0 && <span className="text-sm text-text-light">+{totalGuests} guests</span>}
              </button>
              {maybeCount > 0 && (
                <span>
                  <Badge variant="warning">{maybeCount} maybe</Badge>
                </span>
              )}
            </div>

            {/* Attendee List */}
            {showAttendees && goingRsvps.length > 0 && (
              <div className="bg-cream rounded-md p-3 mb-3">
                <h4 className="text-sm font-semibold text-text-light mb-2">Who's going</h4>
                <ul className="space-y-2 list-none p-0 m-0">
                  {goingRsvps.map(rsvp => (
                    <li key={rsvp.userId} className="flex items-center gap-2 text-sm">
                      <Avatar size="sm" name={rsvp.userId} />
                      <span className="font-medium text-text-primary">
                        {rsvp.userId === user?.id ? 'You' : rsvp.userId}
                        {rsvp.guestCount ? ` (+${rsvp.guestCount})` : ''}
                      </span>
                      {rsvp.notes && (
                        <span className="text-text-light ml-auto text-xs italic">{rsvp.notes}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Current User RSVP */}
          {userRsvp ? (
            <div className="bg-cream rounded-md p-3">
              <p>
                Your RSVP:{' '}
                <Badge variant={userRsvp.status === 'yes' ? 'success' : userRsvp.status === 'maybe' ? 'warning' : 'default'}>
                  {userRsvp.status === 'yes' ? 'Going' : userRsvp.status === 'maybe' ? 'Maybe' : 'Not going'}
                </Badge>
                {userRsvp.guestCount ? ` with ${userRsvp.guestCount} guest${userRsvp.guestCount > 1 ? 's' : ''}` : ''}
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowRsvpForm(true)}>
                  Change RSVP
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancelRsvp} loading={isRsvping}>
                  Cancel RSVP
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
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
            <div className="space-y-3 bg-cream rounded-md p-3">
              <div className="mb-4">
                <label className="block font-medium mb-2" htmlFor="rsvp-guests">
                  Bringing guests?
                </label>
                <select
                  id="rsvp-guests"
                  className="w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest"
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
              <div className="mb-4">
                <label className="block font-medium mb-2" htmlFor="rsvp-notes">
                  Notes (dietary requirements, etc.)
                </label>
                <textarea
                  id="rsvp-notes"
                  className="w-full px-4 py-3 rounded-sm border border-gray-200 text-base resize-y focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  value={rsvpNotes}
                  onChange={(e) => setRsvpNotes(e.target.value)}
                  placeholder="Any notes or dietary requirements?"
                  rows={2}
                />
              </div>
              <div className="flex flex-wrap gap-2">
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
