import type { Timestamp } from 'firebase/firestore'

export type ReportReason = 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'
export type ReportTargetType = 'post' | 'comment' | 'message'

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  targetType: ReportTargetType
  targetId: string
  targetAuthorId: string
  targetAuthorName: string
  targetContent: string
  contextId?: string // gatheringId or conversationId
  contextName?: string
  reason: ReportReason
  details?: string
  status: ReportStatus
  reviewedBy?: string
  reviewedAt?: Timestamp | Date
  createdAt: Timestamp | Date
}
