import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Users } from 'lucide-react'
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
      <div>
        <div>
          <Skeleton variant="rectangular" height={120} />
        </div>
        <div className="p-4">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    )
  }

  if (!gathering) {
    return (
      <div>
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
    <div>
      {/* Header */}
      <div
        className="relative p-6 pt-12 pb-8 text-white rounded-b-lg"
        style={{ backgroundColor: gathering.color || 'var(--color-forest)' }}
      >
        <button
          className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => navigate('/groups')}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-display text-white mb-1">{gathering.name}</h1>
          {gathering.rhythm && (
            <p className="text-sm text-white/80">{gathering.rhythm}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {gathering.description && (
          <p className="text-text-primary leading-relaxed mb-4">{gathering.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-text-light mb-4">
          {gathering.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={16} />
              <span>{gathering.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          </div>
        </div>

        {/* Join/Leave Button */}
        <div className="mb-6">
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
        <div className="px-4 pb-8">
          <h2 className="text-lg font-display text-forest mb-4">Message Board</h2>

          {/* New Post Form */}
          <form onSubmit={handleCreatePost} className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex gap-3 mb-3">
              <Avatar src={user?.photoURL} name={user?.displayName} size="md" />
              <textarea
                className="w-full px-4 py-3 rounded-sm border border-gray-200 text-base resize-y focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                placeholder="Share something with the group..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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
        <div className="px-4 py-8">
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
