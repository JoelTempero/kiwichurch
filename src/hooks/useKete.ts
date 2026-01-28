import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbService } from '@/services/firebase'
import type { KetePost, KeteComment, KeteQueryOptions } from '@/types'

// Query keys
export const keteKeys = {
  all: ['kete'] as const,
  lists: () => [...keteKeys.all, 'list'] as const,
  list: (options: KeteQueryOptions) => [...keteKeys.lists(), options] as const,
  details: () => [...keteKeys.all, 'detail'] as const,
  detail: (id: string) => [...keteKeys.details(), id] as const,
  comments: (postId: string) => [...keteKeys.all, 'comments', postId] as const
}

// Get kete posts
export function useKetePosts(options: KeteQueryOptions = {}) {
  return useQuery({
    queryKey: keteKeys.list(options),
    queryFn: () => dbService.getKetePosts(options),
    staleTime: 5 * 60 * 1000
  })
}

// Get published kete posts
export function usePublishedKetePosts(limit?: number) {
  return useKetePosts({ published: true, limit })
}

// Get single kete post
export function useKetePost(postId: string | null) {
  return useQuery({
    queryKey: keteKeys.detail(postId || ''),
    queryFn: () => dbService.getKetePost(postId!),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000
  })
}

// Get kete comments
export function useKeteComments(postId: string | null) {
  return useQuery({
    queryKey: keteKeys.comments(postId || ''),
    queryFn: () => dbService.getKeteComments(postId!),
    enabled: !!postId
  })
}

// Create kete post mutation
export function useCreateKetePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postData: Omit<KetePost, 'id' | 'createdAt' | 'updatedAt'>) =>
      dbService.createKetePost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
    }
  })
}

// Update kete post mutation
export function useUpdateKetePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, updates }: { postId: string; updates: Partial<KetePost> }) =>
      dbService.updateKetePost(postId, updates),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: keteKeys.detail(postId) })
    }
  })
}

// Delete kete post mutation
export function useDeleteKetePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => dbService.deleteKetePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
    }
  })
}

// Add kete comment mutation
export function useAddKeteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      commentData
    }: {
      postId: string
      commentData: Omit<KeteComment, 'id' | 'createdAt'>
    }) => dbService.addKeteComment(postId, commentData),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: keteKeys.comments(postId) })
    }
  })
}

// Delete kete comment mutation
export function useDeleteKeteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      dbService.deleteKeteComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: keteKeys.comments(postId) })
    }
  })
}
