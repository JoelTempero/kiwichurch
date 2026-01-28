import { Link } from 'react-router-dom'
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
      className={`gathering-card ${gathering.featured ? 'gathering-card-featured' : ''}`}
    >
      <div
        className="gathering-card-header"
        style={{ backgroundColor: gathering.color || 'var(--color-forest)' }}
      >
        {gathering.imageURL ? (
          <img src={gathering.imageURL} alt={gathering.name} />
        ) : (
          <div className="gathering-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        )}
      </div>
      <div className="gathering-card-body">
        <h3 className="gathering-card-title">{gathering.name}</h3>
        {gathering.rhythm && (
          <p className="gathering-card-rhythm">{gathering.rhythm}</p>
        )}
        {gathering.description && (
          <p className="gathering-card-description">{gathering.description}</p>
        )}
        <div className="gathering-card-footer">
          <span className="gathering-card-members">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          {isMember && (
            <span className="gathering-card-member-badge">Member</span>
          )}
        </div>
      </div>
    </Link>
  )
}
