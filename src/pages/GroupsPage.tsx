import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGatherings, useUserGatheringIds } from '@/hooks/useGatherings'
import { dbService } from '@/services/firebase'
import { useQuery } from '@tanstack/react-query'
import { GatheringCard } from '@/components/groups'
import { EmptyState, Spinner, FadeIn, PullToRefresh } from '@/components/common'

export function GroupsPage() {
  const { user } = useAuth()
  const { data: allGatherings = [], isLoading: loadingAll, refetch: refetchAll } = useGatherings()
  const allIds = useMemo(() => allGatherings.map(g => g.id), [allGatherings])
  const { data: memberIds = new Set<string>(), isLoading: loadingUser, refetch: refetchUser } = useUserGatheringIds(user?.id || null, allIds)

  const { data: memberCounts = {} } = useQuery({
    queryKey: ['gatheringMemberCounts', allIds],
    queryFn: () => dbService.getGatheringMemberCounts(allIds),
    enabled: allIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const handleRefresh = async () => {
    await Promise.all([refetchAll(), refetchUser()])
  }

  const isLoading = loadingAll || loadingUser

  const userGatherings = useMemo(() => {
    return allGatherings.filter(g => memberIds.has(g.id))
  }, [allGatherings, memberIds])

  const publicGatherings = useMemo(() => {
    return allGatherings.filter(g => g.isPublic && !memberIds.has(g.id))
  }, [allGatherings, memberIds])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-display text-forest mb-4">Groups</h1>

        {/* My Groups */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-text-light uppercase tracking-wide mb-2">My Groups</h2>
          {isLoading ? (
            <Spinner />
          ) : userGatherings.length === 0 ? (
            <EmptyState
              icon="users"
              title="No groups yet"
              message={publicGatherings.length > 0
                ? "Browse the groups below and join one that interests you"
                : "Check back later for groups to join"
              }
            />
          ) : (
            <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {userGatherings.map(gathering => (
                <GatheringCard
                  key={gathering.id}
                  gathering={gathering}
                  memberCount={memberCounts[gathering.id] || 0}
                  isMember={true}
                />
              ))}
            </FadeIn>
          )}
        </section>

        {/* Discover Groups */}
        {publicGatherings.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-text-light uppercase tracking-wide mb-2">Discover</h2>
            <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {publicGatherings.map(gathering => (
                <GatheringCard
                  key={gathering.id}
                  gathering={gathering}
                  memberCount={memberCounts[gathering.id] || 0}
                  isMember={false}
                />
              ))}
            </FadeIn>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
