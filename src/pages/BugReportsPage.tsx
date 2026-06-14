import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBugReports, useUpdateBugReport } from '@/hooks/useBugReports'
import { Button, EmptyState, Spinner, FadeIn } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import { Bug, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { BUG_REPORT_STATUS_LABELS, type BugReport, type BugReportStatus } from '@/types/bugReport'

const tabs: { label: string; value: BugReportStatus | 'all' }[] = [
  { label: 'New', value: 'new' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: "Won't fix", value: 'wontfix' },
  { label: 'All', value: 'all' },
]

function formatTimeAgo(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return 'Just now'
  const d = date instanceof Date ? date : date.toDate()
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

function BugReportCard({ report }: { report: BugReport }) {
  const { showToast } = useToast()
  const updateReport = useUpdateBugReport()
  const [notes, setNotes] = useState(report.adminNotes ?? '')
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const handleStatus = (status: BugReportStatus) => {
    updateReport.mutate(
      { id: report.id, updates: { status } },
      {
        onSuccess: () => showToast(`Marked ${BUG_REPORT_STATUS_LABELS[status]}`, 'success'),
        onError: () => showToast('Failed to update', 'error'),
      }
    )
  }

  const handleSaveNotes = () => {
    updateReport.mutate(
      { id: report.id, updates: { adminNotes: notes } },
      {
        onSuccess: () => showToast('Notes saved', 'success'),
        onError: () => showToast('Failed to save notes', 'error'),
      }
    )
  }

  const diag = report.diagnostics

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-text-dark">{report.reporterName}</p>
          <p className="text-xs text-text-light">{report.reporterEmail}</p>
        </div>
        <span className="text-xs text-text-light whitespace-nowrap">
          {formatTimeAgo(report.createdAt as Date)}
        </span>
      </div>

      <div className="bg-cream/50 rounded-md p-3 text-sm text-text-dark whitespace-pre-wrap">
        {report.description}
      </div>

      {report.photoURLs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {report.photoURLs.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                className="h-20 w-20 rounded-md object-cover border border-[#e0dbd2] hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      {/* Diagnostics */}
      {diag && (
        <div className="border border-[#ebe6dc] rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDiagnostics((s) => !s)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text-light hover:bg-cream/40 transition-colors"
          >
            <span>Technical details</span>
            <ChevronDown
              size={14}
              className={cn('transition-transform', showDiagnostics && 'rotate-180')}
            />
          </button>
          {showDiagnostics && (
            <div className="px-3 pb-3 text-xs text-text-dark space-y-1">
              <p><span className="text-text-light">Route:</span> {diag.route}</p>
              <p><span className="text-text-light">Build:</span> {diag.gitSha} · {diag.buildTime}</p>
              <p><span className="text-text-light">App version:</span> {diag.appVersion}</p>
              <p><span className="text-text-light">Device:</span> {diag.platform} · {diag.viewport}</p>
              <p className="break-words"><span className="text-text-light">UA:</span> {diag.userAgent}</p>
              {diag.recentErrors.length > 0 && (
                <div>
                  <p className="text-text-light mt-1.5 mb-0.5">Recent errors:</p>
                  <pre className="bg-stone-900 text-stone-100 rounded-md p-2 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap">
                    {diag.recentErrors
                      .map((e) => `[${e.kind}] ${e.route}\n${e.message}`)
                      .join('\n\n')}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Triage controls */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-text-light">Status:</span>
        <select
          value={report.status}
          onChange={(e) => handleStatus(e.target.value as BugReportStatus)}
          disabled={updateReport.isPending}
          className="px-2 py-1 border border-[#e0dbd2] rounded-md text-sm bg-white focus:outline-none focus:border-forest"
        >
          {(Object.keys(BUG_REPORT_STATUS_LABELS) as BugReportStatus[]).map((s) => (
            <option key={s} value={s}>
              {BUG_REPORT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-light">Admin notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Triage notes (visible to admins)…"
            className="w-full px-2 py-1.5 border border-[#e0dbd2] rounded-md text-sm resize-y focus:outline-none focus:border-forest"
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSaveNotes}
          disabled={updateReport.isPending || notes === (report.adminNotes ?? '')}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export function BugReportsPage() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<BugReportStatus | 'all'>('new')

  const statusFilter = activeTab === 'all' ? undefined : activeTab
  const { data: reports = [], isLoading } = useBugReports(statusFilter)

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <EmptyState
          icon="lock"
          title="Access Denied"
          message="You need admin permissions to access this page"
        />
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bug size={24} className="text-forest" />
        <h1 className="text-2xl font-display text-forest">Bug Reports</h1>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-cream rounded-md mb-6">
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
          message={activeTab === 'new' ? 'No new reports' : 'No reports found'}
        />
      ) : (
        <FadeIn className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
          {reports.map((report) => (
            <BugReportCard key={report.id} report={report} />
          ))}
        </FadeIn>
      )}
    </div>
  )
}
