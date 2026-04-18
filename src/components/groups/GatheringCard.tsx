import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Gathering } from '@/types'

interface GatheringCardProps {
  gathering: Gathering
  memberCount?: number
  isMember?: boolean
}

export function GatheringCard({ gathering, memberCount = 0, isMember = false }: GatheringCardProps) {
  return (
    <Link
      to={`/groups/${gathering.id}`}
      className={cn(
        'block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white no-underline text-inherit',
        gathering.featured && 'ring-2 ring-gold'
      )}
    >
      <div
        className="h-32 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: gathering.color || 'var(--color-forest)' }}
      >
        {gathering.imageURL ? (
          <img src={gathering.imageURL} alt={gathering.name} />
        ) : (
          <div className="text-white/60">
            <Users size={40} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-text-primary mb-1">{gathering.name}</h3>
        {gathering.rhythm && (
          <p className="text-sm text-text-light mb-1">{gathering.rhythm}</p>
        )}
        {gathering.description && (
          <p className="text-sm text-text-light line-clamp-2 mb-3">{gathering.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-text-light">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          {isMember && (
            <span className="text-xs font-semibold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">Member</span>
          )}
        </div>
      </div>
    </Link>
  )
}
