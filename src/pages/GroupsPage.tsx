import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGatherings, useUserGatherings } from '@/hooks/useGatherings'
import { GatheringCard } from '@/components/groups'
import { EmptyState, GatheringCardSkeleton, PullToRefresh } from '@/components/common'

export function GroupsPage() {
  const { user } = useAuth()
  const { data: allGatherings = [], isLoading: loadingAll, refetch: refetchAll } = useGatherings()
  const { data: userGatherings = [], isLoading: loadingUser, refetch: refetchUser } = useUserGatherings(user?.id || null)

  const handleRefresh = async () => {
    await Promise.all([refetchAll(), refetchUser()])
  }

  const isLoading = loadingAll || loadingUser

  // Separate user's gatherings from others
  const userGatheringIds = useMemo(() => {
    return new Set(userGatherings.map(g => g.id))
  }, [userGatherings])

  const publicGatherings = useMemo(() => {
    return allGatherings.filter(g => g.isPublic && !userGatheringIds.has(g.id))
  }, [allGatherings, userGatheringIds])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        {/* My Groups */}
        <section className="mb-8">
          <h2 className="text-xl font-display text-forest mb-4">My Groups</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GatheringCardSkeleton />
              <GatheringCardSkeleton />
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userGatherings.map(gathering => (
                <GatheringCard
                  key={gathering.id}
                  gathering={gathering}
                  isMember={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Discover Groups */}
        {publicGatherings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-display text-forest mb-4">Discover</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publicGatherings.map(gathering => (
                <GatheringCard
                  key={gathering.id}
                  gathering={gathering}
                  isMember={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
