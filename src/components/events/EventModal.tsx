import { useEffect, useMemo, useState } from 'react'
import { Edit, Calendar, Clock, MapPin, Users, CalendarPlus, Baby, Plus, X, Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Modal, Button, Badge, Avatar } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { useEventRSVPs, useUserRSVP, useRSVP, useCancelRSVP } from '@/hooks/useEvents'
import { useFamilyLinks } from '@/hooks/useFamilyLinks'
import { useToast } from '@/components/common/Toast'
import { EventForm } from './EventForm'
import { buildGoogleCalendarUrl } from '@/utils/googleCalendar'
import { dbService } from '@/services/firebase'
import type { Event, RSVPAttendee, UserProfile } from '@/types'

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
  const [selfAttending, setSelfAttending] = useState(true)
  const [dependantSelections, setDependantSelections] = useState<Record<string, boolean>>({})
  const [linkedSelections, setLinkedSelections] = useState<Record<string, boolean>>({})
  const [guestNames, setGuestNames] = useState<string[]>([])
  const [guestDraft, setGuestDraft] = useState('')
  const [showAttendees, setShowAttendees] = useState(false)

  const { data: rsvps = [] } = useEventRSVPs(event?.id || null)
  const { data: userRsvp } = useUserRSVP(event?.id || null, user?.id || null)
  const { data: familyLinks } = useFamilyLinks(user?.id || null)

  // Resolve accepted family links into UserProfiles for display in the picker.
  const linkedIds = useMemo(() => {
    const ids: string[] = []
    for (const link of familyLinks?.accepted || []) {
      const otherId = link.participants.find((p) => p !== user?.id)
      if (otherId) ids.push(otherId)
    }
    return ids
  }, [familyLinks?.accepted, user?.id])

  const { data: linkedProfiles = [] } = useQuery<UserProfile[]>({
    queryKey: ['rsvpLinkedProfiles', user?.id, linkedIds.join(',')],
    enabled: linkedIds.length > 0 && isOpen,
    queryFn: async () => {
      const results = await Promise.all(linkedIds.map((id) => dbService.getPublicProfile(id)))
      return results.filter((p): p is UserProfile => !!p)
    },
  })

  const rsvpMutation = useRSVP()
  const cancelRsvpMutation = useCancelRSVP()

  // Hydrate the family-RSVP form from existing RSVP when modal opens
  useEffect(() => {
    if (!isOpen) return
    const depSel: Record<string, boolean> = {}
    const linkSel: Record<string, boolean> = {}
    const guests: string[] = []
    const dependants = user?.dependants || []
    if (userRsvp?.attendees && userRsvp.attendees.length > 0) {
      for (const a of userRsvp.attendees) {
        if (a.dependantId && dependants.find((d) => d.id === a.dependantId)) {
          depSel[a.dependantId] = true
        } else if (a.linkedUserId) {
          linkSel[a.linkedUserId] = true
        } else {
          guests.push(a.name)
        }
      }
    }
    setDependantSelections(depSel)
    setLinkedSelections(linkSel)
    setGuestNames(guests)
    setGuestDraft('')
    setSelfAttending(userRsvp ? userRsvp.selfAttending !== false : true)
    setRsvpNotes(userRsvp?.notes || '')
  }, [isOpen, userRsvp, user?.dependants])

  if (!event) return null

  const canEdit = isAdminOrHost || event.createdBy === user?.id
  const dependants = user?.dependants || []

  const buildAttendees = (): RSVPAttendee[] => {
    const fromLinked: RSVPAttendee[] = linkedProfiles
      .filter((p) => linkedSelections[p.id])
      .map((p) => ({ name: p.displayName, linkedUserId: p.id }))
    const fromDeps: RSVPAttendee[] = dependants
      .filter((d) => dependantSelections[d.id])
      .map((d) => ({ name: d.name, isChild: !!d.isChild, dependantId: d.id }))
    const fromGuests: RSVPAttendee[] = guestNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => ({ name }))
    return [...fromLinked, ...fromDeps, ...fromGuests]
  }

  const toggleDependant = (id: string) => {
    setDependantSelections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleLinked = (id: string) => {
    setLinkedSelections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // If the current user appears in someone else's RSVP attendees, surface
  // that as "Already brought by X" so they know they're already accounted
  // for. They can still RSVP themselves to override.
  const broughtBy = useMemo(() => {
    if (!user?.id) return null
    for (const r of rsvps) {
      if (r.userId === user.id) continue
      const match = r.attendees?.some((a) => a.linkedUserId === user.id)
      if (match) return { userId: r.userId, name: r.userName || 'A family member' }
    }
    return null
  }, [rsvps, user?.id])

  const addGuest = () => {
    const name = guestDraft.trim()
    if (!name) return
    setGuestNames((prev) => [...prev, name])
    setGuestDraft('')
  }

  const removeGuest = (idx: number) => {
    setGuestNames((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!user?.id) return

    const attendees = status === 'yes' ? buildAttendees() : []
    const effectiveSelf = status === 'yes' ? selfAttending : false

    setIsRsvping(true)
    try {
      await rsvpMutation.mutateAsync({
        eventId: event.id,
        userId: user.id,
        status,
        notes: rsvpNotes,
        attendees,
        guestCount: attendees.length,
        selfAttending: effectiveSelf,
        userName: user.displayName || '',
        userPhotoURL: user.photoURL || '',
      })
      showToast(
        status === 'yes' ? "You're going!" : status === 'maybe' ? 'Marked as maybe' : 'RSVP updated',
        'success'
      )
      setShowRsvpForm(false)
    } catch {
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
  // Each RSVP = the user themselves (if selfAttending !== false) + their attendees
  const headcountForRsvp = (r: typeof rsvps[number]) => {
    const self = r.selfAttending !== false ? 1 : 0
    const extras = r.attendees?.length ?? r.guestCount ?? 0
    return self + extras
  }
  const goingHeadcount = goingRsvps.reduce((sum, r) => sum + headcountForRsvp(r), 0)
  const maybeCount = maybeRsvps.length
  const extraGuests = goingRsvps.reduce((sum, r) => sum + (r.attendees?.length ?? r.guestCount ?? 0), 0)

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

          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-forest hover:text-forest-light transition-colors"
          >
            <CalendarPlus size={16} aria-hidden="true" />
            Add to Google Calendar
          </a>

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
                <Badge variant="success">{goingHeadcount} going</Badge>
                {extraGuests > 0 && <span className="text-sm text-text-light">incl. {extraGuests} family/guests</span>}
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
                  {goingRsvps.map(rsvp => {
                    const isSelf = rsvp.userId === user?.id
                    // Prefer denormalised userName, fall back to a friendly label if missing.
                    const displayName = rsvp.userName || (isSelf ? user?.displayName : '') || 'Member'
                    const selfLabel = isSelf ? 'You' : displayName
                    return (
                      <li key={rsvp.userId} className="flex items-start gap-2 text-sm">
                        <Avatar size="sm" src={rsvp.userPhotoURL} name={displayName} />
                        <div className="flex-1 min-w-0">
                          {rsvp.selfAttending !== false && (
                            <p className="font-medium text-text-primary m-0">{selfLabel}</p>
                          )}
                          {rsvp.attendees && rsvp.attendees.length > 0 && (
                            <p className="text-xs text-text-light m-0">
                              {rsvp.selfAttending !== false ? 'With ' : ''}
                              {rsvp.attendees.map((a, i) => (
                                <span key={i}>
                                  {a.name}{a.isChild ? ' (child)' : ''}
                                  {i < rsvp.attendees!.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </p>
                          )}
                          {rsvp.selfAttending === false && (!rsvp.attendees || rsvp.attendees.length === 0) && (
                            <p className="text-xs text-text-light italic m-0">RSVP cancelled</p>
                          )}
                        </div>
                        {rsvp.notes && (
                          <span className="text-text-light text-xs italic">{rsvp.notes}</span>
                        )}
                      </li>
                    )
                  })}
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
                {userRsvp.status === 'yes' && userRsvp.attendees && userRsvp.attendees.length > 0 && (
                  <span className="text-text-light"> with {userRsvp.attendees.map((a) => a.name).join(', ')}</span>
                )}
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
            <div className="space-y-2">
              {broughtBy && (
                <div className="flex items-start gap-2 p-3 bg-cream rounded-md text-sm">
                  <Heart size={16} className="text-terracotta mt-0.5 shrink-0" />
                  <span className="text-text-primary">
                    Already going — <strong>{broughtBy.name}</strong> has RSVP'd you to this event. You can still RSVP yourself below to override.
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {/* Members with saved family or linked accounts skip the
                    one-tap yes — the picker handles their flow. */}
                {(dependants.length > 0 || linkedProfiles.length > 0) ? (
                  <Button variant="primary" onClick={() => setShowRsvpForm(true)}>
                    I'm going
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => handleRsvp('yes')} loading={isRsvping}>
                    I'm going
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleRsvp('maybe')} loading={isRsvping}>
                  Maybe
                </Button>
                {dependants.length === 0 && linkedProfiles.length === 0 && (
                  <Button variant="ghost" onClick={() => setShowRsvpForm(true)}>
                    More options
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Family-aware RSVP form */}
          {showRsvpForm && (
            <div className="space-y-4 bg-cream rounded-md p-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Who’s coming?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-cream-dark/40">
                    <input
                      type="checkbox"
                      className="w-[18px] h-[18px] accent-forest"
                      checked={selfAttending}
                      onChange={(e) => setSelfAttending(e.target.checked)}
                    />
                    <span className="font-medium text-text-primary">
                      Me{user?.displayName ? ` (${user.displayName})` : ''}
                    </span>
                  </label>

                  {linkedProfiles.length > 0 && linkedProfiles.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-cream-dark/40">
                      <input
                        type="checkbox"
                        className="w-[18px] h-[18px] accent-forest"
                        checked={!!linkedSelections[p.id]}
                        onChange={() => toggleLinked(p.id)}
                      />
                      <span className="flex items-center gap-2 text-text-primary">
                        <Avatar src={p.photoURL} name={p.displayName} size="sm" />
                        {p.displayName}
                        <Heart size={11} className="text-terracotta" aria-label="Linked family" />
                      </span>
                    </label>
                  ))}
                  {dependants.length > 0 && dependants.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-cream-dark/40">
                      <input
                        type="checkbox"
                        className="w-[18px] h-[18px] accent-forest"
                        checked={!!dependantSelections[d.id]}
                        onChange={() => toggleDependant(d.id)}
                      />
                      <span className="flex items-center gap-1.5 text-text-primary">
                        {d.isChild && <Baby size={14} className="text-text-light" />}
                        {d.name}
                        {d.relationship && (
                          <span className="text-xs text-text-light">— {d.relationship}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {dependants.length === 0 && linkedProfiles.length === 0 && (
                  <p className="text-xs text-text-light mt-2 m-0">
                    Want to bring family next time? Link a partner account or add family members on your Profile page.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Other guests</p>
                {guestNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {guestNames.map((name, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest/10 text-forest text-sm border border-forest/20">
                        {name}
                        <button
                          type="button"
                          onClick={() => removeGuest(i)}
                          className="p-0.5 rounded-full hover:bg-forest/20"
                          aria-label={`Remove ${name}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guestDraft}
                    onChange={(e) => setGuestDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addGuest()
                      }
                    }}
                    placeholder="Add another name (e.g. Aunty Jo)"
                    className="flex-1 px-3 py-2 rounded-md border border-sage-light text-sm focus:outline-none focus:border-forest"
                  />
                  <button
                    type="button"
                    onClick={addGuest}
                    disabled={!guestDraft.trim()}
                    className="px-3 py-2 rounded-md bg-forest text-cream text-sm font-medium hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2 text-sm" htmlFor="rsvp-notes">
                  Notes (dietary, accessibility, etc.)
                </label>
                <textarea
                  id="rsvp-notes"
                  className="w-full px-3 py-2 rounded-md border border-sage-light text-sm resize-y focus:outline-none focus:border-forest"
                  value={rsvpNotes}
                  onChange={(e) => setRsvpNotes(e.target.value)}
                  placeholder="Anything the host should know?"
                  rows={2}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-dark">
                <Button variant="primary" onClick={() => handleRsvp('yes')} loading={isRsvping}>
                  {(() => {
                    const count =
                      (selfAttending ? 1 : 0) +
                      Object.values(linkedSelections).filter(Boolean).length +
                      Object.values(dependantSelections).filter(Boolean).length +
                      guestNames.length
                    return count > 0 ? `Going (${count})` : 'Going'
                  })()}
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
