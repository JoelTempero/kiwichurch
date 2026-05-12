import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Avatar, Button, Modal, ConfirmModal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import {
  useFamilyLinks,
  useSendFamilyLink,
  useAcceptFamilyLink,
  useDeleteFamilyLink,
  useUpdateFamilyLinkRelationship,
} from '@/hooks/useFamilyLinks'
import {
  Plus, Pencil, Trash2, Users, Search, Check, X, Heart, UserPlus,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Dependant, FamilyLink, UserProfile } from '@/types'

const manualSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name too long'),
  relationship: z.string().max(40, 'Too long').default(''),
  isChild: z.boolean().default(false),
})
type ManualInput = z.input<typeof manualSchema>

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

type AddTab = 'member' | 'manual'

export function FamilySection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const dependants = user?.dependants || []

  const { data: links } = useFamilyLinks(user?.id || null)
  const sendLink = useSendFamilyLink()
  const acceptLink = useAcceptFamilyLink(user?.id || null)
  const deleteLink = useDeleteFamilyLink(user?.id || null)
  const updateLinkRel = useUpdateFamilyLinkRelationship(user?.id || null)
  const accepted = links?.accepted || []
  const incoming = links?.incoming || []
  const outgoing = links?.outgoing || []

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('member')
  const [editing, setEditing] = useState<Dependant | null>(null)
  // Member-search state
  const [memberSearch, setMemberSearch] = useState('')
  const [pickedMember, setPickedMember] = useState<UserProfile | null>(null)
  const [memberRelationship, setMemberRelationship] = useState('')

  const manualForm = useForm<ManualInput>({
    resolver: zodResolver(manualSchema),
    defaultValues: { name: '', relationship: '', isChild: false },
  })

  // Remove confirm — works for both dependants and links
  const [confirmRemove, setConfirmRemove] = useState<
    | { kind: 'dependant'; dep: Dependant }
    | { kind: 'link'; link: FamilyLink }
    | null
  >(null)

  // Inline edit for a linked account's relationship label (name + photo
  // belong to the linked person — only the relationship is editable here).
  const [editingLink, setEditingLink] = useState<FamilyLink | null>(null)
  const [editLinkRelationship, setEditLinkRelationship] = useState('')

  // Profile lookups for accepted links so we get avatars + current display names
  const acceptedIds = accepted
    .map((l) => l.participants.find((p) => p !== user?.id) || '')
    .filter(Boolean)
    .join(',')
  const { data: profilesById = {} } = useQuery<Record<string, UserProfile>>({
    queryKey: ['linkedProfiles', user?.id, acceptedIds],
    enabled: accepted.length > 0,
    queryFn: async () => {
      const ids = acceptedIds.split(',').filter(Boolean)
      const records = await Promise.all(ids.map((id) => dbService.getPublicProfile(id)))
      const out: Record<string, UserProfile> = {}
      records.forEach((p) => { if (p) out[p.id] = p })
      return out
    },
  })

  // Directory for picking another member to invite
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['directoryProfiles'],
    queryFn: () => dbService.getAllPublicProfiles(),
    enabled: isAddOpen && addTab === 'member' && !!user,
  })

  // Exclude self + anyone already linked or invited (in either direction)
  const excludedIds = useMemo(() => {
    const s = new Set<string>([user?.id || ''])
    for (const l of [...accepted, ...incoming, ...outgoing]) {
      const other = l.participants.find((p) => p !== user?.id)
      if (other) s.add(other)
    }
    return s
  }, [user?.id, accepted, incoming, outgoing])

  const candidates = useMemo(() => {
    const q = memberSearch.toLowerCase().trim()
    return allProfiles
      .filter((p) => !excludedIds.has(p.id))
      .filter((p) => !q || p.displayName.toLowerCase().includes(q))
      .slice(0, 20)
  }, [allProfiles, excludedIds, memberSearch])

  const openAdd = () => {
    setAddTab('member')
    setMemberSearch('')
    setPickedMember(null)
    setMemberRelationship('')
    manualForm.reset({ name: '', relationship: '', isChild: false })
    setEditing(null)
    setIsAddOpen(true)
  }

  const openEditDependant = (d: Dependant) => {
    setAddTab('manual')
    setEditing(d)
    manualForm.reset({
      name: d.name,
      relationship: d.relationship || '',
      isChild: !!d.isChild,
    })
    setIsAddOpen(true)
  }

  const handleManualSave = manualForm.handleSubmit(async (data) => {
    try {
      const next: Dependant[] = editing
        ? dependants.map((d) =>
            d.id === editing.id
              ? { ...d, name: data.name.trim(), relationship: data.relationship?.trim() || '', isChild: data.isChild }
              : d,
          )
        : [
            ...dependants,
            { id: makeId(), name: data.name.trim(), relationship: data.relationship?.trim() || '', isChild: data.isChild },
          ]
      await updateProfile({ dependants: next })
      showToast(editing ? 'Family member updated' : 'Family member added', 'success')
      setIsAddOpen(false)
    } catch {
      showToast('Failed to save', 'error')
    }
  })

  const handleSendInvite = async () => {
    if (!user || !pickedMember) return
    try {
      await sendLink.mutateAsync({
        senderId: user.id,
        senderName: user.displayName,
        recipientId: pickedMember.id,
        recipientName: pickedMember.displayName,
        relationship: memberRelationship.trim(),
      })
      showToast(`Invite sent to ${pickedMember.displayName}`, 'success')
      setIsAddOpen(false)
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

  const openEditLink = (link: FamilyLink) => {
    setEditingLink(link)
    setEditLinkRelationship(link.relationship || '')
  }

  const handleSaveLinkRelationship = async () => {
    if (!editingLink) return
    try {
      await updateLinkRel.mutateAsync({
        linkId: editingLink.id,
        relationship: editLinkRelationship.trim(),
      })
      showToast('Relationship updated', 'success')
      setEditingLink(null)
    } catch {
      showToast('Could not update', 'error')
    }
  }

  const handleRemove = async () => {
    if (!confirmRemove) return
    try {
      if (confirmRemove.kind === 'dependant') {
        const next = dependants.filter((d) => d.id !== confirmRemove.dep.id)
        await updateProfile({ dependants: next })
      } else {
        await deleteLink.mutateAsync(confirmRemove.link.id)
      }
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

  const isEmpty =
    dependants.length === 0 && accepted.length === 0 && incoming.length === 0 && outgoing.length === 0

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta">Family</p>
        <Button variant="ghost" size="sm" onClick={openAdd} aria-label="Add family member">
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
          <Users size={18} className="mt-0.5 shrink-0" />
          <span>
            Add family so you can RSVP for them in one go. If they have their own Kiwi Church account you can link with them — otherwise just enter their name.
          </span>
        </div>
      ) : (
        <ul className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc] list-none p-0 m-0">
          {/* Incoming invites (action required) — float to top */}
          {incoming.map((link) => {
            const other = otherInLink(link)
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3 bg-amber-50">
                <Avatar name={other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm m-0">
                    <strong>{other.name}</strong> wants to link as your{' '}
                    <em>{link.relationship || 'family'}</em>
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleAccept(link)}>
                  <Check size={14} /> Accept
                </Button>
                <button
                  onClick={() => setConfirmRemove({ kind: 'link', link })}
                  className="p-2 rounded-md text-text-light hover:bg-cream/60 transition-colors"
                  aria-label="Decline"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}

          {/* Accepted links */}
          {accepted.map((link) => {
            const other = otherInLink(link)
            const profile = profilesById[other.id]
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar src={profile?.photoURL} name={profile?.displayName || other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm m-0 truncate flex items-center gap-1.5">
                    {profile?.displayName || other.name}
                    <Heart size={11} className="text-terracotta" aria-label="Linked account" />
                  </p>
                  <p className="text-xs text-text-light m-0">
                    {link.relationship || 'Family'} · linked, can RSVP for each other
                  </p>
                </div>
                <button
                  onClick={() => openEditLink(link)}
                  className="p-2 rounded-md text-text-light hover:bg-cream/60 hover:text-text-primary transition-colors"
                  aria-label={`Edit relationship with ${other.name}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmRemove({ kind: 'link', link })}
                  className="p-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove link with ${other.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            )
          })}

          {/* Outgoing pending invites */}
          {outgoing.map((link) => {
            const other = otherInLink(link)
            return (
              <li key={link.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={other.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary m-0 truncate">{other.name}</p>
                  <p className="text-xs text-text-light m-0 italic">
                    {link.relationship ? `${link.relationship} · ` : ''}invite sent, waiting for them to accept
                  </p>
                </div>
                <button
                  onClick={() => setConfirmRemove({ kind: 'link', link })}
                  className="p-2 rounded-md text-text-light hover:bg-cream/60 transition-colors"
                  aria-label="Cancel invite"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}

          {/* Non-account dependants */}
          {dependants.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={d.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm m-0">{d.name}</p>
                <p className="text-xs text-text-light m-0">
                  {d.relationship || (d.isChild ? 'Child' : 'Family')}
                </p>
              </div>
              <button
                onClick={() => openEditDependant(d)}
                className="p-2 rounded-md text-text-light hover:bg-cream/60 hover:text-text-primary transition-colors"
                aria-label={`Edit ${d.name}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setConfirmRemove({ kind: 'dependant', dep: d })}
                className="p-2 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                aria-label={`Remove ${d.name}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Combined Add modal — two paths picked via tabs */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editing ? 'Edit family member' : 'Add a family member'}
      >
        {!editing && (
          <div className="flex gap-1 p-1 bg-cream rounded-md mb-4" role="tablist" aria-label="Family member type">
            <button
              type="button"
              role="tab"
              aria-selected={addTab === 'member'}
              onClick={() => setAddTab('member')}
              className={cn(
                'flex-1 px-3 py-2 rounded-sm text-sm font-medium transition-colors',
                addTab === 'member' ? 'bg-forest text-cream' : 'text-text-light hover:text-text-primary',
              )}
            >
              <UserPlus size={14} className="inline mr-1" /> Kiwi Church member
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={addTab === 'manual'}
              onClick={() => setAddTab('manual')}
              className={cn(
                'flex-1 px-3 py-2 rounded-sm text-sm font-medium transition-colors',
                addTab === 'manual' ? 'bg-forest text-cream' : 'text-text-light hover:text-text-primary',
              )}
            >
              <Plus size={14} className="inline mr-1" /> Someone else
            </button>
          </div>
        )}

        {/* MEMBER PATH */}
        {!editing && addTab === 'member' && (
          <div className="space-y-3">
            <p className="text-sm text-text-light m-0">
              Pick another Kiwi Church member to link as family. They'll need to accept the invite before you can RSVP for each other.
            </p>
            <p className="text-xs text-text-lighter m-0 italic">
              You can adjust family visibility in Privacy settings below.
            </p>

            {pickedMember ? (
              <div className="flex items-center gap-3 p-3 border border-[#e0dbd2] rounded-md bg-[#faf8f4]">
                <Avatar src={pickedMember.photoURL} name={pickedMember.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm m-0 truncate">{pickedMember.displayName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickedMember(null)}
                  className="p-1 rounded-md text-text-light hover:bg-cream/60"
                  aria-label="Pick a different member"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#e0dbd2] rounded-md bg-[#faf8f4]">
                  <Search size={16} className="text-text-light shrink-0" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    className="w-full border-none p-0 bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto divide-y divide-[#ebe6dc] border border-[#e0dbd2] rounded-md">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-text-light text-center py-4 m-0">
                      {memberSearch ? 'No matches' : 'Type a name to find someone'}
                    </p>
                  ) : (
                    candidates.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPickedMember(p)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-cream/60 transition-colors"
                      >
                        <Avatar src={p.photoURL} name={p.displayName} size="sm" />
                        <span className="flex-1 text-sm font-medium truncate">{p.displayName}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {pickedMember && (
              <div>
                <label className="block font-medium mb-2 text-sm" htmlFor="link-rel">Relationship</label>
                <input
                  id="link-rel"
                  type="text"
                  className={inputBase}
                  placeholder="e.g. Spouse, Brother, Mother"
                  value={memberRelationship}
                  onChange={(e) => setMemberRelationship(e.target.value)}
                  maxLength={40}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleSendInvite}
                disabled={!pickedMember || sendLink.isPending}
                loading={sendLink.isPending}
              >
                Send invite
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* MANUAL PATH (also used for edit) */}
        {(editing || addTab === 'manual') && (
          <form onSubmit={handleManualSave} className="space-y-4" noValidate>
            {!editing && (
              <>
                <p className="text-sm text-text-light m-0">
                  Add a family member who doesn't have the app so you can RSVP to events for them — great for kids or grandparents.
                </p>
                <p className="text-xs text-text-lighter m-0 italic">
                  You can adjust family visibility in Privacy settings below.
                </p>
              </>
            )}
            <div>
              <label className="block font-medium mb-2" htmlFor="dep-name">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="dep-name"
                type="text"
                className={cn(inputBase, manualForm.formState.errors.name && inputError)}
                placeholder="First name (or first + last)"
                {...manualForm.register('name')}
              />
              {manualForm.formState.errors.name && (
                <span className="text-sm text-red-600 mt-1 block" role="alert">{manualForm.formState.errors.name.message}</span>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2" htmlFor="dep-rel">Relationship</label>
              <input
                id="dep-rel"
                type="text"
                className={inputBase}
                placeholder="e.g. Son, Daughter, Mother, Aunt"
                {...manualForm.register('relationship')}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...manualForm.register('isChild')} />
              <span>This person is a child</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={manualForm.formState.isSubmitting}>
                {editing ? 'Save' : 'Add'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={manualForm.formState.isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit relationship for an accepted link */}
      <Modal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        title="Edit family relationship"
      >
        {editingLink && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-cream">
              <Avatar
                src={profilesById[otherInLink(editingLink).id]?.photoURL}
                name={profilesById[otherInLink(editingLink).id]?.displayName || otherInLink(editingLink).name}
                size="md"
              />
              <p className="font-semibold m-0">
                {profilesById[otherInLink(editingLink).id]?.displayName || otherInLink(editingLink).name}
              </p>
            </div>
            <div>
              <label className="block font-medium mb-2 text-sm" htmlFor="link-rel-edit">Relationship</label>
              <input
                id="link-rel-edit"
                type="text"
                className={inputBase}
                placeholder="e.g. Spouse, Brother, Mother"
                value={editLinkRelationship}
                onChange={(e) => setEditLinkRelationship(e.target.value)}
                maxLength={40}
              />
              <p className="text-xs text-text-light mt-1 m-0">
                Both of you will see this label.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleSaveLinkRelationship}
                loading={updateLinkRel.isPending}
              >
                Save
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditingLink(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemove}
        title={
          !confirmRemove ? '' :
          confirmRemove.kind === 'dependant' ? 'Remove family member?' :
          confirmRemove.link.status === 'accepted' ? 'Remove family link?' :
          confirmRemove.link.recipientId === user?.id ? 'Decline invite?' :
          'Cancel invite?'
        }
        message={
          !confirmRemove ? '' :
          confirmRemove.kind === 'dependant'
            ? `Remove ${confirmRemove.dep.name} from your family list?`
            : confirmRemove.link.status === 'accepted'
              ? `You and ${otherInLink(confirmRemove.link).name} won't be able to RSVP for each other anymore.`
              : 'This invite will be removed.'
        }
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </section>
  )
}
