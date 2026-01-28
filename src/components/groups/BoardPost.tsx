import { useState } from 'react'
import { Avatar, Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import { usePostComments, useAddPostComment, useDeleteBoardPost, useDeletePostComment } from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import type { BoardPost as BoardPostType } from '@/types'

interface BoardPostProps {
  post: BoardPostType
  gatheringId: string
  onDelete?: () => void
}

function formatTimeAgo(date: Date | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

export function BoardPost({ post, gatheringId, onDelete }: BoardPostProps) {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: comments = [] } = usePostComments(
    showComments ? gatheringId : null,
    showComments ? post.id : null
  )
  const addComment = useAddPostComment()
  const deletePost = useDeleteBoardPost()
  const deleteComment = useDeletePostComment()

  const canDelete = user?.id === post.authorId || isAdminOrHost

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await addComment.mutateAsync({
        gatheringId,
        postId: post.id,
        commentData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content: newComment.trim()
        }
      })
      setNewComment('')
    } catch (error) {
      showToast('Failed to add comment', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await deletePost.mutateAsync({ gatheringId, postId: post.id })
      showToast('Post deleted', 'success')
      onDelete?.()
    } catch (error) {
      showToast('Failed to delete post', 'error')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      await deleteComment.mutateAsync({ gatheringId, postId: post.id, commentId })
      showToast('Comment deleted', 'success')
    } catch (error) {
      showToast('Failed to delete comment', 'error')
    }
  }

  return (
    <div className={`board-post ${post.pinned ? 'board-post-pinned' : ''}`}>
      {post.pinned && (
        <div className="board-post-pinned-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          Pinned
        </div>
      )}

      <div className="board-post-header">
        <Avatar src={post.authorPhotoURL} name={post.authorName} size="md" />
        <div className="board-post-author">
          <span className="board-post-author-name">{post.authorName}</span>
          <span className="board-post-time">
            {formatTimeAgo(post.createdAt as Date)}
          </span>
        </div>
        {canDelete && (
          <button className="board-post-menu" onClick={handleDeletePost} title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>

      <div className="board-post-content">
        <p>{post.content}</p>
        {post.attachmentURL && (
          <div className="board-post-attachment">
            {post.attachmentType?.startsWith('image/') ? (
              <img src={post.attachmentURL} alt="Attachment" />
            ) : (
              <a href={post.attachmentURL} target="_blank" rel="noopener noreferrer">
                {post.attachmentName || 'View attachment'}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="board-post-actions">
        <button
          className="board-post-action"
          onClick={() => setShowComments(!showComments)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {showComments ? 'Hide comments' : 'Comments'}
        </button>
      </div>

      {showComments && (
        <div className="board-post-comments">
          {comments.map((comment) => (
            <div key={comment.id} className="board-comment">
              <Avatar src={comment.authorPhotoURL} name={comment.authorName} size="sm" />
              <div className="board-comment-content">
                <div className="board-comment-header">
                  <span className="board-comment-author">{comment.authorName}</span>
                  <span className="board-comment-time">
                    {formatTimeAgo(comment.createdAt as Date)}
                  </span>
                  {(user?.id === comment.authorId || isAdminOrHost) && (
                    <button
                      className="board-comment-delete"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmitComment} className="board-comment-form">
            <input
              type="text"
              className="form-input"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Post
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
