import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, ConfirmModal, Modal } from '@/components/common'
import { useCreateGathering, useUpdateGathering, useDeleteGathering } from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { groupSchema } from '@/utils/schemas'
import { cn } from '@/utils/cn'
import type { Gathering } from '@/types'

interface GroupFormProps {
  group?: Gathering | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const COLOR_OPTIONS = [
  { value: '#2d5a4a', label: 'Forest' },
  { value: '#4a6741', label: 'Green' },
  { value: '#8b6914', label: 'Gold' },
  { value: '#6b4423', label: 'Brown' },
  { value: '#4a5568', label: 'Gray' },
  { value: '#553c9a', label: 'Purple' },
  { value: '#2b6cb0', label: 'Blue' },
  { value: '#c53030', label: 'Red' },
]

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function GroupForm({ group, isOpen, onClose, onSuccess }: GroupFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const createGroup = useCreateGathering()
  const updateGroup = useUpdateGathering()
  const deleteGroup = useDeleteGathering()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditMode = !!group

  const form = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '', description: '', rhythm: '', location: '',
      isPublic: true, featured: false, color: '#2d5a4a',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (group) {
        form.reset({
          name: group.name || '', description: group.description || '',
          rhythm: group.rhythm || '', location: group.location || '',
          isPublic: group.isPublic ?? true, featured: group.featured ?? false,
          color: group.color || '#2d5a4a',
        })
      } else {
        form.reset()
      }
    }
  }, [group, isOpen, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!user) return

    try {
      const groupData = {
        name: data.name.trim(),
        description: (data.description || '').trim(),
        rhythm: (data.rhythm || '').trim(),
        location: (data.location || '').trim(),
        isPublic: data.isPublic,
        featured: data.featured,
        color: data.color,
        hostId: group?.hostId || user.id,
        hostName: group?.hostName || user.displayName,
      }

      if (isEditMode && group) {
        await updateGroup.mutateAsync({ gatheringId: group.id, updates: groupData })
        showToast('Group updated', 'success')
      } else {
        await createGroup.mutateAsync(groupData)
        showToast('Group created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} group`, 'error')
    }
  })

  const handleDelete = async () => {
    if (!group) return

    setIsDeleting(true)
    try {
      await deleteGroup.mutateAsync(group.id)
      showToast('Group deleted', 'success')
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch {
      showToast('Failed to delete group', 'error')
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
  const selectedColor = form.watch('color')

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Edit Group' : 'Create Group'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2" htmlFor="group-name">
              Group Name <span className="text-red-600">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              className={cn(inputBase, errors.name && inputError)}
              placeholder="e.g., Young Adults, Bible Study"
              {...form.register('name')}
            />
            {errors.name && (
              <span className="text-sm text-red-600 mt-1 block" role="alert">{errors.name.message}</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="group-description">Description</label>
            <textarea
              id="group-description"
              className={cn(inputBase, 'resize-y min-h-[80px]')}
              placeholder="Tell people what this group is about..."
              rows={3}
              {...form.register('description')}
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="group-rhythm">Meeting Rhythm</label>
            <input
              id="group-rhythm"
              type="text"
              className={inputBase}
              placeholder="e.g., Weekly on Thursdays, Fortnightly"
              {...form.register('rhythm')}
            />
            <span className="text-sm text-text-light mt-1 block">How often does this group meet?</span>
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="group-location">Location</label>
            <input
              id="group-location"
              type="text"
              className={inputBase}
              placeholder="e.g., Church Hall, Various Homes"
              {...form.register('location')}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Group Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                    selectedColor === value ? 'border-forest scale-110 ring-2 ring-forest/30' : 'border-transparent'
                  )}
                  style={{ backgroundColor: value }}
                  onClick={() => form.setValue('color', value, { shouldDirty: true })}
                  title={label}
                  aria-label={`Select ${label} color`}
                  aria-pressed={selectedColor === value}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...form.register('isPublic')} />
              <span>Public group</span>
            </label>
            <span className="text-sm text-text-light mt-1 block">Public groups are visible to all members</span>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...form.register('featured')} />
              <span>Feature this group</span>
            </label>
            <span className="text-sm text-text-light mt-1 block">Featured groups appear at the top of the list</span>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-cream">
            <div className="flex gap-2">
              {isEditMode && (
                <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting}>
                  Delete Group
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isEditMode ? 'Save Changes' : 'Create Group'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Group" size="sm">
        <div className="text-center">
          <p>Are you sure you want to delete "<strong>{group?.name}</strong>"?</p>
          <p className="text-red-600 text-sm mt-2">This will also delete all posts and comments in this group. This action cannot be undone.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Yes, Delete Group</Button>
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
