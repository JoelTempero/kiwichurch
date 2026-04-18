import { usePublishedKetePosts } from '@/hooks/useKete'
import { KeteCard } from '@/components/kete'
import { EmptyState, Skeleton, PullToRefresh } from '@/components/common'

export function KetePage() {
  const { data: posts = [], isLoading, refetch } = usePublishedKetePosts()

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-forest mb-2">Kete</h1>
        <p className="text-text-light text-lg">
          Stories, reflections, and resources from our community
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <Skeleton variant="rectangular" height={200} />
            <div className="p-4">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <Skeleton variant="rectangular" height={200} />
            <div className="p-4">
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
          message="Stories, reflections, and resources from our community will appear here. Check back soon!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <KeteCard key={post.id} post={post} />
          ))}
        </div>
      )}
      </div>
    </PullToRefresh>
  )
}
