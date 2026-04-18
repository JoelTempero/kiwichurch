# Phase 2: Enhanced Group Message Boards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade group message boards with real-time comments, @mentions with notifications, and inline comment replies.

**Architecture:** Three features layered onto the existing Firestore-backed message board. Real-time comments mirror the existing `subscribeToBoardPosts` pattern. Mentions use a `@[Name](userId)` markup format stored in content, with a separate `mentions[]` field for querying. Replies are flat (not nested) with a visual quote reference to the parent comment.

**Tech Stack:** React 18, Firestore onSnapshot, TanStack Query 5, Zustand, Tailwind v4, Lucide React, zod.

---

## File Map

### New Files
| File | Responsibility |
|---|---|
| `src/utils/mentions.ts` | Encode/decode/extract `@[Name](userId)` markup |
| `src/components/common/MentionInput.tsx` | Textarea with @mention dropdown autocomplete |

### Modified Files
| File | Changes |
|---|---|
| `src/types/gathering.ts` | Add `mentions`, `replyToId`, `replyToAuthorName` fields |
| `src/services/firebase/db.ts` | Add `subscribeToPostComments`, `createMentionNotifications` |
| `src/hooks/useGatherings.ts` | Add `usePostCommentsSubscription`, update mutations for mentions |
| `src/components/groups/BoardPost.tsx` | Real-time comments, reply UI, MentionInput, mention rendering |
| `src/pages/GroupDetailPage.tsx` | Swap textarea for MentionInput on post creation |
| `src/components/layout/NotificationPanel.tsx` | Already handles `mention` type — no changes needed |

---

### Task 1: Mention Utilities

**Files:**
- Create: `src/utils/mentions.ts`

- [ ] **Step 1: Create mention encode/decode utilities**

