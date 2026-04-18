import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useKetePost, useKeteComments, useAddKeteComment, useDeleteKeteComment } from '@/hooks/useKete'
import { Avatar, Button, EmptyState, Skeleton } from '@/components/common'
import { useToast } from '@/components/common/Toast'

function formatDate(date: Date | { toDate: () => Date } | null): string {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTimeAgo(date: Date | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

export function KetePostPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: post, isLoading: loadingPost } = useKetePost(postId || null)
  const { data: comments = [], isLoading: loadingComments } = useKeteComments(postId || null)

  const addComment = useAddKeteComment()
  const deleteComment = useDeleteKeteComment()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || !postId) return

    setIsSubmitting(true)
    try {
      await addComment.mutateAsync({
        postId,
        commentData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content: newComment.trim()
        }
      })
      setNewComment('')
      showToast('Comment added', 'success')
    } catch (error) {
      showToast('Failed to add comment', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!postId || !confirm('Delete this comment?')) return

    try {
      await deleteComment.mutateAsync({ postId, commentId })
      showToast('Comment deleted', 'success')
    } catch (error) {
      showToast('Failed to delete comment', 'error')
    }
  }

  if (loadingPost) {
    return (
      <div className="max-w-[700px] mx-auto">
        <Skeleton variant="rectangular" height={300} />
        <div className="p-8">
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" count={5} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-[700px] mx-auto">
        <EmptyState
          icon="book"
          title="Post not found"
          message="This post may have been removed or is not published"
          action={
            <Button variant="primary" onClick={() => navigate('/kete')}>
              Back to Kete
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Back button */}
      <button
        className="flex items-center gap-1 text-text-light hover:text-forest transition-colors px-4 py-3 bg-transparent border-none cursor-pointer text-sm"
        onClick={() => navigate('/kete')}
      >
        <ChevronLeft size={20} />
        Back to Kete
      </button>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="w-full aspect-video overflow-hidden">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="text-2xl font-display text-forest mb-3">{post.title}</h1>
        <div className="flex items-center gap-3">
          <Avatar src={post.authorPhotoURL} name={post.authorName} size="md" />
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary text-sm">{post.authorName}</span>
            <span className="text-xs text-text-light">{formatDate(post.publishedAt as Date)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article
        className="px-6 py-2 prose prose-forest max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments */}
      <section className="px-6 py-6 border-t border-cream-dark">
        <h2 className="text-lg font-display text-forest mb-4">
          Comments ({comments.length})
        </h2>

        {/* Comment form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="flex gap-3 mb-6">
            <Avatar src={user.photoURL} name={user.displayName} size="md" />
            <div className="flex-1 space-y-2">
              <textarea
                className="w-full px-4 py-2.5 rounded-sm border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest resize-y"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </form>
        )}

        {/* Comments list */}
        {loadingComments ? (
          <div className="space-y-3">
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-text-light py-4">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <Avatar src={comment.authorPhotoURL} name={comment.authorName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">{comment.authorName}</span>
                    <span className="text-xs text-text-lighter">
                      {formatTimeAgo(comment.createdAt as Date)}
                    </span>
                    {(user?.id === comment.authorId || isAdminOrHost) && (
                      <button
                        className="p-0.5 text-text-lighter hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer ml-auto"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed m-0">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
