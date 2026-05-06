import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { dbService } from '../services/firebase/db'
import { storageService } from '../services/firebase/storage'
import type { GroupResource } from '../types/groupResource'

const resourceKeys = {
  all: (gatheringId: string) => ['groupResources', gatheringId] as const,
}

export function useGroupResources(gatheringId: string | undefined) {
  return useQuery({
    queryKey: resourceKeys.all(gatheringId || ''),
    queryFn: () => dbService.getGroupResources(gatheringId!),
    enabled: !!gatheringId,
  })
}

export function useGroupResourcesSubscription(gatheringId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!gatheringId) return

    const unsubscribe = dbService.subscribeToGroupResources(gatheringId, (resources) => {
      queryClient.setQueryData(resourceKeys.all(gatheringId), resources)
    })

    return () => unsubscribe()
  }, [gatheringId, queryClient])
}

export function useAddGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      data,
      file,
    }: {
      gatheringId: string
      data: Omit<GroupResource, 'id' | 'createdAt' | 'fileURL' | 'fileName' | 'fileSize' | 'fileType' | 'storagePath'>
      file?: File
    }) => {
      let fileFields = {}

      if (file && data.type === 'file') {
        const tempId = crypto.randomUUID()
        const result = await storageService.uploadGroupResource(gatheringId, tempId, file)
        fileFields = {
          fileURL: result.url,
          fileName: result.fileName,
          fileSize: file.size,
          fileType: file.type,
          storagePath: result.path,
        }
      }

      return dbService.addGroupResource(gatheringId, {
        ...data,
        ...fileFields,
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all(variables.gatheringId) })
    },
  })
}

export function useUpdateGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      resourceId,
      updates,
    }: {
      gatheringId: string
      resourceId: string
      updates: Partial<Pick<GroupResource, 'title' | 'description' | 'tags'>>
    }) => {
      return dbService.updateGroupResource(gatheringId, resourceId, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all(variables.gatheringId) })
    },
  })
}

export function useDeleteGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      resourceId,
      storagePath,
    }: {
      gatheringId: string
      resourceId: string
      storagePath?: string
    }) => {
      if (storagePath) {
        try {
          await storageService.deleteFile(storagePath)
        } catch (e) {
          console.warn('Could not delete storage file:', e)
        }
      }
      return dbService.deleteGroupResource(gatheringId, resourceId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all(variables.gatheringId) })
    },
  })
}
