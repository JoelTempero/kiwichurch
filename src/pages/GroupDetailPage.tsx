import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  useGathering,
  useGatheringMembers,
  useBoardPosts,
  useBoardPostsSubscription,
  useJoinGathering,
  useLeaveGathering,
  useCreateBoardPost
} from '@/hooks/useGatherings'
import { BoardPost } from '@/components/groups'
import { Button, EmptyState, Avatar, Skeleton } from '@/components/common'
import { useToast } from '@/components/common/Toast'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const { data: gathering, isLoading: loadingGathering } = useGathering(groupId || null)
  const { data: members = [] } = useGatheringMembers(groupId || null)
  const { data: posts = [], isLoading: loadingPosts } = useBoardPosts(groupId || null)

  // Subscribe to real-time updates
  useBoardPostsSubscription(groupId || null)

  const joinGathering = useJoinGathering()
  const leaveGathering = useLeaveGathering()
  const createPost = useCreateBoardPost()

  const isMember = useMemo(() => {
    return members.some(m => m.id === user?.id)
  }, [members, user?.id])

  const handleJoin = async () => {
    if (!user?.id || !groupId) return
    try {
      await joinGathering.mutateAsync({ gatheringId: groupId, userId: user.id })
      showToast('Joined group!', 'success')
    } catch (error) {
      showToast('Failed to join group', 'error')
    }
  }

  const handleLeave = async () => {
    if (!user?.id || !groupId) return
    if (!confirm('Are you sure you want to leave this group?')) return
    try {
      await leaveGathering.mutateAsync({ gatheringId: groupId, userId: user.id })
      showToast('Left group', 'success')
    } catch (error) {
      showToast('Failed to leave group', 'error')
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || !user || !groupId) return

    setIsPosting(true)
    try {
      await createPost.mutateAsync({
        gatheringId: groupId,
        postData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content: newPostContent.trim()
        }
      })
      setNewPostContent('')
      showToast('Post created!', 'success')
    } catch (error) {
      showToast('Failed to create post', 'error')
    } finally {
      setIsPosting(false)
    }
  }

  if (loadingGathering) {
    return (
      <div className="group-detail-page">
        <div className="group-detail-header">
          <Skeleton variant="rectangular" height={120} />
        </div>
        <div className="group-detail-content">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    )
  }

  if (!gathering) {
    return (
      <div className="group-detail-page">
        <EmptyState
          icon="users"
          title="Group not found"
          message="This group may have been removed"
          action={
            <Button variant="primary" onClick={() => navigate('/groups')}>
              Back to Groups
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="group-detail-page">
      {/* Header */}
      <div
        className="group-detail-header"
        style={{ backgroundColor: gathering.color || 'var(--color-forest)' }}
      >
        <button className="group-detail-back" onClick={() => navigate('/groups')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="group-detail-header-content">
          <h1 className="group-detail-title">{gathering.name}</h1>
          {gathering.rhythm && (
            <p className="group-detail-rhythm">{gathering.rhythm}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="group-detail-info">
        {gathering.description && (
          <p className="group-detail-description">{gathering.description}</p>
        )}

        <div className="group-detail-meta">
          {gathering.location && (
            <div className="group-detail-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{gathering.location}</span>
            </div>
          )}
          <div className="group-detail-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          </div>
        </div>

        {/* Join/Leave Button */}
        <div className="group-detail-actions">
          {isMember ? (
            <Button variant="outline" onClick={handleLeave} loading={leaveGathering.isPending}>
              Leave Group
            </Button>
          ) : (
            <Button variant="primary" onClick={handleJoin} loading={joinGathering.isPending}>
              Join Group
            </Button>
          )}
        </div>
      </div>

      {/* Message Board */}
      {isMember && (
        <div className="group-detail-board">
          <h2 className="group-detail-section-title">Message Board</h2>

          {/* New Post Form */}
          <form onSubmit={handleCreatePost} className="board-post-form">
            <div className="board-post-form-header">
              <Avatar src={user?.photoURL} name={user?.displayName} size="md" />
              <textarea
                className="form-textarea"
                placeholder="Share something with the group..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
            </div>
            <div className="board-post-form-actions">
              <Button
                type="submit"
                variant="primary"
                loading={isPosting}
                disabled={!newPostContent.trim()}
              >
                Post
              </Button>
            </div>
          </form>

          {/* Posts */}
          {loadingPosts ? (
            <div className="board-posts-loading">
              <Skeleton variant="rectangular" height={120} />
              <Skeleton variant="rectangular" height={120} />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon="message"
              title="No posts yet"
              message="Be the first to share something!"
            />
          ) : (
            <div className="board-posts">
              {posts.map(post => (
                <BoardPost
                  key={post.id}
                  post={post}
                  gatheringId={groupId!}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Not a member message */}
      {!isMember && gathering.isPublic && (
        <div className="group-detail-join-prompt">
          <EmptyState
            icon="users"
            title="Join to participate"
            message="Join this group to see the message board and connect with members"
          />
        </div>
      )}
    </div>
  )
}
