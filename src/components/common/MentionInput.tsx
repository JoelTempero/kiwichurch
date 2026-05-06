import { useState, useRef, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface MentionMember {
  id: string
  displayName: string
  photoURL?: string
}

export interface MentionGroup {
  id: string
  name: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMentionsChange: (mentions: Map<string, string>) => void
  members: MentionMember[]
  groups?: MentionGroup[]
  onGroupMentionsChange?: (groupMentions: Map<string, string>) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  className?: string
  ariaLabel?: string
  singleLine?: boolean
  onSubmit?: () => void
}

type DropdownItem =
  | { kind: 'member'; member: MentionMember }
  | { kind: 'group'; group: MentionGroup }

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  members,
  groups = [],
  onGroupMentionsChange,
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
  const [groupMentionMap] = useState<Map<string, string>>(() => new Map())
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    const search = searchText.toLowerCase()
    const items: DropdownItem[] = []

    const filteredGroups = groups.filter(g =>
      g.name.toLowerCase().includes(search)
    ).slice(0, 3)
    for (const group of filteredGroups) {
      items.push({ kind: 'group', group })
    }

    const filteredMembers = members.filter(m =>
      m.displayName.toLowerCase().includes(search)
    ).slice(0, 6)
    for (const member of filteredMembers) {
      items.push({ kind: 'member', member })
    }

    return items
  }, [members, groups, searchText])

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

  const insertMention = useCallback((item: DropdownItem) => {
    if (mentionStartPos === null) return

    const before = value.slice(0, mentionStartPos)
    const el = inputRef.current
    const cursorPos = el?.selectionStart ?? value.length
    const after = value.slice(cursorPos)

    let displayText: string
    if (item.kind === 'member') {
      displayText = `@${item.member.displayName} `
      mentionMap.set(item.member.displayName, item.member.id)
      onMentionsChange(new Map(mentionMap))
    } else {
      displayText = `@${item.group.name} `
      groupMentionMap.set(item.group.name, item.group.id)
      onGroupMentionsChange?.(new Map(groupMentionMap))
    }

    const newValue = before + displayText + after
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
  }, [value, mentionStartPos, mentionMap, groupMentionMap, onChange, onMentionsChange, onGroupMentionsChange])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showDropdown || filteredItems.length === 0) {
      if (singleLine && e.key === 'Enter') {
        e.preventDefault()
        onSubmit?.()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDropdownIndex(i => (i + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDropdownIndex(i => (i - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(filteredItems[dropdownIndex])
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

      {showDropdown && filteredItems.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-lg border border-cream-dark z-20 max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Mention suggestions"
        >
          {filteredItems.map((item, i) => (
            <button
              key={item.kind === 'member' ? `m-${item.member.id}` : `g-${item.group.id}`}
              type="button"
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                i === dropdownIndex ? 'bg-cream text-forest' : 'hover:bg-cream/50'
              )}
              onClick={() => insertMention(item)}
              role="option"
              aria-selected={i === dropdownIndex}
            >
              {item.kind === 'group' ? (
                <>
                  <Users size={14} className="text-terracotta flex-shrink-0" />
                  <span className="font-medium">{item.group.name}</span>
                  <span className="text-xs text-text-lighter ml-auto">group</span>
                </>
              ) : (
                <span className="font-medium">{item.member.displayName}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
