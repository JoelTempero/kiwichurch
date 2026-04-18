import { useState, useRef, useEffect } from 'react'
import { Pin, MoreVertical, Edit, Trash2, MessageCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'
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
    <div className={cn(
      'bg-white rounded-lg shadow-sm p-4 mb-3',
      post.pinned && 'ring-1 ring-gold/50 bg-gold/5'
    )}>
      {post.pinned && (
        <div className="flex items-center gap-1 text-xs text-gold font-semibold mb-2">
          <Pin size={12} fill="currentColor" />
          Pinned
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <Avatar src={post.authorPhotoURL} name={post.authorName} size="md" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-text-primary text-sm">{post.authorName}</span>
          <span className="text-xs text-text-lighter block">
            {formatTimeAgo(post.createdAt as Date)}
            {post.updatedAt && post.updatedAt !== post.createdAt && ' (edited)'}
          </span>
        </div>
        {(canEdit || canDelete) && (
          <div className="relative" ref={menuRef}>
            <button
              className="p-1 rounded-full hover:bg-cream transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
              aria-expanded={showMenu}
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-md py-1 min-w-[120px] z-10" role="menu">
                {canEdit && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-cream transition-colors text-left"
                    onClick={handleEditPost}
                    role="menuitem"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    onClick={handleDeletePost}
                    role="menuitem"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editInputRef}
              className="w-full px-4 py-3 rounded-sm border border-gray-200 text-base resize-y focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              aria-label="Edit post content"
            />
            <div className="flex gap-2">
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
            <p className="text-text-primary leading-relaxed">{post.content}</p>
            {post.attachmentURL && (
              <div className="rounded-md overflow-hidden mt-2">
                {post.attachmentType?.startsWith('image/') ? (
                  <img src={post.attachmentURL} alt="Attachment" className="w-full rounded-md" />
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

      <div className="border-t border-cream-dark pt-2">
        <button
          className="flex items-center gap-1.5 text-sm text-text-light hover:text-forest transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
        >
          <MessageCircle size={16} />
          {comments.length > 0 ? `${comments.length} comments` : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-cream-dark space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar src={comment.authorPhotoURL} name={comment.authorName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-text-primary">{comment.authorName}</span>
                  <span className="text-xs text-text-lighter">
                    {formatTimeAgo(comment.createdAt as Date)}
                  </span>
                  {(user?.id === comment.authorId || isAdminOrHost) && (
                    <div className="flex items-center gap-1 ml-auto">
                      {user?.id === comment.authorId && (
                        <button
                          className="p-0.5 text-text-lighter hover:text-text-light transition-colors bg-transparent border-none cursor-pointer"
                          onClick={() => handleEditComment(comment)}
                          aria-label="Edit comment"
                        >
                          <Edit size={12} />
                        </button>
                      )}
                      <button
                        className="p-0.5 text-text-lighter hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                        onClick={() => handleDeleteComment(comment.id)}
                        aria-label="Delete comment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-1 space-y-2">
                    <input
                      type="text"
                      className="form-input"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      aria-label="Edit comment"
                    />
                    <div className="flex gap-2">
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

          <form onSubmit={handleSubmitComment} className="flex gap-2 items-center pt-2">
            <input
              type="text"
              className="form-input flex-1"
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
