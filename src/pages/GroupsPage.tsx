import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGatherings, useUserGatherings } from '@/hooks/useGatherings'
import { GatheringCard } from '@/components/groups'
import { EmptyState, GatheringCardSkeleton } from '@/components/common'

export function GroupsPage() {
  const { user } = useAuth()
  const { data: allGatherings = [], isLoading: loadingAll } = useGatherings()
  const { data: userGatherings = [], isLoading: loadingUser } = useUserGatherings(user?.id || null)

  const isLoading = loadingAll || loadingUser

  // Separate user's gatherings from others
  const userGatheringIds = useMemo(() => {
    return new Set(userGatherings.map(g => g.id))
  }, [userGatherings])

  const publicGatherings = useMemo(() => {
    return allGatherings.filter(g => g.isPublic && !userGatheringIds.has(g.id))
  }, [allGatherings, userGatheringIds])

  return (
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
            message="Join a group to connect with others"
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
  )
}
