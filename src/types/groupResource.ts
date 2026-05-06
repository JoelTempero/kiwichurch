import { Timestamp } from 'firebase/firestore'

export interface GroupResource {
  id: string
  gatheringId: string
  type: 'file' | 'link'
  title: string
  description?: string
  tags: string[]
  uploadedBy: string
  uploadedByName: string
  createdAt: Timestamp | Date
  fileURL?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  storagePath?: string
  thumbnailURL?: string
  url?: string
  linkMeta?: {
    siteName?: string
    image?: string
    favicon?: string
  }
}
