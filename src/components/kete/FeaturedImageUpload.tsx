import { useRef, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { storageService } from '@/services/firebase'
import { useToast } from '@/components/common/Toast'

interface FeaturedImageUploadProps {
  postId: string
  value: string
  onChange: (url: string) => void
}

export function FeaturedImageUpload({ postId, value, onChange }: FeaturedImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { showToast } = useToast()

  const pickFile = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await storageService.uploadKeteImage(postId, file)
      onChange(result.url)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Couldn't upload image. Try again.",
        'error'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const remove = () => onChange('')

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Featured"
            className="w-full max-h-96 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={pickFile}
              className="px-3 py-1.5 bg-white text-text-primary rounded text-sm font-medium hover:bg-cream"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={remove}
              className="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium hover:bg-red-50 flex items-center gap-1"
              disabled={isUploading}
            >
              <X size={14} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          disabled={isUploading}
          className="w-full aspect-[16/7] border-2 border-dashed border-sage-light rounded-md flex flex-col items-center justify-center gap-2 text-text-light hover:border-forest hover:text-forest transition-colors bg-cream/40"
        >
          {isUploading ? (
            <>
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus size={24} aria-hidden="true" />
              <span className="text-sm">Click or drop to add a featured image</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
