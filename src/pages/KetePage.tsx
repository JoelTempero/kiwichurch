import { usePublishedKetePosts } from '@/hooks/useKete'
import { KeteCard } from '@/components/kete'
import { EmptyState, Skeleton } from '@/components/common'

export function KetePage() {
  const { data: posts = [], isLoading } = usePublishedKetePosts()

  return (
    <div className="kete-page">
      <div className="kete-page-header">
        <h1 className="kete-page-title">Kete</h1>
        <p className="kete-page-subtitle">
          Stories, reflections, and resources from our community
        </p>
      </div>

      {isLoading ? (
        <div className="kete-grid">
          <div className="kete-card-skeleton">
            <Skeleton variant="rectangular" height={200} />
            <div style={{ padding: '1rem' }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
          <div className="kete-card-skeleton">
            <Skeleton variant="rectangular" height={200} />
            <div style={{ padding: '1rem' }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="book"
          title="No posts yet"
          message="Check back later for stories and reflections"
        />
      ) : (
        <div className="kete-grid">
          {posts.map(post => (
            <KeteCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
