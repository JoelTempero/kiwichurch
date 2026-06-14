import type { Timestamp } from 'firebase/firestore'
import type { BugReportDiagnostics } from '../utils/errorBuffer'

export type BugReportStatus = 'new' | 'in_progress' | 'resolved' | 'wontfix'

export interface BugReport {
  id: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  description: string
  photoURLs: string[]
  status: BugReportStatus
  adminNotes?: string
  diagnostics: BugReportDiagnostics | null
  createdAt: Timestamp | Date | null
  updatedAt: Timestamp | Date | null
}

export const BUG_REPORT_STATUS_LABELS: Record<BugReportStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  wontfix: "Won't fix",
}
