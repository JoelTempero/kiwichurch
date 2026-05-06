import { useState, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Settings, BookMarked, BarChart3, Plus, X, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpcomingEvents } from '@/hooks/useEvents'
import {
  useBoardPosts,
  useBoardPostsSubscription,
  useGatheringMemberProfiles,
  useCreateBoardPost
} from '@/hooks/useGatherings'
import { useGroupResources } from '@/hooks/useGroupResources'
import { BoardPost } from '@/components/groups'
import { EventCard } from '@/components/events'
import { Spinner, FadeIn, PullToRefresh, EmptyState, Button, Avatar, MentionInput } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { encodeMention, extractMentionIds } from '@/utils/mentions'
import { COMMUNITY_GATHERING_ID, COMMUNITY_GATHERING_NAME } from '@/utils/community'
import { storageService } from '@/services/firebase/storage'
import type { MentionMember } from '@/components/common/MentionInput'
import type { GroupResource } from '@/types/groupResource'

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
}

function formatResourceDate(resource: GroupResource): string {
  const d = resource.createdAt instanceof Date ? resource.createdAt : resource.createdAt.toDate()
  return d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

export function HomePage() {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const greeting = getTimeBasedGreeting()
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  // Board state
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postMentions, setPostMentions] = useState<Map<string, string>>(new Map())
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [showAllPosts, setShowAllPosts] = useState(false)
  const attachmentRef = useRef<HTMLInputElement>(null)

  // Data
  const { data: events = [], isLoading: loadingEvents, refetch: refetchEvents } = useUpcomingEvents(5)
  const { data: posts = [], isLoading: loadingPosts, refetch: refetchPosts } = useBoardPosts(COMMUNITY_GATHERING_ID)
  const { data: memberProfiles = [] } = useGatheringMemberProfiles(COMMUNITY_GATHERING_ID)
  const { data: resources = [] } = useGroupResources(COMMUNITY_GATHERING_ID)
  const createPost = useCreateBoardPost()

  useBoardPostsSubscription(COMMUNITY_GATHERING_ID)

  const mentionMembers: MentionMember[] = useMemo(() => {
    return memberProfiles
      .filter(m => m.id !== user?.id)
      .map(m => ({ id: m.id, displayName: m.displayName, photoURL: m.photoURL }))
  }, [memberProfiles, user?.id])

  const handleMentionsChange = useCallback((mentions: Map<string, string>) => {
    setPostMentions(mentions)
  }, [])

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Only images can be attached to posts', 'error')
      return
    }
    setAttachmentFile(file)
    setAttachmentPreview(URL.createObjectURL(file))
  }

  const clearAttachment = () => {
    setAttachmentFile(null)
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview)
    setAttachmentPreview(null)
    if (attachmentRef.current) attachmentRef.current.value = ''
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || !user) return

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
        const result = await storageService.uploadBoardAttachment(COMMUNITY_GATHERING_ID, tempId, attachmentFile)
        attachmentURL = result.url
        attachmentType = attachmentFile.type
        attachmentName = attachmentFile.name
      }

      await createPost.mutateAsync({
        gatheringId: COMMUNITY_GATHERING_ID,
        gatheringName: COMMUNITY_GATHERING_NAME,
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
      showToast('Post shared!', 'success')
    } catch (err) {
      console.error('Failed to create post:', err)
      showToast('Failed to create post', 'error')
    } finally {
      setIsPosting(false)
    }
  }

  const handleRefresh = async () => {
    await Promise.all([refetchEvents(), refetchPosts()])
  }

  const [featuredEvent, ...remainingEvents] = events
  const visiblePosts = showAllPosts ? posts : posts.slice(0, 3)
  const latestResources = resources.slice(0, 5)

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="font-display text-2xl text-forest mb-1">{greeting}, {firstName}</h1>

        {/* Community Board */}
        <section className="mt-6">
          <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Community Board</span>

          {/* Post form */}
          <form onSubmit={handleCreatePost} className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-4 mt-3 mb-4">
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
                placeholder="Share something with the community..."
                disabled={isPosting}
                rows={3}
                className="resize-y"
                ariaLabel="New community post"
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
              message="Be the first to share something with the community!"
            />
          ) : (
            <FadeIn>
              <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
                {visiblePosts.map(post => (
                  <BoardPost
                    key={post.id}
                    post={post}
                    gatheringId={COMMUNITY_GATHERING_ID}
                    gatheringName={COMMUNITY_GATHERING_NAME}
                    members={mentionMembers}
                  />
                ))}
              </div>
              {!showAllPosts && posts.length > 3 && (
                <button
                  onClick={() => setShowAllPosts(true)}
                  className="w-full mt-2 py-2 text-sm text-forest hover:text-forest-light transition-colors font-medium"
                >
                  View all {posts.length} posts
                </button>
              )}
            </FadeIn>
          )}
        </section>

        {/* Bottom row: Events + Files (2-col on desktop, stacked on mobile) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Upcoming Events</span>
              <Link to="/events" className="text-sm text-sage font-medium no-underline hover:text-forest">See all →</Link>
            </div>

            {loadingEvents ? (
              <Spinner />
            ) : events.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No upcoming events"
                message="Check the calendar for future events"
                action={<Link to="/events"><Button variant="outline" size="sm">View Calendar</Button></Link>}
              />
            ) : (
              <FadeIn>
                {featuredEvent && (
                  <div className="bg-forest rounded-lg p-4 mb-2 cursor-pointer hover:bg-forest-light transition-colors">
                    <div className="text-xs uppercase tracking-widest text-gold mb-2 font-medium">Next Up</div>
                    <div className="font-semibold text-cream text-lg">{featuredEvent.title}</div>
                    <div className="text-sm text-cream/70 mt-1">
                      {new Date(featuredEvent.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}{formatTime(featuredEvent.time)}
                      {featuredEvent.location && ` · ${featuredEvent.location}`}
                    </div>
                  </div>
                )}
                {remainingEvents.length > 0 && (
                  <div className="divide-y divide-[#e0dbd2]">
                    {remainingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </FadeIn>
            )}
          </section>

          {/* Latest Files */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Latest Files</span>
              <Link to="/groups" className="text-sm text-sage font-medium no-underline hover:text-forest">All groups →</Link>
            </div>

            {latestResources.length === 0 ? (
              <p className="text-sm text-text-light">No shared files yet.</p>
            ) : (
              <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
                {latestResources.map(resource => (
                  <a
                    key={resource.id}
                    href={resource.type === 'file' ? resource.fileURL : resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 px-3 hover:bg-cream/50 transition-colors no-underline text-inherit"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-cream-dark flex items-center justify-center">
                      {resource.type === 'file' ? (
                        <FileText size={16} className="text-text-light" />
                      ) : (
                        <ExternalLink size={16} className="text-text-light" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate m-0">{resource.title}</p>
                      <p className="text-xs text-text-light m-0">{resource.uploadedByName} · {formatResourceDate(resource)}</p>
                    </div>
                  </a>
                ))}
              </FadeIn>
            )}
          </section>
        </div>

        {/* Admin Quick Links */}
        {isAdminOrHost && (
          <section className="mt-8 mb-4">
            <span className="text-xs uppercase tracking-widest font-medium text-terracotta">Admin</span>
            <div className="mt-3 divide-y divide-[#e0dbd2]">
              <Link to="/hosting" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <Settings size={18} className="text-text-light" />
                <span className="text-sm font-medium">Manage Events</span>
              </Link>
              <Link to="/directory" className="flex items-center gap-3 py-3 px-2 text-text-primary no-underline hover:bg-cream/50 transition-colors">
                <BookMarked size={18} className="text-text-light" />
                <span className="text-sm font-medium">Directory</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </PullToRefresh>
  )
}
