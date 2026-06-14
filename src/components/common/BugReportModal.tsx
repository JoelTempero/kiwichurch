import { useState, useRef, useEffect } from 'react'
import { ImagePlus, X, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from './Toast'
import { dbService } from '@/services/firebase/db'
import { storageService } from '@/services/firebase/storage'
import { getDiagnostics } from '@/utils/errorBuffer'

interface BugReportModalProps {
  open: boolean
  onClose: () => void
}

const MAX_PHOTOS = 5

export function BugReportModal({ open, onClose }: BugReportModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Keep object-URL previews in sync with the selected files; revoke on cleanup.
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [photos])

  const reset = () => {
    setDescription('')
    setPhotos([])
    setProgress(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    if (picked.length) {
      setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS))
    }
    e.target.value = '' // allow re-picking the same file
  }

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !user) return
    setSubmitting(true)
    try {
      const id = dbService.createBugReportRef()
      await dbService.createBugReport(id, {
        reporterId: user.id,
        reporterName: user.displayName,
        reporterEmail: user.email,
        description: description.trim(),
      })

      const urls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setProgress(0)
        const res = await storageService.uploadBugReportPhoto(id, photos[i], (p) =>
          setProgress(Math.round(((i + p / 100) / photos.length) * 100))
        )
        urls.push(res.url)
      }

      await dbService.finalizeBugReport(id, urls, getDiagnostics())
      showToast("Thanks — your report's been sent", 'success')
      reset()
      onClose()
    } catch (err) {
      showToast(
        err instanceof Error && err.message ? err.message : 'Failed to send report',
        'error'
      )
    } finally {
      setSubmitting(false)
      setProgress(null)
    }
  }

  const submitLabel =
    submitting && progress !== null && progress < 100 ? `Sending ${progress}%` : 'Send report'

  return (
    <Modal isOpen={open} onClose={handleClose} title="Report a problem" size="md">
      <form onSubmit={handleSubmit}>
        <label htmlFor="bug-description" className="block text-sm font-medium text-text-primary mb-1.5">
          What went wrong, or what would you like changed?
        </label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Tell us what happened, what you expected, and where you were in the app…"
          className="w-full px-3 py-2 border border-[#e0dbd2] rounded-md text-sm resize-y focus:outline-none focus:border-forest"
          disabled={submitting}
          autoFocus
        />

        {/* Photo picker */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePick}
          className="hidden"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt={`Attachment ${i + 1}`} className="h-16 w-16 rounded-md object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -right-1 -top-1 rounded-full bg-stone-800 p-0.5 text-white hover:bg-stone-700"
                aria-label="Remove photo"
                disabled={submitting}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-[#c9c2b6] text-text-light hover:border-forest hover:text-forest transition-colors"
              disabled={submitting}
            >
              <ImagePlus size={18} />
              <span className="text-[10px]">Add photo</span>
            </button>
          )}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-text-light">
          <Info size={13} className="mt-0.5 shrink-0" />
          Some technical details about your device and recent errors are attached automatically to
          help us fix it.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} disabled={!description.trim()}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
