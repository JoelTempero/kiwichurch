import { useState } from 'react'
import { Search } from 'lucide-react'
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

  const groupedUsers = filteredUsers.reduce((groups: Record<string, User[]>, user: User) => {
    const letter = user.displayName.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(user)
    return groups
  }, {})

  const sortedLetters = Object.keys(groupedUsers).sort()

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl mb-1">Directory</h1>
        <p className="text-text-light m-0">{users.length} members</p>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-md mb-6 shadow-sm">
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
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          {sortedLetters.map(letter => (
            <div key={letter} className="mb-4">
              <div className="text-sm font-semibold text-forest py-2 border-b border-cream mb-2">{letter}</div>
              {groupedUsers[letter].map((member: User) => (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-md shadow-sm">
                  <Avatar src={member.photoURL} name={member.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base m-0">{member.displayName}</h3>
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
          ))}
        </div>
      )}
    </div>
  )
}