```typescript
// src/utils/mentions.ts

// Markup format: @[Display Name](userId)
const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g

export interface MentionData {
  displayName: string
  userId: string
}

export function encodeMention(displayName: string, userId: string): string {
  return `@[${displayName}](${userId})`
}

export function extractMentionIds(text: string): string[] {
  const ids: string[] = []
  let match
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    ids.push(match[2])
  }
  return ids
}

export interface MentionSegment {
  type: 'text' | 'mention'
  content: string
  userId?: string
}

export function parseMentions(text: string): MentionSegment[] {
  const segments: MentionSegment[] = []
  let lastIndex = 0
  let match

  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'mention', content: match[1], userId: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}

export function stripMentionMarkup(text: string): string {
  return text.replace(MENTION_REGEX, '@$1')
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: Clean output

- [ ] **Step 3: Commit**

```bash
git add src/utils/mentions.ts
git commit -m "feat: add mention encode/decode utilities"
```

---

### Task 2: Update Data Types

**Files:**
- Modify: `src/types/gathering.ts`

- [ ] **Step 1: Add new fields to BoardPost and BoardComment**

In `src/types/gathering.ts`, add `mentions` to `BoardPost` and add `mentions`, `replyToId`, `replyToAuthorName` to `BoardComment`:

```typescript
export interface BoardPost {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  content: string
  attachmentURL?: string
  attachmentType?: string
  attachmentName?: string
  pinned?: boolean
  reactions?: Record<string, string[]>
  mentions?: string[]
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface BoardComment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  content: string
  mentions?: string[]
  replyToId?: string
  replyToAuthorName?: string
  createdAt: Timestamp | Date
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: Clean output (new fields are optional, so existing code is unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/types/gathering.ts
git commit -m "feat: add mentions and reply fields to board types"
```

---

### Task 3: Real-Time Comments Service & Hook

**Files:**
- Modify: `src/services/firebase/db.ts`
- Modify: `src/hooks/useGatherings.ts`

- [ ] **Step 1: Add subscribeToPostComments to db service**

In `src/services/firebase/db.ts`, add this method in the REAL-TIME LISTENERS section (after `subscribeToBoardPosts`):

```typescript
  subscribeToPostComments(
    gatheringId: string,
    postId: string,
    callback: (comments: BoardComment[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'messageBoards', gatheringId, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, snapshot => {
      const comments = snapshot.docs.map(doc => docToObject<BoardComment>(doc))
      callback(comments)
    })
  },
```

- [ ] **Step 2: Add usePostCommentsSubscription hook**

In `src/hooks/useGatherings.ts`, add this hook after the existing `usePostComments`:

```typescript
export function usePostCommentsSubscription(gatheringId: string | null, postId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!gatheringId || !postId) return

    const unsubscribe = dbService.subscribeToPostComments(gatheringId, postId, (comments) => {
      queryClient.setQueryData(gatheringKeys.postComments(gatheringId, postId), comments)
    })

    return unsubscribe
  }, [gatheringId, postId, queryClient])
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: Clean output

- [ ] **Step 4: Commit**

```bash
git add src/services/firebase/db.ts src/hooks/useGatherings.ts
git commit -m "feat: add real-time comment subscription"
```

---

### Task 4: Mention Notification Service

**Files:**
- Modify: `src/services/firebase/db.ts`

- [ ] **Step 1: Add createMentionNotifications to db service**

In `src/services/firebase/db.ts`, add this method in the NOTIFICATIONS section:

```typescript
  async createMentionNotifications(
    mentionedUserIds: string[],
    context: {
      authorId: string
      authorName: string
      gatheringId: string
      gatheringName: string
      postId: string
      commentId?: string
      snippet: string
    }
  ): Promise<void> {
    const batch = writeBatch(db)
    const timestamp = serverTimestamp()

    for (const userId of mentionedUserIds) {
      if (userId === context.authorId) continue
      const notifRef = doc(collection(db, 'notifications'))
      batch.set(notifRef, {
        userId,
        type: 'mention' as const,
        title: `${context.authorName} mentioned you`,
        message: context.snippet.length > 80
          ? context.snippet.slice(0, 80) + '...'
          : context.snippet,
        link: `/groups/${context.gatheringId}`,
        read: false,
        createdAt: timestamp,
      })
    }

    await batch.commit()
  },
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: Clean output

- [ ] **Step 3: Commit**

```bash
git add src/services/firebase/db.ts
git commit -m "feat: add mention notification service"
```

---

### Task 5: MentionInput Component

**Files:**
- Create: `src/components/common/MentionInput.tsx`
- Modify: `src/components/common/index.ts`

- [ ] **Step 1: Create MentionInput component**

```typescript
// src/components/common/MentionInput.tsx
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'
import { encodeMention } from '@/utils/mentions'

export interface MentionMember {
  id: string
  displayName: string
  photoURL?: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMentionsChange: (mentions: Map<string, string>) => void
  members: MentionMember[]
  placeholder?: string
  disabled?: boolean
  rows?: number
  className?: string
  ariaLabel?: string
  singleLine?: boolean
}

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  members,
  placeholder,
  disabled,
  rows = 3,
  className,
  ariaLabel,
  singleLine = false,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null)
  const [mentionMap] = useState<Map<string, string>>(() => new Map())
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = members.filter(m =>
    m.displayName.toLowerCase().includes(searchText.toLowerCase())
  ).slice(0, 6)

  useEffect(() => {
    setDropdownIndex(0)
  }, [searchText])

  const handleInput = useCallback((newValue: string) => {
    const el = inputRef.current
    if (!el) return

    const cursorPos = el.selectionStart ?? newValue.length
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      setMentionStartPos(cursorPos - atMatch[0].length)
      setSearchText(atMatch[1])
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
      setMentionStartPos(null)
    }

    onChange(newValue)
  }, [onChange])

  const insertMention = useCallback((member: MentionMember) => {
    if (mentionStartPos === null) return

    const before = value.slice(0, mentionStartPos)
    const el = inputRef.current
    const cursorPos = el?.selectionStart ?? value.length
    const after = value.slice(cursorPos)

    const displayText = `@${member.displayName} `
    const newValue = before + displayText + after
    mentionMap.set(member.displayName, member.id)
    onMentionsChange(new Map(mentionMap))

    onChange(newValue)
    setShowDropdown(false)
    setMentionStartPos(null)

    requestAnimationFrame(() => {
      if (el) {
        const newPos = before.length + displayText.length
        el.focus()
        el.setSelectionRange(newPos, newPos)
      }
    })
  }, [value, mentionStartPos, mentionMap, onChange, onMentionsChange])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) {
      if (singleLine && e.key === 'Enter') {
        return
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDropdownIndex(i => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDropdownIndex(i => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(filtered[dropdownIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowDropdown(false)
    }
  }

  const inputClasses = cn(
    'w-full px-3 py-2 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest',
    className
  )

  const InputTag = singleLine ? 'input' : 'textarea'

  return (
    <div className="relative">
      <InputTag
        ref={inputRef as any}
        className={inputClasses}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={singleLine ? undefined : rows}
        aria-label={ariaLabel}
      />

      {showDropdown && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-lg border border-cream-dark z-20 max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Mention suggestions"
        >
          {filtered.map((member, i) => (
            <button
              key={member.id}
              type="button"
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                i === dropdownIndex ? 'bg-cream text-forest' : 'hover:bg-cream/50'
              )}
              onClick={() => insertMention(member)}
              role="option"
              aria-selected={i === dropdownIndex}
            >
              <span className="font-medium">{member.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Export from common/index.ts**

Add to `src/components/common/index.ts`:

```typescript
export { MentionInput } from './MentionInput'
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: Clean output

- [ ] **Step 4: Commit**

```bash
git add src/components/common/MentionInput.tsx src/components/common/index.ts
git commit -m "feat: add MentionInput component with @mention autocomplete"
```

---

### Task 6: Update Mutation Hooks for Mentions

**Files:**
- Modify: `src/hooks/useGatherings.ts`

- [ ] **Step 1: Update useCreateBoardPost to accept and send mentions**

Replace the existing `useCreateBoardPost` hook:

```typescript
export function useCreateBoardPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      gatheringName,
      postData
    }: {
      gatheringId: string
      gatheringName: string
      postData: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>
    }) => {
      const post = await dbService.createBoardPost(gatheringId, postData)

      if (postData.mentions && postData.mentions.length > 0) {
        await dbService.createMentionNotifications(postData.mentions, {
          authorId: postData.authorId,
          authorName: postData.authorName,
          gatheringId,
          gatheringName,
          postId: post.id,
          snippet: postData.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1'),
        })
      }

      return post
    },
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}
```

- [ ] **Step 2: Update useAddPostComment to accept and send mentions**

Replace the existing `useAddPostComment` hook:

```typescript
export function useAddPostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      gatheringName,
      postId,
      commentData
    }: {
      gatheringId: string
      gatheringName: string
      postId: string
      commentData: Omit<BoardComment, 'id' | 'createdAt'>
    }) => {
      const comment = await dbService.addPostComment(gatheringId, postId, commentData)

      if (commentData.mentions && commentData.mentions.length > 0) {
        await dbService.createMentionNotifications(commentData.mentions, {
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          gatheringId,
          gatheringName,
          postId,
          commentId: comment.id,
          snippet: commentData.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1'),
        })
      }

      return comment
    },
    onSuccess: (_, { gatheringId, postId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.postComments(gatheringId, postId) })
    }
  })
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: May see errors in GroupDetailPage.tsx and BoardPost.tsx because they call these hooks without the new `gatheringName` param — that's expected and will be fixed in Tasks 7 and 8.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGatherings.ts
git commit -m "feat: update post/comment mutations with mention notifications"
```

---

### Task 7: Update GroupDetailPage with MentionInput

**Files:**
- Modify: `src/pages/GroupDetailPage.tsx`

- [ ] **Step 1: Replace post creation textarea with MentionInput**

Full rewrite of `src/pages/GroupDetailPage.tsx`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles (may have errors from BoardPost props — fixed in Task 8)**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/pages/GroupDetailPage.tsx
git commit -m "feat: add MentionInput to group post creation"
```

