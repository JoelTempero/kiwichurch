import { useMemo } from 'react'
import { useConversations } from './useDirectMessages'
import type { Conversation } from '../types/directMessage'
import type { Timestamp } from 'firebase/firestore'

function toMillis(ts: Timestamp | Date | undefined): number {
  if (!ts) return 0
  if ('toMillis' in ts) return (ts as Timestamp).toMillis()
  return (ts as Date).getTime()
}

function isUnread(conversation: Conversation, userId: string): boolean {
  const lastMessageTime = toMillis(conversation.lastMessage?.createdAt)
  if (!lastMessageTime) return false
  if (conversation.lastMessage?.senderId === userId) return false
  const lastReadTime = toMillis(conversation.lastReadAt[userId])
  return lastMessageTime > lastReadTime
}

export function useUnreadMessageCount(userId: string | null) {
  const { data: conversations } = useConversations(userId)

  return useMemo(() => {
    if (!conversations || !userId) return 0
    return conversations.filter((c) => isUnread(c, userId)).length
  }, [conversations, userId])
}
