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
      className="flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors no-underline text-inherit"
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: gathering.color || 'var(--color-forest)' }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('font-semibold text-[15px] text-text-primary truncate', gathering.featured && 'text-gold')}>{gathering.name}</p>
        <p className="text-sm text-text-light truncate flex items-center gap-1">
          <Users size={12} className="flex-shrink-0" />
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
          {gathering.rhythm ? ` · ${gathering.rhythm}` : ''}
          {isMember ? ' · Member' : ''}
        </p>
      </div>
    </Link>
  )
}
