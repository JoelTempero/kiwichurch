import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Users, BarChart3, Plus, X, Image as ImageIcon } from 'lucide-react'
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
import { BoardPost, GroupMembersList } from '@/components/groups'
import { Button, EmptyState, Avatar, Spinner, MentionInput, ConfirmModal } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { encodeMention, extractMentionIds } from '@/utils/mentions'
import type { MentionMember } from '@/components/common/MentionInput'
import GroupResourcesList from '@/components/groups/GroupResourcesList'
import { storageService } from '@/services/firebase/storage'
import { isCommunityGathering } from '@/utils/community'
import { Timestamp } from 'firebase/firestore'
import { useFileDrop } from '@/hooks/useFileDrop'
import { cn } from '@/utils/cn'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (groupId && isCommunityGathering(groupId)) {
      navigate('/home', { replace: true })
    }
  }, [groupId, navigate])

  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postMentions, setPostMentions] = useState<Map<string, string>>(new Map())
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [activeTab, setActiveTab] = useState<'board' | 'files' | 'members'>('board')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const attachmentRef = useRef<HTMLInputElement>(null)

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

  const canManageMembers = useMemo(() => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (gathering?.hostId && gathering.hostId === user.id) return true
    if (user.hostedGatherings?.includes(groupId || '')) return true
    return false
  }, [user, gathering?.hostId, groupId])

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (a.pinned && b.pinned) {
      const at = a.pinnedAt instanceof Date ? a.pinnedAt : (a.pinnedAt as Timestamp)?.toDate() ?? new Date(0)
      const bt = b.pinnedAt instanceof Date ? b.pinnedAt : (b.pinnedAt as Timestamp)?.toDate() ?? new Date(0)
      return bt.getTime() - at.getTime()
    }
    return 0
  }), [posts])

  const mentionMembers: MentionMember[] = useMemo(() => {
    return memberProfiles
      .filter(m => m.id !== user?.id)
      .map(m => ({ id: m.id, displayName: m.displayName, photoURL: m.photoURL }))
  }, [memberProfiles, user?.id])

  const handleMentionsChange = useCallback((mentions: Map<string, string>) => {
    setPostMentions(mentions)
  }, [])

  const applyAttachmentFile = useCallback((file: File) => {
    setAttachmentFile(file)
    setAttachmentPreview(URL.createObjectURL(file))
  }, [])

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Only images can be attached to posts', 'error')
      return
    }
    applyAttachmentFile(file)
  }

  const { isDraggingOver, dropHandlers } = useFileDrop({
    onFile: applyAttachmentFile,
    accept: (f) => f.type.startsWith('image/'),
    onReject: () => showToast('Only images can be attached to posts', 'error'),
  })

  const clearAttachment = () => {
    setAttachmentFile(null)
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview)
    setAttachmentPreview(null)
    if (attachmentRef.current) attachmentRef.current.value = ''
  }

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

      let attachmentURL: string | undefined
      let attachmentType: string | undefined
      let attachmentName: string | undefined

      if (attachmentFile) {
        const tempId = crypto.randomUUID()
        const result = await storageService.uploadBoardAttachment(groupId, tempId, attachmentFile)
        attachmentURL = result.url
        attachmentType = attachmentFile.type
        attachmentName = attachmentFile.name
      }

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
          attachmentURL,
          attachmentType,
          attachmentName,
        }
      })
      setNewPostContent('')
      setPostMentions(new Map())
      setShowPollCreator(false)
      setPollQuestion('')
      setPollOptions(['', ''])
      clearAttachment()
      showToast('Post created!', 'success')
    } catch (err) {
      console.error('Failed to create post:', err)
      showToast('Failed to create post', 'error')
    } finally {
      setIsPosting(false)
    }
  }

  if (loadingGathering) {
    return <Spinner />
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

      {/* Group Content */}
      {isMember && (
        <div className="px-4 pb-8">
          {/* Tab switcher */}
          <div className="mb-4 flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'board'
                  ? 'border-b-2 border-[#1a3a2f] text-[#1a3a2f]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'border-b-2 border-[#1a3a2f] text-[#1a3a2f]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#1a3a2f] text-[#1a3a2f]'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Members
            </button>
          </div>

          {activeTab === 'board' && (
            <>
              {/* New Post Form */}
              <form
                onSubmit={handleCreatePost}
                {...dropHandlers}
                className={cn(
                  'bg-[#faf8f4] border rounded-lg p-4 mb-4 transition-colors',
                  isDraggingOver ? 'border-forest border-dashed bg-forest/5' : 'border-[#e0dbd2]'
                )}
              >
                <input
                  ref={attachmentRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
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
                {attachmentPreview && (
                  <div className="relative inline-block mb-3 ml-[52px]">
                    <img src={attachmentPreview} alt="Preview" className="h-20 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={clearAttachment}
                      className="absolute -right-1 -top-1 rounded-full bg-stone-800 p-0.5 text-white hover:bg-stone-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPollCreator(!showPollCreator)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${showPollCreator ? 'text-forest' : 'text-text-light hover:text-forest'}`}
                      title="Add poll"
                    >
                      <BarChart3 size={16} />
                      Poll
                    </button>
                    <button
                      type="button"
                      onClick={() => attachmentRef.current?.click()}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${attachmentFile ? 'text-forest' : 'text-text-light hover:text-forest'}`}
                      title="Attach image"
                    >
                      <ImageIcon size={16} />
                      Image
                    </button>
                  </div>
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
                <Spinner />
              ) : posts.length === 0 ? (
                <EmptyState
                  icon="message"
                  title="No posts yet"
                  message="Be the first to share something!"
                />
              ) : (
                <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
                  {sortedPosts.map(post => (
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
            </>
          )}

          {activeTab === 'files' && (
            <GroupResourcesList
              gatheringId={groupId!}
              isAdminOrHost={isAdminOrHost}
            />
          )}

          {activeTab === 'members' && (
            <GroupMembersList
              gatheringId={groupId!}
              gatheringName={gathering.name}
              hostId={gathering.hostId}
              currentUserId={user?.id}
              canManage={canManageMembers}
            />
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
