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
    [...gatheringKeys.posts(gatheringId), 'comments', postId] as const
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

// Get user's gatherings
export function useUserGatherings(userId: string | null) {
  return useQuery({
    queryKey: gatheringKeys.userGatherings(userId || ''),
    queryFn: () => dbService.getUserGatherings(userId!),
    enabled: !!userId,
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
    }
  })
}
