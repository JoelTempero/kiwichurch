import { usePublishedKetePosts } from '@/hooks/useKete'
import { KeteCard } from '@/components/kete'
import { EmptyState, Spinner, FadeIn, PullToRefresh } from '@/components/common'

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
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="book"
          title="No posts yet"
          message="Stories, reflections, and resources from our community will appear here. Check back soon!"
        />
      ) : (
        <FadeIn className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden">
              <KeteCard post={post} />
            </div>
          ))}
        </FadeIn>
      )}
      </div>
    </PullToRefresh>
  )
}
