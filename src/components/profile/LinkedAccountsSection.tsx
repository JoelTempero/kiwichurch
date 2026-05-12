import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Check, X, UserPlus, Users, Search } from 'lucide-react'
import { Avatar, Button, ConfirmModal, Modal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import {
  useFamilyLinks,
  useSendFamilyLink,
  useAcceptFamilyLink,
  useDeleteFamilyLink,
} from '@/hooks/useFamilyLinks'
import type { FamilyLink, UserProfile } from '@/types'

// Linked family accounts — Facebook-style invite/accept. Sits above the
// non-account dependants in the profile. Linked accounts can RSVP on
// each other's behalf; they don't share dependants (kids are still
// per-account).
export function LinkedAccountsSection() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const { data: links } = useFamilyLinks(user?.id || null)
  const sendLink = useSendFamilyLink()
  const acceptLink = useAcceptFamilyLink(user?.id || null)
  const deleteLink = useDeleteFamilyLink(user?.id || null)

  const accepted = links?.accepted || []
  const incoming = links?.incoming || []
  const outgoing = links?.outgoing || []

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<FamilyLink | null>(null)

  // Member picker — uses the public profiles mirror (already privacy-safe).
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['directoryProfiles'],
    queryFn: () => dbService.getAllPublicProfiles(),
    enabled: isInviteOpen && !!user,
  })

  // Exclude self + anyone already linked / pending / invited
  const excludedIds = useMemo(() => {
    const s = new Set<string>([user?.id || ''])
    for (const l of [...accepted, ...incoming, ...outgoing]) {
      const other = l.participants.find((p) => p !== user?.id)
      if (other) s.add(other)
    }
    return s
  }, [user?.id, accepted, incoming, outgoing])

  const candidates = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allProfiles
      .filter((p) => !excludedIds.has(p.id))
      .filter((p) => !q || p.displayName.toLowerCase().includes(q))
      .slice(0, 20)
  }, [allProfiles, excludedIds, search])

  const handleSend = async (target: UserProfile) => {
    if (!user) return
    try {
      await sendLink.mutateAsync({
        senderId: user.id,
        senderName: user.displayName,
        recipientId: target.id,
        recipientName: target.displayName,
      })
      showToast(`Invite sent to ${target.displayName}`, 'success')
      setIsInviteOpen(false)
      setSearch('')
    } catch {
      showToast('Could not send invite', 'error')
    }
  }

  const handleAccept = async (link: FamilyLink) => {
    try {
      await acceptLink.mutateAsync(link.id)
      showToast('Linked', 'success')
    } catch {
      showToast('Could not accept', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirmRemove) return
    try {
      await deleteLink.mutateAsync(confirmRemove.id)
      showToast('Removed', 'success')
      setConfirmRemove(null)
    } catch {
      showToast('Could not remove', 'error')
    }
  }

  const otherInLink = (link: FamilyLink): { id: string; name: string } => {
    const id = link.participants.find((p) => p !== user?.id) || ''
    const name = link.senderId === user?.id ? link.recipientName : link.senderName
    return { id, name: name || 'Member' }
  }

  // Profile lookups for accepted links so we get avatars and current
  // display names. Lazy — only resolved when there's at least one link.
  const acceptedIds = accepted.map((l) => otherInLink(l).id).join(',')
  const { data: profilesById = {} } = useQuery({
    queryKey: ['linkedProfiles', user?.id, acceptedIds],
    enabled: accepted.length > 0,
    queryFn: async () => {
      const ids = accepted.map((l) => otherInLink(l).id).filter(Boolean)
      const records = await Promise.all(ids.map((id) => dbService.getPublicProfile(id)))
      const out: Record<string, UserProfile> = {}
      records.forEach((p) => { if (p) out[p.id] = p })
      return out
    },
  })

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta">Linked family</p>
        <Button variant="ghost" size="sm" onClick={() => setIsInviteOpen(true)}>
          <UserPlus size={14} className="mr-1" /> Invite
        </Button>
      </div>

      {/* Incoming pending invites — accept/decline */}
      {incoming.length > 0 && (
        <ul className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden divide-y divide-amber-200 list-none p-0 m-0 mb-3">
          {incoming.map((link) => {
            const other = otherInLink(link)
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm m-0">
                    <strong>{other.name}</strong> wants to link as family
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleAccept(link)}>
                  <Check size={14} /> Accept
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(link)}>
                  <X size={14} />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Accepted links */}
      {accepted.length > 0 && (
        <ul className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc] list-none p-0 m-0 mb-3">
          {accepted.map((link) => {
            const other = otherInLink(link)
            const profile = profilesById[other.id]
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar src={profile?.photoURL} name={profile?.displayName || other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm m-0 truncate">
                    {profile?.displayName || other.name}
                  </p>
                  <p className="text-xs text-text-light m-0">Can RSVP for each other</p>
                </div>
                <button
                  onClick={() => setConfirmRemove(link)}
                  className="p-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove link with ${other.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Outgoing pending (awaiting their accept) */}
      {outgoing.length > 0 && (
        <ul className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc] list-none p-0 m-0 mb-3">
          {outgoing.map((link) => {
            const other = otherInLink(link)
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary m-0 truncate">{other.name}</p>
                  <p className="text-xs text-text-light m-0">Invite sent — waiting for them to accept</p>
                </div>
                <button
                  onClick={() => setConfirmRemove(link)}
                  className="p-2 rounded-md text-text-light hover:bg-cream/60 transition-colors"
                  aria-label="Cancel invite"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {accepted.length === 0 && incoming.length === 0 && outgoing.length === 0 && (
        <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
          <Users size={18} className="mt-0.5 shrink-0" />
          <span>
            Link with a partner or another adult in your family and you'll be able to RSVP for each other. They have to accept the invite first.
          </span>
        </div>
      )}

      {/* Invite picker modal */}
      <Modal isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); setSearch('') }} title="Invite a family member">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#e0dbd2] rounded-md bg-[#faf8f4]">
            <Search size={16} className="text-text-light shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full border-none p-0 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-[#ebe6dc]">
            {candidates.length === 0 ? (
              <p className="text-sm text-text-light text-center py-4 m-0">
                {search ? 'No matches' : 'Type a name to find someone'}
              </p>
            ) : (
              candidates.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-cream/60 transition-colors"
                  disabled={sendLink.isPending}
                >
                  <Avatar src={p.photoURL} name={p.displayName} size="sm" />
                  <span className="flex-1 text-sm font-medium text-text-primary truncate">{p.displayName}</span>
                  <Plus size={16} className="text-text-light" />
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleDelete}
        title={
          confirmRemove?.status === 'accepted'
            ? 'Remove family link?'
            : confirmRemove?.recipientId === user?.id
              ? 'Decline invite?'
              : 'Cancel invite?'
        }
        message={
          confirmRemove?.status === 'accepted'
            ? `You and ${otherInLink(confirmRemove).name} won't be able to RSVP for each other anymore.`
            : 'This invite will be removed.'
        }
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </section>
  )
}
