import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { dbService } from '@/services/firebase'
import type { Gathering, BoardPost, BoardComment } from '@/types'

// Query keys
export const gatheringKeys = {
  all: ['gatherings'] as const,
  lists: () => [...gatheringKeys.all, 'list'] as const,
  list: () => [...gatheringKeys.lists()] as const,
  details: () => [...gatheringKeys.all, 'detail'] as const,
  detail: (id: string) => [...gatheringKeys.details(), id] as const,
  members: (id: string) => [...gatheringKeys.all, 'members', id] as const,
  userGatherings: (userId: string) => [...gatheringKeys.all, 'user', userId] as const,
  posts: (gatheringId: string) => [...gatheringKeys.all, 'posts', gatheringId] as const,
  postComments: (gatheringId: string, postId: string) =>
    [...gatheringKeys.posts(gatheringId), 'comments', postId] as const,
  postCommentCount: (gatheringId: string, postId: string) =>
    [...gatheringKeys.posts(gatheringId), 'commentCount', postId] as const
}

// Get all gatherings
export function useGatherings() {
  return useQuery({
    queryKey: gatheringKeys.list(),
    queryFn: () => dbService.getGatherings(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Get single gathering
export function useGathering(gatheringId: string | null) {
  return useQuery({
    queryKey: gatheringKeys.detail(gatheringId || ''),
    queryFn: () => dbService.getGathering(gatheringId!),
    enabled: !!gatheringId,
    staleTime: 10 * 60 * 1000
  })
}

// Get gathering members
export function useGatheringMembers(gatheringId: string | null) {
  return useQuery({
    queryKey: gatheringKeys.members(gatheringId || ''),
    queryFn: () => dbService.getGatheringMembers(gatheringId!),
    enabled: !!gatheringId
  })
}

// Get gathering members with user profiles (for mention dropdowns)
export function useGatheringMemberProfiles(gatheringId: string | null) {
  return useQuery({
    queryKey: [...gatheringKeys.members(gatheringId || ''), 'profiles'],
    queryFn: () => dbService.getGatheringMembersWithProfiles(gatheringId!),
    enabled: !!gatheringId
  })
}

// Get IDs of gatherings the user is a member of
export function useUserGatheringIds(userId: string | null, gatheringIds: string[]) {
  return useQuery({
    queryKey: gatheringKeys.userGatherings(userId || ''),
    queryFn: () => dbService.getUserGatheringIds(userId!, gatheringIds),
    enabled: !!userId && gatheringIds.length > 0,
    staleTime: 5 * 60 * 1000
  })
}

// Get board posts
export function useBoardPosts(gatheringId: string | null, options: { limit?: number } = {}) {
  return useQuery({
    queryKey: gatheringKeys.posts(gatheringId || ''),
    queryFn: () => dbService.getBoardPosts(gatheringId!, options),
    enabled: !!gatheringId
  })
}

// Subscribe to real-time board posts
export function useBoardPostsSubscription(gatheringId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!gatheringId) return

    const unsubscribe = dbService.subscribeToBoardPosts(gatheringId, (posts) => {
      queryClient.setQueryData(gatheringKeys.posts(gatheringId), posts)
    })

    return unsubscribe
  }, [gatheringId, queryClient])
}

// Get post comments
export function usePostComments(gatheringId: string | null, postId: string | null) {
  return useQuery({
    queryKey: gatheringKeys.postComments(gatheringId || '', postId || ''),
    queryFn: () => dbService.getPostComments(gatheringId!, postId!),
    enabled: !!gatheringId && !!postId
  })
}

// Lightweight comment count — loaded for every visible post so the collapsed
// comment button can show how many comments a post has at a glance.
export function usePostCommentCount(gatheringId: string | null, postId: string | null) {
  return useQuery({
    queryKey: gatheringKeys.postCommentCount(gatheringId || '', postId || ''),
    queryFn: () => dbService.getPostCommentCount(gatheringId!, postId!),
    enabled: !!gatheringId && !!postId,
    staleTime: 60 * 1000
  })
}

// Subscribe to real-time post comments
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

// Join gathering mutation
export function useJoinGathering() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gatheringId, userId }: { gatheringId: string; userId: string }) =>
      dbService.joinGathering(gatheringId, userId),
    onSuccess: (_, { gatheringId, userId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.members(gatheringId) })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.userGatherings(userId) })
    }
  })
}

// Admin/host adds many members at once via the AddMembersModal.
// Wraps dbService.bulkAddGatheringMembers and invalidates the members
// queries so the Members tab refreshes.
export function useBulkAddGatheringMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      gatheringName,
      userIds,
    }: {
      gatheringId: string
      gatheringName: string
      userIds: string[]
    }) => dbService.bulkAddGatheringMembers(gatheringId, gatheringName, userIds),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.members(gatheringId) })
      queryClient.invalidateQueries({
        queryKey: [...gatheringKeys.members(gatheringId), 'profiles'],
      })
    },
  })
}

// Admin/host removes a member from the group (or user self-removes via
// the existing Leave Group button). Uses the same Firestore delete as
// leaveGathering — the rule already permits admin/host/self.
export function useRemoveGatheringMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      userId,
    }: {
      gatheringId: string
      userId: string
    }) => dbService.leaveGathering(gatheringId, userId),
    onSuccess: (_, { gatheringId, userId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.members(gatheringId) })
      queryClient.invalidateQueries({
        queryKey: [...gatheringKeys.members(gatheringId), 'profiles'],
      })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.userGatherings(userId) })
    },
  })
}

