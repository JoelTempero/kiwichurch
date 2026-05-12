import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MessageCircle, Users, Shield, Baby } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, Modal, Button, Badge } from '@/components/common'
import { dbService } from '@/services/firebase'
import { useGatherings } from '@/hooks/useGatherings'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/types'

interface Props {
  member: UserProfile | null
  isOpen: boolean
  onClose: () => void
}

function dmIdFor(a: string, b: string): string {
  return [a, b].sort().join('_')
}

// Public profile is the trust boundary: any field present here was opted
// in via the owner's privacy toggles, written into /userProfiles by their
// own client. The modal renders whatever's there; nothing more, nothing
// less. Privacy enforcement no longer happens in this component.
export function MemberDetailModal({ member, isOpen, onClose }: Props) {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { data: gatherings = [] } = useGatherings()

  const isSelf = currentUser?.id === member?.id

  const { data: memberGatheringIds } = useQuery<Set<string>>({
    queryKey: ['memberGatherings', member?.id, gatherings.map((g) => g.id).join(',')],
    queryFn: () =>
      dbService.getUserGatheringIds(
        member!.id,
        gatherings.map((g) => g.id),
      ),
    enabled: !!member?.id && gatherings.length > 0,
  })

  if (!member) return null

  const memberGroups = gatherings.filter((g) => memberGatheringIds?.has(g.id))
  const phone = member.publicPhone
  const email = member.publicEmail
  const family = member.publicFamily || []
  const interests = member.interests || []
  const gallery = member.gallery || []
  const hasAnyVisibleInfo = !!(member.bio || phone || email || interests.length || gallery.length || family.length || memberGroups.length)

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
            {member.role && member.role !== 'member' && (
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

        {member.bio && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">About</p>
            <p className="text-text-primary leading-relaxed m-0">{member.bio}</p>
          </div>
        )}

        {(phone || email) && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Contact</p>
            <div className="space-y-2">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-text-primary hover:text-forest transition-colors"
                >
                  <Mail size={16} className="text-text-light" />
                  <span className="text-sm">{email}</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-text-primary hover:text-forest transition-colors"
                >
                  <Phone size={16} className="text-text-light" />
                  <span className="text-sm">{phone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {interests.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((tag) => (
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

        {family.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Family</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {family.map((d, i) => (
                <li key={i} className="text-sm text-text-primary inline-flex items-center gap-1.5">
                  {d.isChild && <Baby size={14} className="text-text-light" />}
                  {d.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {memberGroups.length > 0 && (
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

        {gallery.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-2">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((g) => (
                <a
                  key={g.url}
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-md overflow-hidden border border-[#e0dbd2] block"
                >
                  <img src={g.url} alt={g.caption || ''} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {!hasAnyVisibleInfo && (
          <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
            <Users size={18} className="mt-0.5 shrink-0" />
            <span>{member.displayName} hasn’t shared a public profile yet.</span>
          </div>
        )}
      </div>
    </Modal>
  )
}
