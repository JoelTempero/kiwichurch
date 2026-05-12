import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ComboboxProps {
  id?: string
  value: string
  onChange: (next: string) => void
  suggestions: readonly string[]
  placeholder?: string
  maxLength?: number
  className?: string
}

// Lightweight combobox: free-text input with a styled dropdown of
// suggested values. Replaces native <datalist> so the picker matches the
// rest of the app's UI across browsers.
//
// - Click the input or the chevron to open the dropdown.
// - Typing filters the suggestions case-insensitively.
// - Click a suggestion or press Enter on a highlighted one to commit.
// - Arrow keys move the highlight; Escape closes.
// - Any value can be entered freely — suggestions are just shortcuts.
export function Combobox({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  maxLength,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = (() => {
    const q = value.trim().toLowerCase()
    if (!q) return suggestions
    return suggestions.filter((s) => s.toLowerCase().includes(q))
  })()

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlight(-1)
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [isOpen])

  // Keep highlight visible when navigating with arrows
  useEffect(() => {
    if (highlight < 0 || !listRef.current) return
    const el = listRef.current.children[highlight] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlight])

  const commit = (next: string) => {
    onChange(next)
    setIsOpen(false)
    setHighlight(-1)
    inputRef.current?.blur()
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) setIsOpen(true)
      setHighlight((h) => Math.min(filtered.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter') {
      if (isOpen && highlight >= 0 && filtered[highlight]) {
        e.preventDefault()
        commit(filtered[highlight])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setHighlight(-1)
    }
  }

  const inputBase = 'w-full px-3 py-3 pr-10 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest bg-white'

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        className={inputBase}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKey}
      />
      <button
        type="button"
        onClick={() => {
          setIsOpen((o) => !o)
          inputRef.current?.focus()
        }}
        aria-label="Toggle suggestions"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light hover:text-text-primary"
        tabIndex={-1}
      >
        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 max-h-[200px] overflow-y-auto bg-white border border-[#e0dbd2] rounded-md shadow-lg list-none p-0"
        >
          {filtered.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                // mousedown so we commit before the input loses focus
                e.preventDefault()
                commit(s)
              }}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                'px-3 py-2 cursor-pointer text-sm',
                i === highlight ? 'bg-forest text-cream' : 'text-text-primary hover:bg-cream/60',
              )}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
