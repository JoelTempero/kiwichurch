import { useState, useRef, useEffect, useCallback } from 'react'
import { Pin, MoreVertical, Edit, Trash2, MessageCircle, X, Reply, BarChart3, SmilePlus, Flag } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Avatar, Button, MentionInput, ConfirmModal } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import {
  usePostComments,
  usePostCommentsSubscription,
  useAddPostComment,
  useUpdateBoardPost,
  useDeleteBoardPost,
  useDeletePostComment,
  useVotePoll,
  useToggleReaction
} from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import { parseMentions, encodeMention, extractMentionIds } from '@/utils/mentions'
import type { BoardPost as BoardPostType, BoardComment } from '@/types'
import type { MentionMember } from '@/components/common/MentionInput'
import { ReportModal } from './ReportModal'
import URLEmbed from './URLEmbed'

interface BoardPostProps {
  post: BoardPostType
  gatheringId: string
  gatheringName: string
  members: MentionMember[]
  onDelete?: () => void
}

function formatTimeAgo(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return 'Just now'
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

function RichContent({ content }: { content: string }) {
  const segments = parseMentions(content)
  return (
    <p className="text-text-primary leading-relaxed">
      {segments.map((seg, i) =>
        seg.type === 'mention' ? (
          <span key={i} className="font-semibold text-forest">@{seg.content}</span>
        ) : seg.type === 'groupMention' ? (
          <span key={i} className="font-semibold text-terracotta">@{seg.content}</span>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </p>
  )
}

function ReplyQuote({ comment }: { comment: BoardComment | undefined }) {
  if (!comment) return null
  const preview = comment.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1')
  return (
    <div className="flex items-start gap-1.5 text-xs text-text-light mb-1 pl-1 border-l-2 border-sage-light">
      <Reply size={12} className="flex-shrink-0 mt-0.5 rotate-180" />
      <span>
        <span className="font-semibold">{comment.authorName}</span>
        {': '}
        {preview.length > 60 ? preview.slice(0, 60) + '...' : preview}
      </span>
    </div>
  )
}

const REACTION_EMOJIS = ['❤️', '🙏', '👍', '😂', '🎉', '😢']

export function BoardPost({ post, gatheringId, gatheringName, members, onDelete }: BoardPostProps) {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentMentions, setCommentMentions] = useState<Map<string, string>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [replyTo, setReplyTo] = useState<BoardComment | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: comments = [] } = usePostComments(
    showComments ? gatheringId : null,
    showComments ? post.id : null
  )
  usePostCommentsSubscription(
    showComments ? gatheringId : null,
    showComments ? post.id : null
  )

  const addComment = useAddPostComment()
  const updatePost = useUpdateBoardPost()
  const deletePost = useDeleteBoardPost()
  const deleteComment = useDeletePostComment()
  const votePoll = useVotePoll()
  const toggleReaction = useToggleReaction()

  const canEdit = user?.id === post.authorId
  const canDelete = user?.id === post.authorId || isAdminOrHost

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(editContent.length, editContent.length)
    }
  }, [isEditing])

  const handleMentionsChange = useCallback((mentions: Map<string, string>) => {
    setCommentMentions(mentions)
  }, [])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      let content = newComment.trim()
      for (const [displayName, userId] of commentMentions) {
        content = content.replace(
          new RegExp(`@${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\])`, 'g'),
          encodeMention(displayName, userId)
        )
      }

      const mentionIds = extractMentionIds(content)

      await addComment.mutateAsync({
        gatheringId,
        gatheringName,
        postId: post.id,
        postAuthorId: post.authorId,
        commentData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content,
          mentions: mentionIds.length > 0 ? mentionIds : undefined,
          replyToId: replyTo?.id,
          replyToAuthorName: replyTo?.authorName,
          replyToAuthorId: replyTo?.authorId,
        }
      })
      setNewComment('')
      setCommentMentions(new Map())
      setReplyTo(null)
    } catch (err) {
      console.error('Failed to add comment:', err)
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
    } catch {
      showToast('Failed to update post', 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditContent(post.content)
    setIsEditing(false)
  }

  const handleDeletePost = async () => {
    try {
      await deletePost.mutateAsync({ gatheringId, postId: post.id })
      setShowDeletePostConfirm(false)
      showToast('Post deleted', 'success')
      onDelete?.()
    } catch {
      showToast('Failed to delete post', 'error')
    }
  }

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return
    try {
      await deleteComment.mutateAsync({ gatheringId, postId: post.id, commentId: deleteCommentId })
      setDeleteCommentId(null)
      showToast('Comment deleted', 'success')
    } catch {
      showToast('Failed to delete comment', 'error')
    }
  }

  const handleReply = (comment: BoardComment) => {
    setReplyTo(comment)
    setShowComments(true)
  }

  return (
    <div className={cn(
      'p-4',
      post.pinned && 'bg-cream/50'
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
        {user && (
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
              <div className="absolute right-0 top-full mt-1 bg-white rounded-md border border-[#e0dbd2] py-1 min-w-[120px] z-10" role="menu">
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
                    onClick={() => { setShowMenu(false); setShowDeletePostConfirm(true) }}
                    role="menuitem"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                {user.id !== post.authorId && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-cream transition-colors text-left"
                    onClick={() => {
                      setShowMenu(false)
                      setShowReportModal(true)
                    }}
                    role="menuitem"
                  >
                    <Flag size={16} />
                    Report
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
              <Button variant="primary" size="sm" onClick={handleSaveEdit} loading={updatePost.isPending}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={updatePost.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <RichContent content={post.content} />
            <URLEmbed text={post.content} />
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

      {/* Poll */}
      {post.poll && (
        <div className="mb-3 p-3 bg-cream/30 rounded-md">
          <p className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-forest" />
            {post.poll.question}
          </p>
          {post.poll.options.map((option, i) => {
            const totalVotes = Object.keys(post.poll!.votes || {}).length
            const optionVotes = Object.values(post.poll!.votes || {}).filter(v => v === i).length
            const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
            const userVote = user?.id ? post.poll!.votes?.[user.id] : undefined
            const hasVoted = userVote !== undefined
            const isSelected = userVote === i

            return (
              <button
                key={i}
                onClick={() => {
                  if (!user?.id || hasVoted) return
                  votePoll.mutate({ gatheringId, postId: post.id, userId: user.id, optionIndex: i })
                }}
                disabled={hasVoted}
                className={cn(
                  'relative w-full text-left px-3 py-2 mb-1 rounded-md text-sm transition-colors overflow-hidden',
                  hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-cream',
                  isSelected ? 'ring-1 ring-forest/40 font-semibold' : 'border border-sage-light'
                )}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-forest/10 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <span className="relative flex justify-between">
                  <span>{option}</span>
                  {hasVoted && <span className="text-text-light">{pct}%</span>}
                </span>
              </button>
            )
          })}
          <p className="text-xs text-text-lighter mt-1">
            {Object.keys(post.poll.votes || {}).length} vote{Object.keys(post.poll.votes || {}).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Reactions */}
      {post.reactions && Object.keys(post.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.entries(post.reactions).map(([emoji, userIds]) => (
            <button
              key={emoji}
              onClick={() => user?.id && toggleReaction.mutate({ gatheringId, postId: post.id, emoji, userId: user.id })}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                userIds.includes(user?.id || '')
                  ? 'border-forest/30 bg-forest/10 text-forest'
                  : 'border-cream-dark bg-white text-text-light hover:bg-cream'
              )}
            >
              <span>{emoji}</span>
              <span>{userIds.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-cream-dark pt-2 flex items-center gap-3">
        <button
          className="flex items-center gap-1.5 text-sm text-text-light hover:text-forest transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
        >
          <MessageCircle size={16} />
          {comments.length > 0 ? `${comments.length} comments` : 'Comment'}
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-1 text-sm text-text-light hover:text-forest transition-colors bg-transparent border-none cursor-pointer"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
          >
            <SmilePlus size={16} />
          </button>
          {showReactionPicker && (
            <div className="absolute bottom-full mb-1 left-0 flex gap-1 bg-white rounded-full shadow-lg border border-cream px-2 py-1 z-10">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    if (!user?.id) return
                    toggleReaction.mutate({ gatheringId, postId: post.id, emoji, userId: user.id })
                    setShowReactionPicker(false)
                  }}
                  className="text-lg hover:scale-125 transition-transform p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
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
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      className="p-0.5 text-text-lighter hover:text-forest transition-colors bg-transparent border-none cursor-pointer"
                      onClick={() => handleReply(comment)}
                      aria-label={`Reply to ${comment.authorName}`}
                      title="Reply"
                    >
                      <Reply size={12} />
                    </button>
                    {(user?.id === comment.authorId || isAdminOrHost) && (
                      <button
                        className="p-0.5 text-text-lighter hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                        onClick={() => setDeleteCommentId(comment.id)}
                        aria-label="Delete comment"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {comment.replyToId && (
                  <ReplyQuote comment={comments.find(c => c.id === comment.replyToId)} />
                )}
                <RichContent content={comment.content} />
              </div>
            </div>
          ))}

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-cream rounded-md text-sm">
              <Reply size={14} className="text-forest" />
              <span className="text-text-light">
                Replying to <span className="font-semibold text-text-primary">{replyTo.authorName}</span>
              </span>
              <button
                className="ml-auto p-0.5 text-text-lighter hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="flex gap-2 items-start pt-2">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              onMentionsChange={handleMentionsChange}
              members={members}
              placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Write a comment...'}
              disabled={isSubmitting}
              singleLine
              ariaLabel="Write a comment"
            />
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting} disabled={!newComment.trim()}>
              Post
            </Button>
          </form>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={post.id}
        targetAuthorId={post.authorId}
        targetAuthorName={post.authorName}
        targetContent={post.content}
        contextId={gatheringId}
        contextName={gatheringName}
      />

      <ConfirmModal
        isOpen={showDeletePostConfirm}
        onClose={() => setShowDeletePostConfirm(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deletePost.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteComment.isPending}
      />
    </div>
  )
}
