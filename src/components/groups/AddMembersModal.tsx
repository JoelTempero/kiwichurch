import { useEffect, useMemo, useState } from 'react'
import { Search, X, Check } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Spinner } from '@/components/common/Spinner'
import { useToast } from '@/components/common/Toast'
import { useBulkAddGatheringMembers } from '@/hooks/useGatherings'
import { dbService } from '@/services/firebase'
import { cn } from '@/utils/cn'
import type { UserProfile } from '@/types'

interface AddMembersModalProps {
  isOpen: boolean
  onClose: () => void
  gatheringId: string
  gatheringName: string
  existingMemberIds: string[]
}

export function AddMembersModal({
  isOpen,
  onClose,
  gatheringId,
  gatheringName,
  existingMemberIds,
}: AddMembersModalProps) {
  const { showToast } = useToast()
  const bulkAdd = useBulkAddGatheringMembers()

  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set())
      setSearch('')
      return
    }
    let cancelled = false
    setLoading(true)
    dbService.getAllPublicProfiles()
      .then((all) => {
        if (cancelled) return
        const existing = new Set(existingMemberIds)
        setProfiles(all.filter(p => !existing.has(p.id)))
      })
      .catch((err) => {
        console.error('[AddMembersModal] failed to load profiles', err)
        showToast('Could not load members list', 'error')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isOpen, existingMemberIds, showToast])

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(p => p.displayName.toLowerCase().includes(q))
  }, [profiles, search])

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    const userIds = Array.from(selectedIds)
    if (userIds.length === 0) return
    try {
      const result = await bulkAdd.mutateAsync({ gatheringId, gatheringName, userIds })
      const message = result.skipped > 0
        ? `Added ${result.added} member${result.added === 1 ? '' : 's'} (${result.skipped} already in group)`
        : `Added ${result.added} member${result.added === 1 ? '' : 's'}`
      showToast(message, 'success')
      onClose()
    } catch (err) {
      console.error('[AddMembersModal] bulkAdd failed', err)
      showToast('Could not add members', 'error')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add members to ${gatheringName}`}
      size="md"
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-light">
            {selectedIds.size === 0
              ? 'No one selected'
              : `${selectedIds.size} selected`}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={bulkAdd.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={bulkAdd.isPending}
              disabled={selectedIds.size === 0}
            >
              {selectedIds.size === 0
                ? 'Add members'
                : `Add ${selectedIds.size} member${selectedIds.size === 1 ? '' : 's'}`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-3 py-2 border border-sage-light rounded-md text-sm focus:outline-none focus:border-forest"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : filteredProfiles.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-light">
            {profiles.length === 0
              ? 'Everyone in the church is already in this group.'
              : 'No members match that search.'}
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto divide-y divide-[#ebe6dc] border border-[#e0dbd2] rounded-md bg-[#faf8f4]">
            {filteredProfiles.map((profile) => {
              const isSelected = selectedIds.has(profile.id)
              return (
                <li key={profile.id}>
                  <button
                    type="button"
                    onClick={() => toggle(profile.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-cream/50 transition-colors',
                      isSelected && 'bg-forest/5 hover:bg-forest/10'
                    )}
                  >
                    <Avatar src={profile.photoURL} name={profile.displayName} size="sm" />
                    <span className="flex-1 text-sm text-text-primary">{profile.displayName}</span>
                    <span
                      className={cn(
                        'flex items-center justify-center w-5 h-5 rounded border transition-colors',
                        isSelected
                          ? 'bg-forest border-forest text-white'
                          : 'border-sage-light bg-white'
                      )}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Modal>
  )
}
