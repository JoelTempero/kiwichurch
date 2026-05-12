import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbService } from '@/services/firebase'
import type { FamilyLink } from '@/types'

const KEY = (userId: string | null) => ['familyLinks', userId || ''] as const

export interface SortedFamilyLinks {
  accepted: FamilyLink[]   // confirmed both sides
  incoming: FamilyLink[]   // pending where current user is recipient
  outgoing: FamilyLink[]   // pending where current user is sender
}

export function useFamilyLinks(userId: string | null) {
  return useQuery<SortedFamilyLinks>({
    queryKey: KEY(userId),
    enabled: !!userId,
    queryFn: async () => {
      const all = await dbService.getFamilyLinks(userId!)
      const out: SortedFamilyLinks = { accepted: [], incoming: [], outgoing: [] }
      for (const link of all) {
        if (link.status === 'accepted') out.accepted.push(link)
        else if (link.recipientId === userId) out.incoming.push(link)
        else out.outgoing.push(link)
      }
      return out
    },
    staleTime: 60_000,
  })
}

interface SendArgs {
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  relationship?: string
}

export function useSendFamilyLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: SendArgs) =>
      dbService.sendFamilyLink(
        args.senderId,
        args.senderName,
        args.recipientId,
        args.recipientName,
        args.relationship,
      ),
    onSuccess: (_, args) => {
      qc.invalidateQueries({ queryKey: KEY(args.senderId) })
    },
  })
}

export function useAcceptFamilyLink(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => dbService.acceptFamilyLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
    },
  })
}

export function useDeleteFamilyLink(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => dbService.deleteFamilyLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
    },
  })
}

export function useUpdateFamilyLinkRelationship(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ linkId, relationship }: { linkId: string; relationship: string }) =>
      dbService.updateFamilyLinkRelationship(linkId, relationship),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
    },
  })
}
