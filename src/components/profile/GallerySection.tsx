import { useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { storageService } from '@/services/firebase'
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { ConfirmModal } from '@/components/common'
import type { GalleryImage } from '@/types'

const MAX_IMAGES = 6

export function GallerySection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [removing, setRemoving] = useState<GalleryImage | null>(null)
  const images = user?.gallery || []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    if (images.length >= MAX_IMAGES) {
      showToast(`Max ${MAX_IMAGES} images`, 'error')
      return
    }

    setIsUploading(true)
    try {
      const result = await storageService.uploadGalleryImage(user.id, file)
      const next: GalleryImage[] = [
        ...images,
        { url: result.url, fileName: result.path.split('/').pop() || result.path, caption: '' },
      ]
      await updateProfile({ gallery: next })
      showToast('Image added', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    if (!removing || !user?.id) return
    try {
      const next = images.filter((g) => g.url !== removing.url)
      await updateProfile({ gallery: next })
      // Best-effort storage delete; user might keep references elsewhere
      storageService.deleteGalleryImage(user.id, removing.fileName).catch(() => {})
      setRemoving(null)
      showToast('Removed', 'success')
    } catch {
      showToast('Could not remove', 'error')
    }
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest font-medium text-terracotta">Gallery</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading || images.length >= MAX_IMAGES}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-forest text-cream hover:bg-forest-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add gallery image"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          hidden
        />
      </div>

      {images.length === 0 ? (
        <div className="flex items-start gap-3 p-4 border border-[#e0dbd2] rounded-lg bg-[#faf8f4] text-text-light text-sm">
          <ImageIcon size={18} className="mt-0.5 shrink-0" />
          <span>Add up to {MAX_IMAGES} photos that say something about you — family, garden, dog, view from your window.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((g) => (
            <div key={g.url} className="relative group aspect-square rounded-md overflow-hidden bg-cream border border-[#e0dbd2]">
              <img src={g.url} alt={g.caption || 'Gallery image'} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setRemoving(g)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-text-lighter mt-2 m-0">{images.length}/{MAX_IMAGES}</p>

      <ConfirmModal
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        title="Remove image?"
        message="This image will disappear from your gallery."
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </section>
  )
}
