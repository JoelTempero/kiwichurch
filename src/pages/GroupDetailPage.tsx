import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Users, BarChart3, Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useGathering,
  useGatheringMembers,
  useGatheringMemberProfiles,
  useBoardPosts,
  useBoardPostsSubscription,
  useJoinGathering,
  useLeaveGathering,
  useCreateBoardPost
} from '@/hooks/useGatherings'
import { BoardPost } from '@/components/groups'
import { Button, EmptyState, Avatar, Skeleton, MentionInput, ConfirmModal } from '@/components/common'
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])

  const { data: gathering, isLoading: loadingGathering } = useGathering(groupId || null)
  const { data: members = [] } = useGatheringMembers(groupId || null)
  const { data: memberProfiles = [] } = useGatheringMemberProfiles(groupId || null)
  const { data: posts = [], isLoading: loadingPosts } = useBoardPosts(groupId || null)

  useBoardPostsSubscription(groupId || null)

  const joinGathering = useJoinGathering()
  const leaveGathering = useLeaveGathering()
  const createPost = useCreateBoardPost()

  const isMember = useMemo(() => {
    return members.some(m => m.id === user?.id)
  }, [members, user?.id])

  const mentionMembers: MentionMember[] = useMemo(() => {
    return memberProfiles
      .filter(m => m.id !== user?.id)
      .map(m => ({ id: m.id, displayName: m.displayName, photoURL: m.photoURL }))
  }, [memberProfiles, user?.id])

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
    try {
      await leaveGathering.mutateAsync({ gatheringId: groupId, userId: user.id })
      setShowLeaveConfirm(false)
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

      const validPollOptions = pollOptions.map(o => o.trim()).filter(Boolean)
      const pollData = showPollCreator && pollQuestion.trim() && validPollOptions.length >= 2
        ? { question: pollQuestion.trim(), options: validPollOptions, votes: {} }
        : undefined

      await createPost.mutateAsync({
        gatheringId: groupId,
        gatheringName: gathering.name,
        postData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content,
          mentions: mentionIds.length > 0 ? mentionIds : undefined,
          poll: pollData,
        }
      })
      setNewPostContent('')
      setPostMentions(new Map())
      setShowPollCreator(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      showToast('Post created!', 'success')
    } catch (err) {
      console.error('Failed to create post:', err)
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
            <Button variant="outline" onClick={() => setShowLeaveConfirm(true)} loading={leaveGathering.isPending}>
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
          <h2 className="text-sm font-semibold text-text-light uppercase tracking-wide mb-2">Message Board</h2>

          {/* New Post Form */}
          <form onSubmit={handleCreatePost} className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-4 mb-4">
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
            {showPollCreator && (
              <div className="mb-3 p-3 bg-cream/50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-forest flex items-center gap-1.5">
                    <BarChart3 size={14} /> Poll
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPollCreator(false)}
                    className="p-0.5 text-text-lighter hover:text-text-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full px-3 py-2 border border-sage-light rounded-md text-sm mb-2 focus:outline-none focus:border-forest"
                />
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions]
                        updated[i] = e.target.value
                        setPollOptions(updated)
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-3 py-1.5 border border-sage-light rounded-md text-sm focus:outline-none focus:border-forest"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                        className="p-1 text-text-lighter hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="flex items-center gap-1 text-xs text-forest hover:text-forest/80 mt-1 transition-colors"
                  >
                    <Plus size={12} /> Add option
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${showPollCreator ? 'text-forest' : 'text-text-light hover:text-forest'}`}
                title="Add poll"
              >
                <BarChart3 size={16} />
                Poll
              </button>
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
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
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
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
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

      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeave}
        title="Leave Group"
        message={`Are you sure you want to leave ${gathering.name}? You can rejoin anytime.`}
        confirmLabel="Leave Group"
        loading={leaveGathering.isPending}
      />
    </div>
  )
}
