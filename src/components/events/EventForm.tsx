import { useState, useEffect } from 'react'
import { Button, Modal } from '@/components/common'
import { useGatherings } from '@/hooks/useGatherings'
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { Event } from '@/types'

interface EventFormProps {
  event?: Event | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  gatheringId: string
  isPublic: boolean
  imageURL: string
}

const initialFormData: FormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  location: '',
  gatheringId: '',
  isPublic: true,
  imageURL: ''
}

export function EventForm({ event, isOpen, onClose, onSuccess }: EventFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data: gatherings = [] } = useGatherings()

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const isEditMode = !!event

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        endTime: event.endTime || '',
        location: event.location || '',
        gatheringId: event.gatheringId || '',
        isPublic: event.isPublic ?? true,
        imageURL: event.imageURL || ''
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [event, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!formData.time) {
      newErrors.time = 'Start time is required'
    }
    if (formData.endTime && formData.endTime <= formData.time) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsSaving(true)
    try {
      const gathering = gatherings.find(g => g.id === formData.gatheringId)
      const eventData = {
        ...formData,
        gatheringName: gathering?.name,
        createdBy: event?.createdBy || user.id
      }

      if (isEditMode && event) {
        await updateEvent.mutateAsync({
          eventId: event.id,
          updates: eventData
        })
        showToast('Event updated', 'success')
      } else {
        await createEvent.mutateAsync(eventData)
        showToast('Event created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} event`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    setIsDeleting(true)
    try {
      await deleteEvent.mutateAsync(event.id)
      showToast('Event deleted', 'success')
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch (error) {
      showToast('Failed to delete event', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    // Check for unsaved changes
    const hasChanges = isEditMode
      ? JSON.stringify(formData) !== JSON.stringify({
          title: event?.title || '',
          description: event?.description || '',
          date: event?.date || '',
          time: event?.time || '',
          endTime: event?.endTime || '',
          location: event?.location || '',
          gatheringId: event?.gatheringId || '',
          isPublic: event?.isPublic ?? true,
          imageURL: event?.imageURL || ''
        })
      : formData.title || formData.date || formData.time

    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? 'Edit Event' : 'Create Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="event-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-title">
              Title <span className="form-required">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Event title"
              required
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span id="title-error" className="form-error" role="alert">{errors.title}</span>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-date">
                Date <span className="form-required">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                className={`form-input ${errors.date ? 'form-input-error' : ''}`}
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && (
                <span id="date-error" className="form-error" role="alert">{errors.date}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-time">
                Start Time <span className="form-required">*</span>
              </label>
              <input
                id="event-time"
                type="time"
                className={`form-input ${errors.time ? 'form-input-error' : ''}`}
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
                aria-describedby={errors.time ? 'time-error' : undefined}
              />
              {errors.time && (
                <span id="time-error" className="form-error" role="alert">{errors.time}</span>
              )}
            </div>
          </div>

          {/* End Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-end-time">
              End Time
            </label>
            <input
              id="event-end-time"
              type="time"
              className={`form-input ${errors.endTime ? 'form-input-error' : ''}`}
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              aria-describedby={errors.endTime ? 'endtime-error' : undefined}
            />
            {errors.endTime && (
              <span id="endtime-error" className="form-error" role="alert">{errors.endTime}</span>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-location">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Where is this event?"
            />
          </div>

          {/* Group */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-group">
              Group
            </label>
            <select
              id="event-group"
              className="form-select"
              value={formData.gatheringId}
              onChange={(e) => handleChange('gatheringId', e.target.value)}
            >
              <option value="">No group (church-wide event)</option>
              {gatherings.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <span className="form-hint">Assign this event to a specific group</span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-description">
              Description
            </label>
            <textarea
              id="event-description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Tell people what this event is about..."
              rows={4}
            />
          </div>

          {/* Cover Image URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-image">
              Cover Image URL
            </label>
            <input
              id="event-image"
              type="url"
              className="form-input"
              value={formData.imageURL}
              onChange={(e) => handleChange('imageURL', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <span className="form-hint">Optional: Add a cover image for this event</span>
          </div>

          {/* Public Toggle */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
              />
              <span>Public event (visible to all members)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <div className="form-actions-left">
              {isEditMode && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                >
                  Delete Event
                </Button>
              )}
            </div>
            <div className="form-actions-right">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isEditMode ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Event"
        size="sm"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete "<strong>{event?.title}</strong>"?</p>
          <p className="delete-confirm-warning">This action cannot be undone. All RSVPs will be removed.</p>
          <div className="modal-actions">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Yes, Delete Event
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
