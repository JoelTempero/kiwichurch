import type { Timestamp } from 'firebase/firestore'

export interface KetePost {
  id: string
  title: string
  excerpt?: string
  content: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  published: boolean
  publishedAt?: Timestamp | Date | null
  featuredImage?: string
  category?: string
  series?: string
  tags?: string[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface KeteComment {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  content: string
  createdAt: Timestamp | Date
}

export interface KeteQueryOptions {
  published?: boolean
  authorId?: string
  category?: string
  series?: string
  limit?: number
}
