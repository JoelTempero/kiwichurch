import { useState } from 'react'
import { Modal } from '../common/Modal'

interface ResourceLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; tags: string[]; url: string }) => void
  isLoading?: boolean
}

export default function ResourceLinkModal({ isOpen, onClose, onSubmit, isLoading }: ResourceLinkModalProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [error, setError] = useState('')

  const reset = () => { setUrl(''); setTitle(''); setDescription(''); setTagsInput(''); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) { setError('Please enter a URL'); return }
    try { new URL(url.trim()) } catch { setError('Please enter a valid URL'); return }
    const tags = tagsInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    onSubmit({ title: title.trim() || url.trim(), description: description.trim(), tags, url: url.trim() })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional — defaults to URL)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags (comma-separated, e.g. worship, video)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Add Link'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
