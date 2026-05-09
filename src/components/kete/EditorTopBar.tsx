import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/common'

interface EditorTopBarProps {
  onBack: () => void
  onSaveDraft: () => void
  onPublish: () => void
  isDirty: boolean
  isSaving: boolean
  publishLabel: 'Publish' | 'Update'
}

export function EditorTopBar({
  onBack,
  onSaveDraft,
  onPublish,
  isDirty,
  isSaving,
  publishLabel,
}: EditorTopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-[#e0dbd2]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-text-light hover:text-forest text-sm bg-transparent border-none cursor-pointer p-1"
        >
          <ChevronLeft size={20} aria-hidden="true" />
          Back
        </button>
        <span className="text-xs text-text-lighter ml-1">
          {isDirty ? 'Unsaved changes' : 'Saved'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onPublish}
            loading={isSaving}
          >
            {publishLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
