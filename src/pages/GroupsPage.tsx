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
      <div className="groups-page">
        {/* My Groups */}
      <section className="groups-section">
        <h2 className="groups-section-title">My Groups</h2>
        {isLoading ? (
          <div className="groups-grid">
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
          <div className="groups-grid">
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
          <section className="groups-section">
            <h2 className="groups-section-title">Discover</h2>
            <div className="groups-grid">
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
