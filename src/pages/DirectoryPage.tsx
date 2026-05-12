import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { Avatar, EmptyState, Spinner, FadeIn } from '@/components/common'
import { MemberDetailModal } from '@/components/directory'
import { useGatherings } from '@/hooks/useGatherings'
import { cn } from '@/utils/cn'
import type { User } from '@/types'

type RoleFilter = 'all' | 'admin' | 'host' | 'member'

export function DirectoryPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [groupFilter, setGroupFilter] = useState<string>('')
  const [selected, setSelected] = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['directory'],
    queryFn: () => dbService.getAllUsers(),
    enabled: !!user,
  })

  const { data: gatherings = [] } = useGatherings()

  // Lazy-load member lists for a chosen group when group filter is active.
  // We use useQueries pattern to fetch members for a single gathering on demand.
  const { data: groupMemberIds = new Set<string>(), isLoading: loadingGroupMembers } = useQuery({
    queryKey: ['gatheringMembers', groupFilter],
    queryFn: async () => {
      const members = await dbService.getGatheringMembers(groupFilter)
      return new Set(members.map((m) => m.id))
    },
    enabled: !!groupFilter,
  })

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return users.filter((u: User) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (groupFilter && !groupMemberIds.has(u.id)) return false
      if (!q) return true
      const haystack = [
        u.displayName,
        u.email,
        u.bio || '',
        ...(u.interests || []),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [users, searchQuery, roleFilter, groupFilter, groupMemberIds])

  const groupedUsers = useMemo(() => {
    return filteredUsers.reduce((groups: Record<string, User[]>, u: User) => {
      const letter = (u.displayName || '#').charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(u)
      return groups
    }, {})
  }, [filteredUsers])

  const sortedLetters = Object.keys(groupedUsers).sort()

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setGroupFilter('')
  }
  const hasFilters = !!searchQuery || roleFilter !== 'all' || !!groupFilter

  const roleOptions: Array<{ value: RoleFilter; label: string }> = [
    { value: 'all', label: 'Everyone' },
    { value: 'admin', label: 'Admins' },
    { value: 'host', label: 'Hosts' },
    { value: 'member', label: 'Members' },
  ]

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl text-forest mb-1">Directory</h1>
        <p className="text-text-light m-0">{users.length} members</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] mb-3">
        <Search size={20} className="text-text-light shrink-0" />
        <input
          type="text"
          className="w-full border-none p-0 bg-transparent font-body text-base outline-none"
          placeholder="Search by name, bio, or interest..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-colors border',
                roleFilter === opt.value
                  ? 'bg-forest text-cream border-forest'
                  : 'bg-transparent text-text-primary border-[#e0dbd2] hover:bg-cream/60',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[160px]">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-full border border-[#e0dbd2] bg-transparent text-sm focus:outline-none focus:border-forest"
            aria-label="Filter by group"
          >
            <option value="">All groups</option>
            {gatherings.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-text-light hover:text-text-primary transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {isLoading || (groupFilter && loadingGroupMembers) ? (
        <Spinner />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="users"
          title="No members found"
          message={hasFilters ? 'Try clearing some filters' : 'No members in the directory'}
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden">
          {sortedLetters.map((letter, letterIndex) => (
            <div key={letter} className={letterIndex > 0 ? 'border-t border-[#e0dbd2]' : ''}>
              <div className="px-4 py-2 bg-[#f0ece4] border-b border-[#e0dbd2]">
                <span className="text-xs font-semibold text-text-light uppercase tracking-wide">{letter}</span>
              </div>
              <div className="divide-y divide-[#ebe6dc]">
                {groupedUsers[letter].map((member: User) => {
                  const privacy = member.privacy || {}
                  const showBio = privacy.showBio !== false
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => setSelected(member)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors focus:outline-none focus:bg-cream/70"
                    >
                      <Avatar src={member.photoURL} name={member.displayName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] text-text-primary m-0 truncate">{member.displayName}</p>
                        {showBio && member.bio && (
                          <p className="text-sm text-text-light m-0 truncate">{member.bio}</p>
                        )}
                      </div>
                      {member.role !== 'member' && (
                        <span className="text-xs px-2 py-1 bg-forest text-white rounded-sm capitalize">{member.role}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </FadeIn>
      )}

      <MemberDetailModal member={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
