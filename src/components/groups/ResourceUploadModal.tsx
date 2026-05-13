import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Modal } from '../common/Modal'
import { useFileDrop } from '@/hooks/useFileDrop'
import { cn } from '@/utils/cn'

interface ResourceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; tags: string[]; file: File }) => void
  isLoading?: boolean
}

const ACCEPTED_TYPES = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'
const MAX_SIZE_MB = 25

export default function ResourceUploadModal({ isOpen, onClose, onSubmit, isLoading }: ResourceUploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => { setTitle(''); setDescription(''); setTagsInput(''); setFile(null); setError('') }
  const handleClose = () => { reset(); onClose() }

  const applyFile = (selected: File) => {
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be smaller than ${MAX_SIZE_MB}MB`)
      return
    }
    setError('')
    setFile(selected)
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ''))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) applyFile(selected)
  }

  const { isDraggingOver, dropHandlers } = useFileDrop({ onFile: applyFile })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    onSubmit({ title: title.trim(), description: description.trim(), tags, file })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload File">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <input ref={fileRef} type="file" onChange={handleFileChange} className="hidden" accept={ACCEPTED_TYPES} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            {...dropHandlers}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors',
              isDraggingOver
                ? 'border-[#1a3a2f] text-[#1a3a2f] bg-[#1a3a2f]/5'
                : 'border-stone-300 text-stone-500 hover:border-stone-400 hover:text-stone-600'
            )}
          >
            <Upload className="h-5 w-5" />
            {file ? file.name : isDraggingOver ? 'Drop to upload' : 'Choose or drop a file'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags (comma-separated, e.g. worship, minutes)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
          <button type="submit" disabled={isLoading || !file}
            className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50">
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
