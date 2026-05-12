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
  // Sender's perspective: "They are my __" (e.g. "Son")
  senderLabel?: string
  // Recipient's perspective preset: "I am your __" (e.g. "Father")
  recipientLabel?: string
}

// Re-mirror the user's public profile so `publicFamily` reflects the new
// link state. Fire-and-forget — the family link write itself has already
// succeeded; the mirror is a side-effect for the directory view.
function refreshMirror(userId: string | null | undefined) {
  if (!userId) return
  dbService.refreshProfileMirror(userId).catch((err) =>
    console.error('[familyLinks] mirror refresh failed', err),
  )
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
        args.senderLabel,
        args.recipientLabel,
      ),
    onSuccess: (_, args) => {
      qc.invalidateQueries({ queryKey: KEY(args.senderId) })
      // Pending invites don't appear in publicFamily until accepted, so no
      // mirror refresh here.
    },
  })
}

export function useAcceptFamilyLink(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ linkId, recipientLabel }: { linkId: string; recipientLabel?: string }) =>
      dbService.acceptFamilyLink(linkId, recipientLabel),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
      refreshMirror(currentUserId)
    },
  })
}

export function useDeleteFamilyLink(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => dbService.deleteFamilyLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
      refreshMirror(currentUserId)
    },
  })
}

export function useUpdateMyFamilyLinkLabel(currentUserId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      linkId,
      side,
      label,
    }: {
      linkId: string
      side: 'sender' | 'recipient'
      label: string
    }) => dbService.updateMyFamilyLinkLabel(linkId, side, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY(currentUserId) })
      // Label changes don't affect publicFamily (which uses just first names)
      // but the data is cheap to refresh.
      refreshMirror(currentUserId)
    },
  })
}
