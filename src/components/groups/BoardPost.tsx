import { useState, useRef, useEffect } from 'react'
import { Avatar, Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import {
  usePostComments,
  useAddPostComment,
  useUpdateBoardPost,
  useDeleteBoardPost,
  useDeletePostComment
} from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import type { BoardPost as BoardPostType, BoardComment } from '@/types'

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
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: comments = [] } = usePostComments(
    showComments ? gatheringId : null,
    showComments ? post.id : null
  )
  const addComment = useAddPostComment()
  const updatePost = useUpdateBoardPost()
  const deletePost = useDeleteBoardPost()
  const deleteComment = useDeletePostComment()

  const canEdit = user?.id === post.authorId
  const canDelete = user?.id === post.authorId || isAdminOrHost

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus edit input when editing
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(editContent.length, editContent.length)
    }
  }, [isEditing])

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

  const handleEditPost = () => {
    setEditContent(post.content)
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      showToast('Post content cannot be empty', 'error')
      return
    }

    try {
      await updatePost.mutateAsync({
        gatheringId,
        postId: post.id,
        updates: { content: editContent.trim() }
      })
      setIsEditing(false)
      showToast('Post updated', 'success')
    } catch (error) {
      showToast('Failed to update post', 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditContent(post.content)
    setIsEditing(false)
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setShowMenu(false)

    try {
      await deletePost.mutateAsync({ gatheringId, postId: post.id })
      showToast('Post deleted', 'success')
      onDelete?.()
    } catch (error) {
      showToast('Failed to delete post', 'error')
    }
  }

  const handleEditComment = (comment: BoardComment) => {
    setEditingCommentId(comment.id)
    setEditCommentContent(comment.content)
  }

  const handleSaveCommentEdit = async () => {
    if (!editCommentContent.trim()) {
      showToast('Comment cannot be empty', 'error')
      return
    }

    // Note: Would need to add updatePostComment to db service and hook
    // For now, we'll just close the edit mode
    setEditingCommentId(null)
    showToast('Comment editing coming soon', 'warning')
  }

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
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
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" aria-hidden="true">
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
            {post.updatedAt && post.updatedAt !== post.createdAt && ' (edited)'}
          </span>
        </div>
        {(canEdit || canDelete) && (
          <div className="board-post-menu-wrapper" ref={menuRef}>
            <button
              className="board-post-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
              aria-expanded={showMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {showMenu && (
              <div className="board-post-dropdown" role="menu">
                {canEdit && (
                  <button
                    className="board-post-dropdown-item"
                    onClick={handleEditPost}
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    className="board-post-dropdown-item board-post-dropdown-danger"
                    onClick={handleDeletePost}
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="board-post-content">
        {isEditing ? (
          <div className="board-post-edit">
            <textarea
              ref={editInputRef}
              className="form-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              aria-label="Edit post content"
            />
            <div className="board-post-edit-actions">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                loading={updatePost.isPending}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updatePost.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="board-post-actions">
        <button
          className="board-post-action"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length > 0 ? `${comments.length} comments` : 'Comment'}
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
                    <div className="board-comment-actions">
                      {user?.id === comment.authorId && (
                        <button
                          className="board-comment-action"
                          onClick={() => handleEditComment(comment)}
                          aria-label="Edit comment"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="board-comment-action board-comment-delete"
                        onClick={() => handleDeleteComment(comment.id)}
                        aria-label="Delete comment"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="board-comment-edit">
                    <input
                      type="text"
                      className="form-input"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      aria-label="Edit comment"
                    />
                    <div className="board-comment-edit-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveCommentEdit}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelCommentEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p>{comment.content}</p>
                )}
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
              aria-label="Write a comment"
            />
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting} disabled={!newComment.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
