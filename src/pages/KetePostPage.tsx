import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
      <div className="kete-post-page">
        <Skeleton variant="rectangular" height={300} />
        <div style={{ padding: '2rem' }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" count={5} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="kete-post-page">
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
    <div className="kete-post-page">
      {/* Back button */}
      <button className="kete-post-back" onClick={() => navigate('/kete')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Kete
      </button>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="kete-post-image">
          <img src={post.featuredImage} alt={post.title} />
        </div>
      )}

      {/* Header */}
      <header className="kete-post-header">
        <h1 className="kete-post-title">{post.title}</h1>
        <div className="kete-post-meta">
          <Avatar src={post.authorPhotoURL} name={post.authorName} size="md" />
          <div className="kete-post-author-info">
            <span className="kete-post-author-name">{post.authorName}</span>
            <span className="kete-post-date">{formatDate(post.publishedAt as Date)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article
        className="kete-post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments */}
      <section className="kete-post-comments">
        <h2 className="kete-post-comments-title">
          Comments ({comments.length})
        </h2>

        {/* Comment form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="kete-comment-form">
            <Avatar src={user.photoURL} name={user.displayName} size="md" />
            <div className="kete-comment-form-input">
              <textarea
                className="form-textarea"
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
          <div className="kete-comments-loading">
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={80} />
          </div>
        ) : comments.length === 0 ? (
          <p className="kete-comments-empty">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="kete-comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="kete-comment">
                <Avatar src={comment.authorPhotoURL} name={comment.authorName} size="md" />
                <div className="kete-comment-content">
                  <div className="kete-comment-header">
                    <span className="kete-comment-author">{comment.authorName}</span>
                    <span className="kete-comment-time">
                      {formatTimeAgo(comment.createdAt as Date)}
                    </span>
                    {(user?.id === comment.authorId || isAdminOrHost) && (
                      <button
                        className="kete-comment-delete"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="kete-comment-text">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
