import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Button, ConfirmModal, Modal } from '@/components/common'
import { useGatherings } from '@/hooks/useGatherings'
import { useCreateEvent, useUpdateEvent, useDeleteEvent, eventKeys } from '@/hooks/useEvents'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { eventSchema } from '@/utils/schemas'
import { cn } from '@/utils/cn'
import { dbService } from '@/services/firebase'
import {
  generateRecurrenceDates,
  makeSeriesId,
  RECURRENCE_OPTIONS,
} from '@/utils/recurrence'
import type { Event, EventRecurrence } from '@/types'

interface EventFormProps {
  event?: Event | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function EventForm({ event, isOpen, onClose, onSuccess }: EventFormProps) {
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const { data: allGatherings = [] } = useGatherings()
  const queryClient = useQueryClient()

  // Hosts can only create events for groups admin has assigned to them.
  // Admin sees every group plus the "Whole church" option.
  const gatherings = useMemo(() => {
    if (isAdmin) return allGatherings
    const allowed = new Set(user?.hostedGatherings || [])
    return allGatherings.filter((g) => allowed.has(g.id))
  }, [isAdmin, allGatherings, user?.hostedGatherings])

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // For series-aware edits/deletes
  const [seriesScope, setSeriesScope] = useState<'one' | 'following'>('one')
  const [isSavingSeries, setIsSavingSeries] = useState(false)

  const isEditMode = !!event
  const isSeries = !!event?.seriesId

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', description: '', date: '', time: '', endTime: '',
      location: '', gatheringId: '', isPublic: true, imageURL: '',
      recurrence: 'none' as EventRecurrence, recurrenceCount: 1,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (event) {
        form.reset({
          title: event.title || '', description: event.description || '',
          date: event.date || '', time: event.time || '', endTime: event.endTime || '',
          location: event.location || '', gatheringId: event.gatheringId || '',
          isPublic: event.isPublic ?? true, imageURL: event.imageURL || '',
          // Editing a series: recurrence shown as info, but locking it from being changed mid-stream.
          recurrence: (event.recurrence as EventRecurrence) || 'none',
          recurrenceCount: event.recurrenceCount || 1,
        })
        setSeriesScope('one')
      } else {
        form.reset()
      }
    }
  }, [event, isOpen, form])

  const recurrence = form.watch('recurrence') as EventRecurrence
  const recurrenceCount = Number(form.watch('recurrenceCount') ?? 1) || 1

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!user) return

    // Hosts must pick a group — church-wide events are admin-only and
    // the Firestore rule will reject a host's empty-gatheringId create.
    if (!isAdmin && !data.gatheringId) {
      showToast('Pick a group for this event', 'error')
      return
    }

    const gathering = gatherings.find((g) => g.id === data.gatheringId)
    // Member-read gate, not the website flag: no group, or a public group,
    // is open to all members; a private group's event is closed by default.
    const openToAllMembers = !data.gatheringId || gathering?.isPublic === true
    const sharedData = {
      title: data.title,
      description: data.description,
      time: data.time,
      endTime: data.endTime,
      location: data.location,
      gatheringId: data.gatheringId,
      gatheringName: gathering?.name,
      // Invariant: a private group's event can never carry the website flag.
      isPublic: data.isPublic && openToAllMembers,
      openToAllMembers,
      imageURL: data.imageURL,
      createdBy: event?.createdBy || user.id,
    }

    try {
      if (isEditMode && event) {
        const updates = {
          ...sharedData,
          date: data.date,
          recurrence: event.recurrence,
          recurrenceCount: event.recurrenceCount,
          seriesId: event.seriesId,
        }
        if (isSeries && seriesScope === 'following' && event.seriesId) {
          setIsSavingSeries(true)
          const n = await dbService.updateEventSeries(event.seriesId, event.date, sharedData)
          queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
          showToast(`Updated ${n} events in the series`, 'success')
          setIsSavingSeries(false)
        } else {
          await updateEvent.mutateAsync({ eventId: event.id, updates })
          showToast('Event updated', 'success')
        }
      } else {
        if (data.recurrence !== 'none' && data.recurrenceCount > 1) {
          const seriesId = makeSeriesId()
          const dates = generateRecurrenceDates(data.date, data.recurrence, data.recurrenceCount)
          await dbService.createEventSeries(
            {
              ...sharedData,
              recurrence: data.recurrence,
              recurrenceCount: data.recurrenceCount,
              seriesId,
            },
            dates,
          )
          queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
          showToast(`Created ${dates.length} events`, 'success')
        } else {
          await createEvent.mutateAsync({
            ...sharedData,
            date: data.date,
            recurrence: 'none',
            recurrenceCount: 1,
          })
          showToast('Event created', 'success')
        }
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} event`, 'error')
    } finally {
      setIsSavingSeries(false)
    }
  })

  const handleDelete = async (scope: 'one' | 'following' | 'all') => {
    if (!event) return
    setIsDeleting(true)
    try {
      if (scope === 'one' || !event.seriesId) {
        await deleteEvent.mutateAsync(event.id)
        showToast('Event deleted', 'success')
      } else if (scope === 'following') {
        const n = await dbService.deleteEventSeries(event.seriesId, event.date)
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
        showToast(`Deleted ${n} events in the series`, 'success')
      } else {
        const n = await dbService.deleteEventSeries(event.seriesId)
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
        showToast(`Deleted entire series (${n} events)`, 'success')
      }
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch {
      showToast('Failed to delete event', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  const { errors, isSubmitting } = form.formState
  const showSeriesPicker = isSeries

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Series indicator on edit */}
          {showSeriesPicker && event && (
            <div className="bg-cream rounded-md p-3 text-sm">
              <p className="m-0 mb-2 text-text-primary">
                Part of a <strong>{event.recurrence}</strong> series
                {event.recurrenceIndex !== undefined && event.recurrenceCount
                  ? ` (event ${event.recurrenceIndex + 1} of ${event.recurrenceCount})`
                  : ''}
              </p>
              <fieldset className="space-y-1">
                <legend className="sr-only">Edit scope</legend>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={seriesScope === 'one'}
                    onChange={() => setSeriesScope('one')}
                    name="series-scope"
                  />
                  Just this event
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={seriesScope === 'following'}
                    onChange={() => setSeriesScope('following')}
                    name="series-scope"
                  />
                  This and all following events
                </label>
              </fieldset>
            </div>
          )}

          <div>
            <label className="block font-medium mb-2" htmlFor="event-title">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className={cn(inputBase, errors.title && inputError)}
              placeholder="Event title"
              aria-describedby={errors.title ? 'title-error' : undefined}
              {...form.register('title')}
            />
            {errors.title && (
              <span id="title-error" className="text-sm text-red-600 mt-1 block" role="alert">{errors.title.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2" htmlFor="event-date">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                className={cn(inputBase, errors.date && inputError)}
                aria-describedby={errors.date ? 'date-error' : undefined}
                {...form.register('date')}
              />
              {errors.date && (
                <span id="date-error" className="text-sm text-red-600 mt-1 block" role="alert">{errors.date.message}</span>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2" htmlFor="event-time">
                Start Time <span className="text-red-600">*</span>
              </label>
              <input
                id="event-time"
                type="time"
                className={cn(inputBase, errors.time && inputError)}
                aria-describedby={errors.time ? 'time-error' : undefined}
                {...form.register('time')}
              />
              {errors.time && (
                <span id="time-error" className="text-sm text-red-600 mt-1 block" role="alert">{errors.time.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="event-end-time">End Time</label>
            <input
              id="event-end-time"
              type="time"
              className={cn(inputBase, errors.endTime && inputError)}
              aria-describedby={errors.endTime ? 'endtime-error' : undefined}
              {...form.register('endTime')}
            />
            {errors.endTime && (
              <span id="endtime-error" className="text-sm text-red-600 mt-1 block" role="alert">{errors.endTime.message}</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="event-location">Location</label>
            <input
              id="event-location"
              type="text"
              className={inputBase}
              placeholder="Where is this event?"
              {...form.register('location')}
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="event-group">
              Group {!isAdmin && <span className="text-red-600">*</span>}
            </label>
            <select id="event-group" className={inputBase} {...form.register('gatheringId')}>
              {isAdmin && <option value="">No group (church-wide event)</option>}
              {!isAdmin && gatherings.length === 0 && (
                <option value="" disabled>You haven’t been assigned any groups yet</option>
              )}
              {!isAdmin && gatherings.length > 0 && (
                <option value="" disabled>Choose a group…</option>
              )}
              {gatherings.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <span className="text-sm text-text-light mt-1 block">
              {isAdmin
                ? 'Assign this event to a specific group, or leave blank for the whole church.'
                : 'You can only create events for groups assigned to you. Ask an admin to add more.'}
            </span>
          </div>

          {/* Repeats — create-only. Editing the recurrence rule on a series is intentionally
              out of scope; admins can delete the series and recreate it. */}
          {!isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" htmlFor="event-recurrence">Repeats</label>
                <select id="event-recurrence" className={inputBase} {...form.register('recurrence')}>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2" htmlFor="event-recurrence-count">Occurrences</label>
                <input
                  id="event-recurrence-count"
                  type="number"
                  min={1}
                  max={26}
                  disabled={recurrence === 'none'}
                  className={cn(inputBase, recurrence === 'none' && 'opacity-50 cursor-not-allowed')}
                  {...form.register('recurrenceCount', { valueAsNumber: true })}
                />
                <span className="text-xs text-text-light mt-1 block">
                  {recurrence === 'none'
                    ? 'Pick a frequency to repeat'
                    : `Creates ${recurrenceCount || 1} events sharing one series`}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium mb-2" htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              className={cn(inputBase, 'resize-y min-h-[100px]')}
              placeholder="Tell people what this event is about..."
              rows={4}
              {...form.register('description')}
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="event-image">Cover Image URL</label>
            <input
              id="event-image"
              type="url"
              className={inputBase}
              placeholder="https://example.com/image.jpg"
              {...form.register('imageURL')}
            />
            <span className="text-sm text-text-light mt-1 block">Optional: Add a cover image for this event</span>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...form.register('isPublic')} />
              <span>Show on public website</span>
            </label>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-cream">
            <div className="flex gap-2">
              {isEditMode && (
                <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting || isSavingSeries}>
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting || isSavingSeries}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting || isSavingSeries}>
                {isEditMode
                  ? (isSeries && seriesScope === 'following' ? 'Save series' : 'Save Changes')
                  : (recurrence !== 'none' && recurrenceCount > 1
                      ? `Create ${recurrenceCount} events`
                      : 'Create Event')}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Event" size="sm">
        <div>
          <p>Are you sure you want to delete "<strong>{event?.title}</strong>"?</p>
          <p className="text-red-600 text-sm mt-2">This action cannot be undone. All RSVPs will be removed.</p>

          {isSeries ? (
            <div className="space-y-2 mt-4">
              <Button variant="danger" onClick={() => handleDelete('one')} loading={isDeleting} className="w-full">
                Delete just this event
              </Button>
              <Button variant="danger" onClick={() => handleDelete('following')} loading={isDeleting} className="w-full">
                Delete this and following events
              </Button>
              <Button variant="outline" onClick={() => handleDelete('all')} loading={isDeleting} className="w-full">
                Delete entire series
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="w-full">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="danger" onClick={() => handleDelete('one')} loading={isDeleting}>Yes, Delete Event</Button>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => { setShowDiscardConfirm(false); onClose() }}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to close?"
        confirmLabel="Discard"
        confirmVariant="danger"
      />
    </>
  )
}
