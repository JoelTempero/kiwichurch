import { useState } from 'react'
import { Modal } from '../common/Modal'
import type { ReportReason, ReportTargetType } from '../../types/report'
import { useCreateReport } from '../../hooks/useReports'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '@/components/common/Toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
  targetAuthorId: string
  targetAuthorName: string
  targetContent: string
  contextId?: string
  contextName?: string
}

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
]

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetAuthorId,
  targetAuthorName,
  targetContent,
  contextId,
  contextName,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('inappropriate')
  const [details, setDetails] = useState('')
  const { user } = useAuthStore()
  const createReport = useCreateReport()
  const { showToast } = useToast()

  const handleSubmit = async () => {
    if (!user) return
    try {
      await createReport.mutateAsync({
        reporterId: user.id,
        reporterName: user.displayName || 'Unknown',
        targetType,
        targetId,
        targetAuthorId,
        targetAuthorName,
        targetContent: targetContent.slice(0, 500),
        contextId,
        contextName,
        reason,
        details: details.trim() || undefined,
        status: 'pending',
      })
      showToast('Report submitted. A moderator will review it.', 'success')
      setReason('inappropriate')
      setDetails('')
      onClose()
    } catch {
      showToast('Failed to submit report. Please try again.', 'error')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Content" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            className="w-full rounded-md border border-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Any additional context..."
            className="w-full rounded-md border border-cream-dark bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReport.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
