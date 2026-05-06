import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

export interface MentionMember {
  id: string
  displayName: string
  photoURL?: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMentionsChange: (mentions: Map<string, string>) => void
  members: MentionMember[]
  placeholder?: string
  disabled?: boolean
  rows?: number
  className?: string
  ariaLabel?: string
  singleLine?: boolean
  onSubmit?: () => void
}

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  members,
  placeholder,
  disabled,
  rows = 3,
  className,
  ariaLabel,
  singleLine = false,
  onSubmit,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null)
  const [mentionMap] = useState<Map<string, string>>(() => new Map())
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = members.filter(m =>
    m.displayName.toLowerCase().includes(searchText.toLowerCase())
  ).slice(0, 6)

  useEffect(() => {
    setDropdownIndex(0)
  }, [searchText])

  const handleInput = useCallback((newValue: string) => {
    const el = inputRef.current
    if (!el) return

    const cursorPos = el.selectionStart ?? newValue.length
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@([^\s]*)$/)

    if (atMatch) {
      setMentionStartPos(cursorPos - atMatch[0].length)
      setSearchText(atMatch[1])
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
      setMentionStartPos(null)
    }

    onChange(newValue)
  }, [onChange])

  const insertMention = useCallback((member: MentionMember) => {
    if (mentionStartPos === null) return

    const before = value.slice(0, mentionStartPos)
    const el = inputRef.current
    const cursorPos = el?.selectionStart ?? value.length
    const after = value.slice(cursorPos)

    const displayText = `@${member.displayName} `
    const newValue = before + displayText + after
    mentionMap.set(member.displayName, member.id)
    onMentionsChange(new Map(mentionMap))

    onChange(newValue)
    setShowDropdown(false)
    setMentionStartPos(null)

    requestAnimationFrame(() => {
      if (el) {
        const newPos = before.length + displayText.length
        el.focus()
        el.setSelectionRange(newPos, newPos)
      }
    })
  }, [value, mentionStartPos, mentionMap, onChange, onMentionsChange])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) {
      if (singleLine && e.key === 'Enter') {
        e.preventDefault()
        onSubmit?.()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDropdownIndex(i => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDropdownIndex(i => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(filtered[dropdownIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowDropdown(false)
    }
  }

  const inputClasses = cn(
    'w-full px-3 py-2 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest',
    className
  )

  const InputTag = singleLine ? 'input' : 'textarea'

  return (
    <div className="relative">
      <InputTag
        ref={inputRef as any}
        className={inputClasses}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={singleLine ? undefined : rows}
        aria-label={ariaLabel}
      />

      {showDropdown && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-lg border border-cream-dark z-20 max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Mention suggestions"
        >
          {filtered.map((member, i) => (
            <button
              key={member.id}
              type="button"
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                i === dropdownIndex ? 'bg-cream text-forest' : 'hover:bg-cream/50'
              )}
              onClick={() => insertMention(member)}
              role="option"
              aria-selected={i === dropdownIndex}
            >
              <span className="font-medium">{member.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
