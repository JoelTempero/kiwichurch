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
        <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          <div className="p-4"><Skeleton variant="text" width="60%" /></div>
          <div className="p-4"><Skeleton variant="text" width="80%" /></div>
          <div className="p-4"><Skeleton variant="text" width="50%" /></div>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="book"
          title="No posts yet"
          message="Stories, reflections, and resources from our community will appear here. Check back soon!"
        />
      ) : (
        <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {posts.map(post => (
            <KeteCard key={post.id} post={post} />
          ))}
        </div>
      )}
      </div>
    </PullToRefresh>
  )
}
