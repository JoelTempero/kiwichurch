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
  reactions?: Record<string, string[]> // emoji -> userIds
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface BoardComment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  content: string
  createdAt: Timestamp | Date
}
