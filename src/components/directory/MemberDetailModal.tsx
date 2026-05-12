import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MessageCircle, Users, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, Modal, Button, Badge } from '@/components/common'
import { dbService } from '@/services/firebase'
import { useGatherings } from '@/hooks/useGatherings'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_PRIVACY, type PrivacySettings, type User } from '@/types'

interface Props {
  member: User | null
  isOpen: boolean
  onClose: () => void
}

function dmIdFor(a: string, b: string): string {
  return [a, b].sort().join('_')
}

export function MemberDetailModal({ member, isOpen, onClose }: Props) {
  const { user: currentUser, isAdminOrHost } = useAuth()
  const navigate = useNavigate()
  const { data: gatherings = [] } = useGatherings()

  const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(member?.privacy || {}) }
  const isSelf = currentUser?.id === member?.id
  // The viewer always sees their own info, and admin/host see everything for pastoral care.
  const canSeeAll = isSelf || isAdminOrHost

  // Which gatherings the member belongs to
  const { data: memberGatheringIds } = useQuery<Set<string>>({
    queryKey: ['memberGatherings', member?.id, gatherings.map((g) => g.id).join(',')],
    queryFn: () =>
      dbService.getUserGatheringIds(
        member!.id,
        gatherings.map((g) => g.id),
      ),
    enabled: !!member?.id && gatherings.length > 0 && (canSeeAll || privacy.showGroups !== false),
  })

  if (!member) return null

  const showEmail = canSeeAll || privacy.showEmail !== false
  const showPhone = canSeeAll || privacy.showPhone !== false
  const showBio = canSeeAll || privacy.showBio !== false
  const showInterests = canSeeAll || privacy.showInterests !== false
  const showGallery = canSeeAll || privacy.showGallery !== false
  const showGroups = canSeeAll || privacy.showGroups !== false
  const showFamily = canSeeAll || privacy.showFamily === true

  const memberGroups = gatherings.filter((g) => memberGatheringIds?.has(g.id))

  const handleMessage = () => {
    if (!currentUser?.id || !member.id || isSelf) return
    navigate(`/messages/${dmIdFor(currentUser.id, member.id)}`)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member.displayName} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar src={member.photoURL} name={member.displayName} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-display text-forest m-0">{member.displayName}</h2>
            {member.role !== 'member' && (
              <Badge variant="default" className="mt-1 capitalize">
                <span className="inline-flex items-center gap-1"><Shield size={12} />{member.role}</span>
              </Badge>
            )}
          </div>
          {!isSelf && currentUser?.id && (
            <Button variant="primary" size="sm" onClick={handleMessage}>
              <MessageCircle size={14} className="mr-1" />
              Message
            </Button>
          )}
        </div>

        {/* Bio */}
        {showBio && member.bio && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">About</p>
            <p className="text-text-primary leading-relaxed m-0">{member.bio}</p>
          </div>
        )}

        {/* Contact */}
        {(showEmail || showPhone) && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Contact</p>
            <div className="space-y-2">
              {showEmail && member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-text-primary hover:text-forest transition-colors"
                >
                  <Mail size={16} className="text-text-light" />
                  <span className="text-sm">{member.email}</span>
                </a>
              )}
              {showPhone && member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-2 text-text-primary hover:text-forest transition-colors"
                >
                  <Phone size={16} className="text-text-light" />
                  <span className="text-sm">{member.phone}</span>
                </a>
              )}
              {(!showEmail || !member.email) && (!showPhone || !member.phone) && !member.email && !member.phone && (
                <p className="text-sm text-text-lighter italic m-0">No contact info shared</p>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {showInterests && member.interests && member.interests.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {member.interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-forest/10 text-forest text-sm border border-forest/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Family */}
        {showFamily && member.dependants && member.dependants.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Family</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {member.dependants.map((d) => (
                <li key={d.id} className="text-sm text-text-primary">
                  {d.name}
                  {d.relationship && <span className="text-text-light"> — {d.relationship}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Groups */}
        {showGroups && memberGroups.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Groups</p>
            <div className="flex flex-wrap gap-2">
              {memberGroups.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-text-primary text-sm border border-[#e0dbd2]"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: g.color || '#2d5a4a' }}
                    aria-hidden
                  />
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {showGallery && member.gallery && member.gallery.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {member.gallery.map((g) => (
                <a
                  key={g.url}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-md overflow-hidden border border-[#e0dbd2] block"
                >
                  <img src={g.url} alt={g.caption || 'Gallery image'} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty-ish state */}
        {!showBio && !showEmail && !showPhone && !showInterests && !showGallery && !showGroups && (
          <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
            <Users size={18} className="mt-0.5 shrink-0" />
            <span>{member.displayName} hasn’t shared a profile yet.</span>
          </div>
        )}
      </div>
    </Modal>
  )
}
