import type { Timestamp } from 'firebase/firestore'

export interface ConversationParticipant {
  displayName: string
  photoURL?: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  participants: Record<string, ConversationParticipant>
  lastMessage?: {
    content: string
    senderId: string
    senderName: string
    createdAt: Timestamp | Date
  }
  lastReadAt: Record<string, Timestamp | Date>
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface DirectMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderPhotoURL?: string
  content: string
  mentions?: string[]
  createdAt: Timestamp | Date
}
