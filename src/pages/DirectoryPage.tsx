import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { Avatar, EmptyState, Spinner, FadeIn } from '@/components/common'
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

  const groupedUsers = filteredUsers.reduce((groups: Record<string, User[]>, user: User) => {
    const letter = user.displayName.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(user)
    return groups
  }, {})

  const sortedLetters = Object.keys(groupedUsers).sort()

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl text-forest mb-1">Directory</h1>
        <p className="text-text-light m-0">{users.length} members</p>
      </div>

      {/* Search bar — flat, no card wrapper */}
      <div className="flex items-center gap-3 px-4 py-3 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] mb-4">
        <Search size={20} className="text-text-light shrink-0" />
        <input
          type="text"
          className="w-full border-none p-0 bg-transparent font-body text-base outline-none"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No members found"
          message={searchQuery ? 'Try a different search term' : 'No members in the directory'}
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden">
          {sortedLetters.map((letter, letterIndex) => (
            <div key={letter} className={letterIndex > 0 ? 'border-t border-[#e0dbd2]' : ''}>
              {/* Section header row */}
              <div className="px-4 py-2 bg-[#f0ece4] border-b border-[#e0dbd2]">
                <span className="text-xs font-semibold text-text-light uppercase tracking-wide">{letter}</span>
              </div>
              {/* Member rows */}
              <div className="divide-y divide-[#ebe6dc]">
                {groupedUsers[letter].map((member: User) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors"
                  >
                    <Avatar src={member.photoURL} name={member.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-text-primary m-0 truncate">{member.displayName}</p>
                      {member.bio && (
                        <p className="text-sm text-text-light m-0 truncate">{member.bio}</p>
                      )}
                    </div>
                    {member.role !== 'member' && (
                      <span className="text-xs px-2 py-1 bg-forest text-white rounded-sm capitalize">{member.role}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </FadeIn>
      )}
    </div>
  )
}
