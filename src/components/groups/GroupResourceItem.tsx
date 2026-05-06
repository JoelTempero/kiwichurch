import { FileText, Image, Link2, Download, Trash2, Pencil, File, FileSpreadsheet } from 'lucide-react'
import type { GroupResource } from '../../types/groupResource'

function formatTimeAgo(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return ''
  const d = typeof (date as { toDate?: () => Date }).toDate === 'function'
    ? (date as { toDate: () => Date }).toDate()
    : date as Date
  if (!(d instanceof Date) || isNaN(d.getTime())) return ''
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
}

interface GroupResourceItemProps {
  resource: GroupResource
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

function getFileIcon(fileType?: string) {
  if (!fileType) return <File className="h-5 w-5" />
  if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-emerald-600" />
  if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv'))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />
  return <FileText className="h-5 w-5 text-blue-600" />
}

export default function GroupResourceItem({ resource, canEdit, canDelete, onEdit, onDelete }: GroupResourceItemProps) {
  const isLink = resource.type === 'link'

  return (
    <div className="flex items-start gap-3 border-b border-stone-100 py-3 last:border-b-0">
      {/* Icon or thumbnail */}
      <div className="mt-0.5 shrink-0">
        {isLink ? (
          <Link2 className="h-5 w-5 text-stone-500" />
        ) : resource.fileType?.startsWith('image/') && resource.fileURL ? (
          <img src={resource.fileURL} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          getFileIcon(resource.fileType)
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <a
              href={isLink ? resource.url : resource.fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1a3a2f] hover:underline"
            >
              {resource.title}
            </a>
            <p className="text-xs text-stone-500">
              {resource.uploadedByName} &middot; {formatTimeAgo(resource.createdAt)}
              {resource.fileSize && ` · ${(resource.fileSize / 1024 / 1024).toFixed(1)}MB`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-1">
            {!isLink && resource.fileURL && (
              <a href={resource.fileURL} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600" title="Download">
                <Download className="h-4 w-4" />
              </a>
            )}
            {canEdit && (
              <button onClick={onEdit} className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={onDelete} className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {resource.description && <p className="mt-1 text-sm text-stone-600">{resource.description}</p>}

        {resource.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {resource.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
