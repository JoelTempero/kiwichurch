import { useState, useMemo, useCallback } from 'react'
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
import { Button, EmptyState, Avatar, Skeleton, MentionInput } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { encodeMention, extractMentionIds } from '@/utils/mentions'
import type { MentionMember } from '@/components/common/MentionInput'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postMentions, setPostMentions] = useState<Map<string, string>>(new Map())

  const { data: gathering, isLoading: loadingGathering } = useGathering(groupId || null)
  const { data: members = [] } = useGatheringMembers(groupId || null)
  const { data: posts = [], isLoading: loadingPosts } = useBoardPosts(groupId || null)

  useBoardPostsSubscription(groupId || null)

  const joinGathering = useJoinGathering()
  const leaveGathering = useLeaveGathering()
  const createPost = useCreateBoardPost()

  const isMember = useMemo(() => {
    return members.some(m => m.id === user?.id)
  }, [members, user?.id])

  const mentionMembers: MentionMember[] = useMemo(() => {
    return members
      .filter(m => m.id !== user?.id)
      .map(m => ({ id: m.id, displayName: (m as any).displayName || m.id }))
  }, [members, user?.id])

  const handleMentionsChange = useCallback((mentions: Map<string, string>) => {
    setPostMentions(mentions)
  }, [])

  const handleJoin = async () => {
    if (!user?.id || !groupId) return
    try {
      await joinGathering.mutateAsync({ gatheringId: groupId, userId: user.id })
      showToast('Joined group!', 'success')
    } catch {
      showToast('Failed to join group', 'error')
    }
  }

  const handleLeave = async () => {
    if (!user?.id || !groupId) return
    if (!confirm('Are you sure you want to leave this group?')) return
    try {
      await leaveGathering.mutateAsync({ gatheringId: groupId, userId: user.id })
      showToast('Left group', 'success')
    } catch {
      showToast('Failed to leave group', 'error')
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || !user || !groupId || !gathering) return

    setIsPosting(true)
    try {
      let content = newPostContent.trim()
      for (const [displayName, userId] of postMentions) {
        content = content.replace(
          new RegExp(`@${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\])`, 'g'),
          encodeMention(displayName, userId)
        )
      }

      const mentionIds = extractMentionIds(content)

      await createPost.mutateAsync({
        gatheringId: groupId,
        gatheringName: gathering.name,
        postData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content,
          mentions: mentionIds.length > 0 ? mentionIds : undefined,
        }
      })
      setNewPostContent('')
      setPostMentions(new Map())
      showToast('Post created!', 'success')
    } catch {
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
              <MentionInput
                value={newPostContent}
                onChange={setNewPostContent}
                onMentionsChange={handleMentionsChange}
                members={mentionMembers}
                placeholder="Share something with the group..."
                disabled={isPosting}
                rows={3}
                className="resize-y"
                ariaLabel="New post content"
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
                  gatheringName={gathering.name}
                  members={mentionMembers}
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