// Leave gathering mutation
export function useLeaveGathering() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gatheringId, userId }: { gatheringId: string; userId: string }) =>
      dbService.leaveGathering(gatheringId, userId),
    onSuccess: (_, { gatheringId, userId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.members(gatheringId) })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.userGatherings(userId) })
    }
  })
}

// Create gathering mutation
export function useCreateGathering() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gatheringData: Omit<Gathering, 'id' | 'createdAt' | 'updatedAt'>) =>
      dbService.createGathering(gatheringData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.list() })
    }
  })
}

// Update gathering mutation
export function useUpdateGathering() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      updates
    }: {
      gatheringId: string
      updates: Partial<Gathering>
    }) => dbService.updateGathering(gatheringId, updates),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.list() })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.detail(gatheringId) })
    }
  })
}

// Delete gathering mutation
export function useDeleteGathering() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gatheringId: string) => dbService.deleteGathering(gatheringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.list() })
    }
  })
}

// Create board post mutation
export function useCreateBoardPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      gatheringName,
      postData,
      groupMentionIds
    }: {
      gatheringId: string
      gatheringName: string
      postData: Omit<BoardPost, 'id' | 'createdAt' | 'updatedAt'>
      groupMentionIds?: string[]
    }) => {
      const post = await dbService.createBoardPost(gatheringId, postData)
      const snippet = postData.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1').replace(/#\[([^\]]+)\]\([^)]+\)/g, '@$1')

      if (postData.mentions && postData.mentions.length > 0) {
        await dbService.createMentionNotifications(postData.mentions, {
          authorId: postData.authorId,
          authorName: postData.authorName,
          gatheringId,
          gatheringName,
          postId: post.id,
          snippet,
        })
      }

      if (groupMentionIds && groupMentionIds.length > 0) {
        await dbService.createGroupMentionNotifications(groupMentionIds, {
          authorId: postData.authorId,
          authorName: postData.authorName,
          sourceGatheringId: gatheringId,
          sourceGatheringName: gatheringName,
          postId: post.id,
          snippet,
        })
      }

      return post
    },
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Update board post mutation
export function useUpdateBoardPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
      updates
    }: {
      gatheringId: string
      postId: string
      updates: Partial<BoardPost>
    }) => dbService.updateBoardPost(gatheringId, postId, updates),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Delete board post mutation
export function useDeleteBoardPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gatheringId, postId }: { gatheringId: string; postId: string }) =>
      dbService.deleteBoardPost(gatheringId, postId),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Add comment mutation
export function useAddPostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      gatheringName,
      postId,
      postAuthorId,
      commentData,
      groupMentionIds
    }: {
      gatheringId: string
      gatheringName: string
      postId: string
      postAuthorId: string
      commentData: Omit<BoardComment, 'id' | 'createdAt'>
      groupMentionIds?: string[]
    }) => {
      const comment = await dbService.addPostComment(gatheringId, postId, commentData)
      const snippet = commentData.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1').replace(/#\[([^\]]+)\]\([^)]+\)/g, '@$1')

      if (commentData.mentions && commentData.mentions.length > 0) {
        await dbService.createMentionNotifications(commentData.mentions, {
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          gatheringId,
          gatheringName,
          postId,
          commentId: comment.id,
          snippet,
        })
      }

      if (groupMentionIds && groupMentionIds.length > 0) {
        await dbService.createGroupMentionNotifications(groupMentionIds, {
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          sourceGatheringId: gatheringId,
          sourceGatheringName: gatheringName,
          postId,
          commentId: comment.id,
          snippet,
        })
      }

      // Notify post author on new comment, or replied-to commenter on reply
      // Skip if the recipient was already notified via an @mention in this comment
      const recipientId = commentData.replyToId
        ? commentData.replyToAuthorId
        : postAuthorId
      const alreadyMentioned = commentData.mentions?.includes(recipientId ?? '') ?? false
      if (recipientId && !alreadyMentioned) {
        dbService.createCommentNotification({
          recipientId,
          authorId: commentData.authorId,
          authorName: commentData.authorName,
          gatheringId,
          postId,
          isReply: !!commentData.replyToId,
          snippet,
        })
      }

      return comment
    },
    onSuccess: (_, { gatheringId, postId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.postComments(gatheringId, postId) })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.postCommentCount(gatheringId, postId) })
    }
  })
}

// Delete comment mutation
export function useDeletePostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
      commentId
    }: {
      gatheringId: string
      postId: string
      commentId: string
    }) => dbService.deletePostComment(gatheringId, postId, commentId),
    onSuccess: (_, { gatheringId, postId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.postComments(gatheringId, postId) })
      queryClient.invalidateQueries({ queryKey: gatheringKeys.postCommentCount(gatheringId, postId) })
    }
  })
}

// Vote on poll
export function useVotePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
      userId,
      optionIndex,
    }: {
      gatheringId: string
      postId: string
      userId: string
      optionIndex: number
    }) => dbService.votePoll(gatheringId, postId, userId, optionIndex),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Toggle reaction
export function useToggleReaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
      emoji,
      userId,
    }: {
      gatheringId: string
      postId: string
      emoji: string
      userId: string
    }) => dbService.addReaction(gatheringId, postId, emoji, userId),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Pin post mutation
export function usePinPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
      userId,
    }: {
      gatheringId: string
      postId: string
      userId: string
    }) => dbService.pinPost(gatheringId, postId, userId),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}

// Unpin post mutation
export function useUnpinPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      gatheringId,
      postId,
    }: {
      gatheringId: string
      postId: string
    }) => dbService.unpinPost(gatheringId, postId),
    onSuccess: (_, { gatheringId }) => {
      queryClient.invalidateQueries({ queryKey: gatheringKeys.posts(gatheringId) })
    }
  })
}
