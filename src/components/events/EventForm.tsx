import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, ConfirmModal, Modal } from '@/components/common'
import { useGatherings } from '@/hooks/useGatherings'
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { eventSchema } from '@/utils/schemas'
import { cn } from '@/utils/cn'
import type { Event } from '@/types'

interface EventFormProps {
  event?: Event | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function EventForm({ event, isOpen, onClose, onSuccess }: EventFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data: gatherings = [] } = useGatherings()

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditMode = !!event

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', description: '', date: '', time: '', endTime: '',
      location: '', gatheringId: '', isPublic: true, imageURL: '',
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
        })
      } else {
        form.reset()
      }
    }
  }, [event, isOpen, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!user) return

    try {
      const gathering = gatherings.find(g => g.id === data.gatheringId)
      const eventData = {
        ...data,
        gatheringName: gathering?.name,
        createdBy: event?.createdBy || user.id,
      }

      if (isEditMode && event) {
        await updateEvent.mutateAsync({ eventId: event.id, updates: eventData })
        showToast('Event updated', 'success')
      } else {
        await createEvent.mutateAsync(eventData)
        showToast('Event created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} event`, 'error')
    }
  })

  const handleDelete = async () => {
    if (!event) return

    setIsDeleting(true)
    try {
      await deleteEvent.mutateAsync(event.id)
      showToast('Event deleted', 'success')
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block font-medium mb-2" htmlFor="event-group">Group</label>
            <select id="event-group" className={inputBase} {...form.register('gatheringId')}>
              <option value="">No group (church-wide event)</option>
              {gatherings.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <span className="text-sm text-text-light mt-1 block">Assign this event to a specific group</span>
          </div>

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
              <span>Public event (visible to all members)</span>
            </label>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-cream">
            <div className="flex gap-2">
              {isEditMode && (
                <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting}>
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isEditMode ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Event" size="sm">
        <div className="text-center">
          <p>Are you sure you want to delete "<strong>{event?.title}</strong>"?</p>
          <p className="text-red-600 text-sm mt-2">This action cannot be undone. All RSVPs will be removed.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Yes, Delete Event</Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
          </div>
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
