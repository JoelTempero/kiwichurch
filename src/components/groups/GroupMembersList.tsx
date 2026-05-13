import { useMemo, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useGatheringMemberProfiles, useRemoveGatheringMember } from '@/hooks/useGatherings'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Spinner } from '@/components/common/Spinner'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useToast } from '@/components/common/Toast'
import { AddMembersModal } from './AddMembersModal'

interface GroupMembersListProps {
  gatheringId: string
  gatheringName: string
  hostId?: string
  currentUserId?: string
  canManage: boolean
}

export function GroupMembersList({
  gatheringId,
  gatheringName,
  hostId,
  currentUserId,
  canManage,
}: GroupMembersListProps) {
  const { showToast } = useToast()
  const { data: profiles = [], isLoading } = useGatheringMemberProfiles(gatheringId)
  const removeMember = useRemoveGatheringMember()

  const [showAddModal, setShowAddModal] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      // Host first
      if (a.id === hostId && b.id !== hostId) return -1
      if (b.id === hostId && a.id !== hostId) return 1
      return a.displayName.localeCompare(b.displayName)
    })
  }, [profiles, hostId])

  const existingMemberIds = useMemo(() => profiles.map(p => p.id), [profiles])

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return
    try {
      await removeMember.mutateAsync({ gatheringId, userId: memberToRemove.id })
      showToast(`Removed ${memberToRemove.name} from group`, 'success')
      setMemberToRemove(null)
    } catch (err) {
      console.error('[GroupMembersList] removeMember failed', err)
      showToast('Could not remove member', 'error')
    }
  }

  if (isLoading) {
    return <div className="py-8 flex justify-center"><Spinner /></div>
  }

  return (
    <div>
      {canManage && (
        <div className="mb-3 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            Add members
          </Button>
        </div>
      )}

      {sortedProfiles.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-light">
          No members yet.
        </p>
      ) : (
        <ul className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {sortedProfiles.map((profile) => {
            const isHost = profile.id === hostId
            const isCurrentUser = profile.id === currentUserId
            const showRemove = canManage && !isCurrentUser
            return (
              <li
                key={profile.id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <Avatar src={profile.photoURL} name={profile.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary m-0 truncate">
                    {profile.displayName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-normal text-text-light">(you)</span>
                    )}
                  </p>
                </div>
                {isHost && (
                  <span className="text-xs uppercase tracking-wider font-medium text-terracotta">
                    Host
                  </span>
                )}
                {showRemove && (
                  <button
                    type="button"
                    onClick={() => setMemberToRemove({ id: profile.id, name: profile.displayName })}
                    className="p-1.5 text-text-light hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    aria-label={`Remove ${profile.displayName}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <AddMembersModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        gatheringId={gatheringId}
        gatheringName={gatheringName}
        existingMemberIds={existingMemberIds}
      />

      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove member"
        message={memberToRemove ? `Remove ${memberToRemove.name} from ${gatheringName}?` : ''}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removeMember.isPending}
      />
    </div>
  )
}
