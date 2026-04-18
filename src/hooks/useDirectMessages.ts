import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { dbService } from '@/services/firebase'
import type { ConversationParticipant, DirectMessage } from '@/types'
import { extractMentionIds } from '@/utils/mentions'

export const dmKeys = {
  all: ['directMessages'] as const,
  conversations: (userId: string) => [...dmKeys.all, 'conversations', userId] as const,
  messages: (conversationId: string) => [...dmKeys.all, 'messages', conversationId] as const,
}

export function useConversations(userId: string | null) {
  return useQuery({
    queryKey: dmKeys.conversations(userId || ''),
    queryFn: () => dbService.getUserConversations(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

export function useConversationsSubscription(userId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const unsubscribe = dbService.subscribeToConversations(userId, (conversations) => {
      queryClient.setQueryData(dmKeys.conversations(userId), conversations)
    })

    return unsubscribe
  }, [userId, queryClient])
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: dmKeys.messages(conversationId || ''),
    queryFn: () => dbService.getMessages(conversationId!),
    enabled: !!conversationId,
  })
}

export function useMessagesSubscription(conversationId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) return

    const unsubscribe = dbService.subscribeToMessages(conversationId, (messages) => {
      queryClient.setQueryData(dmKeys.messages(conversationId), messages)
    })

    return unsubscribe
  }, [conversationId, queryClient])
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      currentUserId,
      currentUser,
      otherUserId,
      otherUser,
    }: {
      currentUserId: string
      currentUser: ConversationParticipant
      otherUserId: string
      otherUser: ConversationParticipant
    }) => dbService.getOrCreateConversation(currentUserId, currentUser, otherUserId, otherUser),
    onSuccess: (_, { currentUserId }) => {
      queryClient.invalidateQueries({ queryKey: dmKeys.conversations(currentUserId) })
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      recipientId,
      messageData,
    }: {
      conversationId: string
      recipientId: string
      messageData: Omit<DirectMessage, 'id' | 'conversationId' | 'createdAt'>
    }) => {
      const message = await dbService.sendMessage(conversationId, messageData)

      const mentionIds = extractMentionIds(messageData.content)
      const snippet = messageData.content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1')

      if (mentionIds.length > 0) {
        for (const userId of mentionIds.slice(0, 50)) {
          if (userId === messageData.senderId) continue
          await dbService.createDmNotification(userId, messageData.senderName, conversationId, snippet)
        }
      }

      if (recipientId !== messageData.senderId && !mentionIds.includes(recipientId)) {
        await dbService.createDmNotification(recipientId, messageData.senderName, conversationId, snippet)
      }

      return message
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: dmKeys.messages(conversationId) })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      dbService.markConversationRead(conversationId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: dmKeys.conversations(userId) })
    },
  })
}
