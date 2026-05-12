import type { Timestamp } from 'firebase/firestore'

export interface Gathering {
  id: string
  name: string
  description?: string
  rhythm?: string
  location?: string
  hostId?: string
  hostName?: string
  isPublic: boolean
  featured?: boolean
  color?: string
  imageURL?: string
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface GatheringMember {
  id: string // Same as userId
  joinedAt: Timestamp | Date
}

export interface BoardPoll {
  question: string
  options: string[]
  votes: Record<string, number> // userId -> optionIndex
  allowMultiple?: boolean
}

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
  pinnedAt?: Timestamp | Date
  pinnedBy?: string
  reactions?: Record<string, string[]> // emoji -> userIds
  poll?: BoardPoll
  mentions?: string[]
  announcementBroadcastStatus?: 'pending' | 'sent'
  broadcastCompletedAt?: Timestamp | Date
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
  replyToAuthorId?: string
  createdAt: Timestamp | Date
}