---

### Task 8: Update BoardPost with Real-Time Comments, Replies, and Mentions

**Files:**
- Modify: `src/components/groups/BoardPost.tsx`

This is the largest change. BoardPost gets:
- Real-time comment subscription (lazy, on expand)
- MentionInput for new comments
- Reply UI (reply-to indicator + quote display)
- Mention rendering in post/comment content

- [ ] **Step 1: Rewrite BoardPost.tsx**

```typescript
// src/components/groups/BoardPost.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Pin, MoreVertical, Edit, Trash2, MessageCircle, X, Reply, AtSign } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Avatar, Button, MentionInput } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import {
  usePostComments,
  usePostCommentsSubscription,
  useAddPostComment,
  useUpdateBoardPost,
  useDeleteBoardPost,
  useDeletePostComment
} from '@/hooks/useGatherings'
import { useToast } from '@/components/common/Toast'
import { parseMentions, encodeMention, extractMentionIds } from '@/utils/mentions'
import type { BoardPost as BoardPostType, BoardComment } from '@/types'
import type { MentionMember } from '@/components/common/MentionInput'

interface BoardPostProps {
  post: BoardPostType
  gatheringId: string
  gatheringName: string
  members: MentionMember[]
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

function RichContent({ content }: { content: string }) {
  const segments = parseMentions(content)
  return (
    <p className="text-text-primary leading-relaxed">
      {segments.map((seg, i) =>
        seg.type === 'mention' ? (
          <span key={i} className="font-semibold text-forest">@{seg.content}</span>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </p>
  )
}

function ReplyQuote({ comment }: { comment: BoardComment | undefined; }) {
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
        commentData: {
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          content,
          mentions: mentionIds.length > 0 ? mentionIds : undefined,
          replyToId: replyTo?.id,
          replyToAuthorName: replyTo?.authorName,
        }
      })
      setNewComment('')
      setCommentMentions(new Map())
      setReplyTo(null)
    } catch {
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
    if (!confirm('Are you sure you want to delete this post?')) return
    setShowMenu(false)

    try {
      await deletePost.mutateAsync({ gatheringId, postId: post.id })
      showToast('Post deleted', 'success')
      onDelete?.()
    } catch {
      showToast('Failed to delete post', 'error')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      await deleteComment.mutateAsync({ gatheringId, postId: post.id, commentId })
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
                        onClick={() => handleDeleteComment(comment.id)}
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
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Clean output

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/groups/BoardPost.tsx
git commit -m "feat: add real-time comments, @mentions, and inline replies to BoardPost"
```

