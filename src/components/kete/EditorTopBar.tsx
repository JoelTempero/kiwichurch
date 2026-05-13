import { ChevronLeft, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/common'
import { cn } from '@/utils/cn'
import type { KeteVisibility } from '@/types'

interface EditorTopBarProps {
  onBack: () => void
  onSaveDraft: () => void
  onPublish: () => void
  isDirty: boolean
  isSaving: boolean
  publishLabel: 'Publish' | 'Update'
  visibility: KeteVisibility
  onVisibilityChange: (v: KeteVisibility) => void
}

export function EditorTopBar({
  onBack,
  onSaveDraft,
  onPublish,
  isDirty,
  isSaving,
  publishLabel,
  visibility,
  onVisibilityChange,
}: EditorTopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-[#e0dbd2]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
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
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <fieldset
            className="inline-flex items-center rounded-full border border-[#e0dbd2] bg-white text-xs overflow-hidden"
            aria-label="Post visibility"
          >
            <legend className="sr-only">Post visibility</legend>
            <VisibilityPill
              checked={visibility === 'public'}
              onClick={() => onVisibilityChange('public')}
              icon={<Globe size={12} />}
              label="Public"
            />
            <VisibilityPill
              checked={visibility === 'members'}
              onClick={() => onVisibilityChange('members')}
              icon={<Lock size={12} />}
              label="Members only"
            />
          </fieldset>
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

interface VisibilityPillProps {
  checked: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function VisibilityPill({ checked, onClick, icon, label }: VisibilityPillProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 transition-colors',
        checked
          ? 'bg-forest text-cream'
          : 'text-text-light hover:text-forest hover:bg-cream/50'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
