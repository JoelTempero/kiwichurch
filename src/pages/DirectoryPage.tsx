import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { Avatar, EmptyState, Skeleton } from '@/components/common'
import type { User } from '@/types'

export function DirectoryPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['directory'],
    queryFn: () => dbService.getAllUsers(),
    enabled: !!user
  })

  const filteredUsers = users.filter((u: User) => {
    const query = searchQuery.toLowerCase()
    return (
      u.displayName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  })

  // Group users by first letter
  const groupedUsers = filteredUsers.reduce((groups: Record<string, User[]>, user: User) => {
    const letter = user.displayName.charAt(0).toUpperCase()
    if (!groups[letter]) {
      groups[letter] = []
    }
    groups[letter].push(user)
    return groups
  }, {})

  const sortedLetters = Object.keys(groupedUsers).sort()

  return (
    <div className="directory-page">
      <div className="directory-header">
        <h1 className="directory-title">Directory</h1>
        <p className="directory-subtitle">{users.length} members</p>
      </div>

      {/* Search */}
      <div className="directory-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="form-input"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Directory List */}
      {isLoading ? (
        <div className="directory-list">
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No members found"
          message={searchQuery ? 'Try a different search term' : 'No members in the directory'}
        />
      ) : (
        <div className="directory-list">
          {sortedLetters.map(letter => (
            <div key={letter} className="directory-group">
              <div className="directory-letter">{letter}</div>
              {groupedUsers[letter].map((member: User) => (
                <div key={member.id} className="directory-item">
                  <Avatar src={member.photoURL} name={member.displayName} size="md" />
                  <div className="directory-item-info">
                    <h3 className="directory-item-name">{member.displayName}</h3>
                    {member.bio && (
                      <p className="directory-item-bio">{member.bio}</p>
                    )}
                  </div>
                  {member.role !== 'member' && (
                    <span className="directory-item-role">{member.role}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Alphabet Index */}
      <div className="directory-index">
        {sortedLetters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="directory-index-letter"
          >
            {letter}
          </a>
        ))}
      </div>
    </div>
  )
}
