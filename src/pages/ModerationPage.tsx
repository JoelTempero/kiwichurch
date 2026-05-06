import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useReports, useUpdateReportStatus } from '@/hooks/useReports'
import { Button, EmptyState, Spinner, FadeIn, Badge } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Shield, Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Report, ReportStatus } from '@/types'

const reasonLabels: Record<string, string> = {
  inappropriate: 'Inappropriate',
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  other: 'Other',
}

const tabs: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'All', value: 'all' },
]

function StatusBadge({ status }: { status: ReportStatus }) {
  if (status === 'pending') return <Badge variant="warning">Pending</Badge>
  if (status === 'reviewed') return <Badge variant="success">Reviewed</Badge>
  return <Badge variant="default">Dismissed</Badge>
}

export function ModerationPage() {
  const { user, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('pending')

  const statusFilter = activeTab === 'all' ? undefined : activeTab
  const { data: reports = [], isLoading } = useReports(statusFilter)
  const updateStatus = useUpdateReportStatus()

  if (!isAdminOrHost) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <EmptyState
          icon="lock"
          title="Access Denied"
          message="You need admin or host permissions to access this page"
        />
      </div>
    )
  }

  const handleAction = (reportId: string, status: ReportStatus) => {
    if (!user) return
    updateStatus.mutate(
      { reportId, status, reviewerId: user.id },
      {
        onSuccess: () => showToast(`Report ${status}`, 'success'),
        onError: () => showToast('Failed to update report', 'error'),
      }
    )
  }

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-forest" />
        <h1 className="text-2xl font-display text-forest">Moderation</h1>
      </div>

      <div className="flex gap-1 p-1 bg-cream rounded-md mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 rounded-sm text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-forest text-cream'
                : 'text-text-light hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="search"
          title="No reports"
          message={activeTab === 'pending' ? 'No pending reports to review' : 'No reports found'}
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {reports.map((report: Report) => (
            <div key={report.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Flag size={16} className="text-red-500" />
                  <span className="font-medium text-text-dark">{reasonLabels[report.reason]}</span>
                  <StatusBadge status={report.status} />
                </div>
                <span className="text-xs text-text-light">
                  {report.targetType}
                </span>
              </div>

              <div className="bg-cream/50 rounded-md p-3 text-sm text-text-dark">
                {report.targetContent.length > 100
                  ? report.targetContent.slice(0, 100) + '...'
                  : report.targetContent}
              </div>

              <div className="text-sm text-text-light space-y-1">
                <p>
                  <span className="font-medium">Reported by:</span> {report.reporterName}
                </p>
                <p>
                  <span className="font-medium">Author:</span> {report.targetAuthorName}
                </p>
                {report.contextName && (
                  <p>
                    <span className="font-medium">Context:</span> {report.contextName}
                  </p>
                )}
                {report.details && (
                  <p>
                    <AlertTriangle size={14} className="inline mr-1" />
                    {report.details}
                  </p>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAction(report.id, 'reviewed')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Reviewed
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAction(report.id, 'dismissed')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle size={16} className="mr-1" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </FadeIn>
      )}
    </div>
  )
}
