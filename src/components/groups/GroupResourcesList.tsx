import { useState, useMemo } from 'react'
import { Search, Upload, Link2, FolderOpen } from 'lucide-react'
import { useGroupResources, useGroupResourcesSubscription, useAddGroupResource, useUpdateGroupResource, useDeleteGroupResource } from '../../hooks/useGroupResources'
import { useAuthStore } from '../../store/authStore'
import { Modal } from '../common/Modal'
import { ConfirmModal } from '../common/ConfirmModal'
import { useToast } from '../common/Toast'
import GroupResourceItem from './GroupResourceItem'
import ResourceUploadModal from './ResourceUploadModal'
import ResourceLinkModal from './ResourceLinkModal'
import type { GroupResource } from '../../types/groupResource'

interface GroupResourcesListProps {
  gatheringId: string
  isAdminOrHost: boolean
}

export default function GroupResourcesList({ gatheringId, isAdminOrHost }: GroupResourcesListProps) {
  const { user } = useAuthStore()
  const { data: resources = [], isLoading } = useGroupResources(gatheringId)
  useGroupResourcesSubscription(gatheringId)
  const addResource = useAddGroupResource()
  const updateResource = useUpdateGroupResource()
  const deleteResource = useDeleteGroupResource()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GroupResource | null>(null)
  const [editTarget, setEditTarget] = useState<GroupResource | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState('')

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    resources.forEach((r) => r.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [resources])

  // Filter by search + tag
  const filtered = useMemo(() => {
    let result = resources
    if (selectedTag) {
      result = result.filter((r) => r.tags.includes(selectedTag))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.fileName?.toLowerCase().includes(q)
      )
    }
    return result
  }, [resources, selectedTag, searchQuery])

  const handleUpload = async (data: { title: string; description: string; tags: string[]; file: File }) => {
    if (!user) return
    try {
      await addResource.mutateAsync({
        gatheringId,
        data: {
          gatheringId,
          type: 'file',
          title: data.title,
          description: data.description || undefined,
          tags: data.tags,
          uploadedBy: user.id,
          uploadedByName: user.displayName || 'Unknown',
        },
        file: data.file,
      })
      showToast('File uploaded', 'success')
    } catch (e) {
      showToast('Failed to upload file', 'error')
      console.error(e)
    }
  }

  const handleAddLink = async (data: { title: string; description: string; tags: string[]; url: string }) => {
    if (!user) return
    try {
      await addResource.mutateAsync({
        gatheringId,
        data: {
          gatheringId,
          type: 'link',
          title: data.title,
          description: data.description || undefined,
          tags: data.tags,
          uploadedBy: user.id,
          uploadedByName: user.displayName || 'Unknown',
          url: data.url,
        },
      })
      showToast('Link added', 'success')
    } catch (e) {
      showToast('Failed to add link', 'error')
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteResource.mutateAsync({
        gatheringId,
        resourceId: deleteTarget.id,
        storagePath: deleteTarget.storagePath,
      })
      showToast('Resource deleted', 'success')
    } catch (e) {
      showToast('Failed to delete resource', 'error')
      console.error(e)
    }
    setDeleteTarget(null)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-stone-500">Loading files...</div>
  }

  return (
    <div>
      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#1a3a2f] px-3 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90"
        >
          <Upload className="h-4 w-4" /> Upload
        </button>
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          <Link2 className="h-4 w-4" /> Add Link
        </button>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTag === null ? 'bg-[#1a3a2f] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTag === tag ? 'bg-[#1a3a2f] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Resource list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-stone-400">
          <FolderOpen className="h-10 w-10" />
          <p className="text-sm">{resources.length === 0 ? 'No files shared yet' : 'No files match your search'}</p>
        </div>
      ) : (
        <div>
          {filtered.map((resource) => (
            <GroupResourceItem
              key={resource.id}
              resource={resource}
              canEdit={user?.id === resource.uploadedBy || isAdminOrHost}
              canDelete={user?.id === resource.uploadedBy || isAdminOrHost}
              onEdit={() => {
                setEditTarget(resource)
                setEditTitle(resource.title)
                setEditDescription(resource.description || '')
                setEditTags(resource.tags.join(', '))
              }}
              onDelete={() => setDeleteTarget(resource)}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <ResourceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUpload}
        isLoading={addResource.isPending}
      />

      {/* Link modal */}
      <ResourceLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleAddLink}
        isLoading={addResource.isPending}
      />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Resource">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!editTarget) return
            try {
              await updateResource.mutateAsync({
                gatheringId,
                resourceId: editTarget.id,
                updates: {
                  title: editTitle.trim(),
                  description: editDescription.trim() || undefined,
                  tags: editTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
                },
              })
              showToast('Resource updated', 'success')
              setEditTarget(null)
            } catch {
              showToast('Failed to update resource', 'error')
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateResource.isPending}
              className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50"
            >
              {updateResource.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
