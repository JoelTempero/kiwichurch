import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePublishedKetePosts, useMyKeteDrafts } from '@/hooks/useKete'
import { KeteCard } from '@/components/kete'
import { Button, EmptyState, Spinner, FadeIn, PullToRefresh } from '@/components/common'

function formatDraftDate(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
}

export function KetePage() {
  const { user, canPostKete } = useAuth()
  const { data: posts = [], isLoading, refetch } = usePublishedKetePosts()
  const { data: drafts = [] } = useMyKeteDrafts(canPostKete ? user?.id || null : null)

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-start justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-display text-forest mb-2">Kete</h1>
            <p className="text-text-light text-lg">
              Stories, reflections, and resources from our community
            </p>
          </div>
          {canPostKete && (
            <Link to="/kete/new" className="flex-shrink-0">
              <Button variant="primary" size="sm">
                <Plus size={16} aria-hidden="true" />
                New Post
              </Button>
            </Link>
          )}
        </div>

        {drafts.length > 0 && (
          <section className="mb-8">
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">
              Your drafts
            </p>
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {drafts.map((d) => (
                <Link
                  key={d.id}
                  to={`/kete/${d.id}/edit`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors no-underline text-inherit"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {d.title || 'Untitled draft'}
                    </p>
                    <p className="text-xs text-text-light mt-0.5">
                      Draft · last edited {formatDraftDate(d.updatedAt as Date)}
                    </p>
                  </div>
                  <Pencil size={16} className="text-text-light" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

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
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden"
              >
                <KeteCard post={post} />
              </div>
            ))}
          </FadeIn>
        )}
      </div>
    </PullToRefresh>
  )
}
