import { useState, useEffect } from 'react'
import { Button, Modal } from '@/components/common'
import { useCreateGathering, useUpdateGathering, useDeleteGathering } from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { Gathering } from '@/types'

interface GroupFormProps {
  group?: Gathering | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  description: string
  rhythm: string
  location: string
  isPublic: boolean
  featured: boolean
  color: string
}

const COLOR_OPTIONS = [
  { value: '#2d5a4a', label: 'Forest' },
  { value: '#4a6741', label: 'Green' },
  { value: '#8b6914', label: 'Gold' },
  { value: '#6b4423', label: 'Brown' },
  { value: '#4a5568', label: 'Gray' },
  { value: '#553c9a', label: 'Purple' },
  { value: '#2b6cb0', label: 'Blue' },
  { value: '#c53030', label: 'Red' }
]

const initialFormData: FormData = {
  name: '',
  description: '',
  rhythm: '',
  location: '',
  isPublic: true,
  featured: false,
  color: '#2d5a4a'
}

export function GroupForm({ group, isOpen, onClose, onSuccess }: GroupFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const createGroup = useCreateGathering()
  const updateGroup = useUpdateGathering()
  const deleteGroup = useDeleteGathering()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const isEditMode = !!group

  // Populate form when editing
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        rhythm: group.rhythm || '',
        location: group.location || '',
        isPublic: group.isPublic ?? true,
        featured: group.featured ?? false,
        color: group.color || '#2d5a4a'
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [group, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsSaving(true)
    try {
      const groupData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rhythm: formData.rhythm.trim(),
        location: formData.location.trim(),
        isPublic: formData.isPublic,
        featured: formData.featured,
        color: formData.color,
        hostId: group?.hostId || user.id,
        hostName: group?.hostName || user.displayName
      }

      if (isEditMode && group) {
        await updateGroup.mutateAsync({
          gatheringId: group.id,
          updates: groupData
        })
        showToast('Group updated', 'success')
      } else {
        await createGroup.mutateAsync(groupData)
        showToast('Group created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} group`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!group) return

    setIsDeleting(true)
    try {
      await deleteGroup.mutateAsync(group.id)
      showToast('Group deleted', 'success')
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch (error) {
      showToast('Failed to delete group', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    const hasChanges = isEditMode
      ? JSON.stringify(formData) !== JSON.stringify({
          name: group?.name || '',
          description: group?.description || '',
          rhythm: group?.rhythm || '',
          location: group?.location || '',
          isPublic: group?.isPublic ?? true,
          featured: group?.featured ?? false,
          color: group?.color || '#2d5a4a'
        })
      : formData.name || formData.description

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
        title={isEditMode ? 'Edit Group' : 'Create Group'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="group-form">
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="group-name">
              Group Name <span className="form-required">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Young Adults, Bible Study"
              required
            />
            {errors.name && (
              <span className="form-error" role="alert">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="group-description">
              Description
            </label>
            <textarea
              id="group-description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Tell people what this group is about..."
              rows={3}
            />
          </div>

          {/* Rhythm */}
          <div className="form-group">
            <label className="form-label" htmlFor="group-rhythm">
              Meeting Rhythm
            </label>
            <input
              id="group-rhythm"
              type="text"
              className="form-input"
              value={formData.rhythm}
              onChange={(e) => handleChange('rhythm', e.target.value)}
              placeholder="e.g., Weekly on Thursdays, Fortnightly"
            />
            <span className="form-hint">How often does this group meet?</span>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="group-location">
              Location
            </label>
            <input
              id="group-location"
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Church Hall, Various Homes"
            />
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">
              Group Color
            </label>
            <div className="color-picker">
              {COLOR_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`color-option ${formData.color === value ? 'color-option-selected' : ''}`}
                  style={{ backgroundColor: value }}
                  onClick={() => handleChange('color', value)}
                  title={label}
                  aria-label={`Select ${label} color`}
                  aria-pressed={formData.color === value}
                />
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
              />
              <span>Public group</span>
            </label>
            <span className="form-hint">Public groups are visible to all members</span>
          </div>

          {/* Featured */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
              />
              <span>Feature this group</span>
            </label>
            <span className="form-hint">Featured groups appear at the top of the list</span>
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
                  Delete Group
                </Button>
              )}
            </div>
            <div className="form-actions-right">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isEditMode ? 'Save Changes' : 'Create Group'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Group"
        size="sm"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete "<strong>{group?.name}</strong>"?</p>
          <p className="delete-confirm-warning">This will also delete all posts and comments in this group. This action cannot be undone.</p>
          <div className="modal-actions">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Yes, Delete Group
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