---

### Task 9: Verify and Fix Member Data for MentionInput

**Files:**
- Possibly modify: `src/services/firebase/db.ts` or `src/hooks/useGatherings.ts`

The `useGatheringMembers` hook returns `GatheringMember[]` which only has `id` and `joinedAt` — no `displayName`. The MentionInput needs display names. Check how member data is fetched and ensure it includes user profile data.

- [ ] **Step 1: Check getGatheringMembers implementation**

Read `src/services/firebase/db.ts` and find the `getGatheringMembers` method. If it only returns `{ id, joinedAt }`, we need to enrich it with user display names.

- [ ] **Step 2: If members lack displayName, add a method to fetch enriched members**

If the current implementation doesn't include display names, add a service method that fetches member IDs from the subcollection then batch-fetches user profiles:

```typescript
  async getGatheringMembersWithProfiles(gatheringId: string): Promise<Array<{ id: string; displayName: string; photoURL?: string }>> {
    const members = await this.getGatheringMembers(gatheringId)
    const profiles = await Promise.all(
      members.map(async (member) => {
        const userDoc = await getDoc(doc(db, 'users', member.id))
        if (userDoc.exists()) {
          const data = userDoc.data()
          return { id: member.id, displayName: data.displayName || member.id, photoURL: data.photoURL }
        }
        return { id: member.id, displayName: member.id }
      })
    )
    return profiles
  },
```

Then update the `useGatheringMembers` hook or create a new `useGatheringMembersWithProfiles` hook. Update GroupDetailPage to use it for the `mentionMembers` list.

- [ ] **Step 3: Verify TypeScript compiles and member names appear in the dropdown**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: enrich gathering members with display names for mentions"
```

---

### Task 10: Final Build Verification and CLAUDE.md Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Clean output

- [ ] **Step 3: Update CLAUDE.md with Phase 2 progress**

Update the Next Steps section to mark Phase 2 complete and add a session log entry documenting:
- Real-time comments via onSnapshot subscription (lazy, on expand)
- @mentions with notification creation and MentionInput component
- Inline replies with flat display and quote references
- Files created: `src/utils/mentions.ts`, `src/components/common/MentionInput.tsx`
- Files modified: types, db service, hooks, BoardPost, GroupDetailPage

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Phase 2 completion"
```
