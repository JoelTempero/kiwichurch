import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/common'
import { useQuery } from '@tanstack/react-query'
import { dbService } from '@/services/firebase/db'
import { Search, X, Calendar, FileText, Users, User, SlidersHorizontal, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Event, KetePost, UserProfile, Gathering } from '@/types'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
}

type ContentType = 'event' | 'kete' | 'user' | 'group'
type DateRange = 'any' | 'week' | 'month' | 'year'

interface SearchResult {
  type: ContentType
  id: string
  title: string
  subtitle?: string
  link: string
  date?: string
  authorName?: string
}

interface SearchFilters {
  types: Set<ContentType>
  dateRange: DateRange
  author: string
}

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  any: 'Any time',
  week: 'Past week',
  month: 'Past month',
  year: 'Past year'
}

function getDateCutoff(range: DateRange): Date | null {
  if (range === 'any') return null
  const now = new Date()
  switch (range) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  }
}

function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return []

      const normalizedQuery = query.toLowerCase()
      const results: SearchResult[] = []

      const events = await dbService.getEvents({ limit: 100 })
      events.forEach((event: Event) => {
        if (
          event.title.toLowerCase().includes(normalizedQuery) ||
          event.description?.toLowerCase().includes(normalizedQuery) ||
          event.location?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'event',
            id: event.id,
            title: event.title,
            subtitle: `Event - ${new Date(event.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}`,
            link: `/events?highlight=${event.id}`,
            date: event.date
          })
        }
      })

      const posts = await dbService.getKetePosts({ published: true, limit: 100 })
      posts.forEach((post: KetePost) => {
        if (
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.excerpt?.toLowerCase().includes(normalizedQuery) ||
          post.content.toLowerCase().includes(normalizedQuery)
        ) {
          const postDate = post.publishedAt
            ? (post.publishedAt instanceof Date ? post.publishedAt : post.publishedAt.toDate())
            : (post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate())
          results.push({
            type: 'kete',
            id: post.id,
            title: post.title,
            subtitle: `Post by ${post.authorName}`,
            link: `/kete/${post.id}`,
            date: postDate.toISOString().split('T')[0],
            authorName: post.authorName
          })
        }
      })

      const gatherings = await dbService.getGatherings()
      gatherings.forEach((gathering: Gathering) => {
        if (
          gathering.name.toLowerCase().includes(normalizedQuery) ||
          gathering.description?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'group',
            id: gathering.id,
            title: gathering.name,
            subtitle: 'Group',
            link: `/groups/${gathering.id}`
          })
        }
      })

      const profiles = await dbService.getAllPublicProfiles()
      profiles.forEach((profile: UserProfile) => {
        if (
          profile.displayName.toLowerCase().includes(normalizedQuery) ||
          profile.publicEmail?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'user',
            id: profile.id,
            title: profile.displayName,
            subtitle: 'Member',
            link: `/directory?highlight=${profile.id}`
          })
        }
      })

      return results.slice(0, 50)
    },
    enabled: query.length >= 2,
    staleTime: 30000
  })
}

function getSearchIcon(type: SearchResult['type']): JSX.Element {
  switch (type) {
    case 'event':
      return <Calendar size={18} />
    case 'kete':
      return <FileText size={18} />
    case 'group':
      return <Users size={18} />
    case 'user':
      return <User size={18} />
  }
}

const TYPE_CONFIG: { type: ContentType; label: string; icon: typeof Calendar }[] = [
  { type: 'event', label: 'Events', icon: Calendar },
  { type: 'kete', label: 'Kete', icon: FileText },
  { type: 'group', label: 'Groups', icon: Users },
  { type: 'user', label: 'People', icon: User }
]

const DEFAULT_FILTERS: SearchFilters = {
  types: new Set<ContentType>(['event', 'kete', 'group', 'user']),
  dateRange: 'any',
  author: ''
}

function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.types.size < 4 ||
    filters.dateRange !== 'any' ||
    filters.author.length > 0
  )
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery)

  const filteredResults = useMemo(() => {
    if (!results.length) return results

    return results.filter((result) => {
      if (!filters.types.has(result.type)) return false

      if (filters.dateRange !== 'any' && result.date) {
        const cutoff = getDateCutoff(filters.dateRange)
        if (cutoff && new Date(result.date) < cutoff) return false
      }

      if (filters.author) {
        if (!result.authorName) return false
        if (!result.authorName.toLowerCase().includes(filters.author.toLowerCase())) return false
      }

      return true
    })
  }, [results, filters])

  const toggleType = (type: ContentType) => {
    setFilters((prev) => {
      const next = new Set(prev.types)
      if (next.has(type)) {
        if (next.size > 1) next.delete(type)
      } else {
        next.add(type)
      }
      return { ...prev, types: next }
    })
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setDebouncedQuery('')
      setShowFilters(false)
      setFilters(DEFAULT_FILTERS)
    }
  }, [isOpen])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link)
    onClose()
  }

  if (!isOpen) return null

  const filtersActive = hasActiveFilters(filters)

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-overlay/50 flex items-start justify-center pt-[10vh]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[70vh] flex flex-col mx-4" tabIndex={-1}>
        <div className="flex items-center gap-2 p-3 border-b border-cream-dark">
          <div className="flex items-center gap-2 flex-1">
            <Search size={20} className="text-text-lighter flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              className="flex-1 border-none outline-none text-base bg-transparent placeholder:text-text-lighter"
              placeholder="Search events, posts, groups, members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search"
            />
            {query && (
              <button
                className="p-1 text-text-lighter hover:text-text-light transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className={cn(
              'p-1 transition-colors bg-transparent border-none cursor-pointer',
              filtersActive ? 'text-terracotta' : 'text-text-lighter hover:text-text-light'
            )}
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            className="p-1 text-text-lighter hover:text-text-light transition-colors bg-transparent border-none cursor-pointer"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {showFilters && (
          <div className="px-3 py-2.5 border-b border-cream-dark space-y-2.5 bg-cream/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-light uppercase tracking-wide">Filters</span>
              {filtersActive && (
                <button
                  className="text-xs text-terracotta hover:text-terracotta-dark bg-transparent border-none cursor-pointer"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TYPE_CONFIG.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-none cursor-pointer',
                    filters.types.has(type)
                      ? 'bg-forest text-white'
                      : 'bg-cream-dark text-text-light hover:bg-cream-dark/80'
                  )}
                  onClick={() => toggleType(type)}
                  aria-pressed={filters.types.has(type)}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-text-lighter" />
                <select
                  className="text-xs bg-white border border-cream-dark rounded px-2 py-1 text-text-primary cursor-pointer"
                  value={filters.dateRange}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value as DateRange }))}
                  aria-label="Date range filter"
                >
                  {(Object.entries(DATE_RANGE_LABELS) as [DateRange, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <User size={14} className="text-text-lighter" />
                <input
                  type="text"
                  className="text-xs bg-white border border-cream-dark rounded px-2 py-1 text-text-primary placeholder:text-text-lighter w-28"
                  placeholder="Author name"
                  value={filters.author}
                  onChange={(e) => setFilters((prev) => ({ ...prev, author: e.target.value }))}
                  aria-label="Filter by author"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!query ? (
            <div className="text-center py-8 text-text-lighter">
              <p>Start typing to search...</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-text-lighter">
                <span><kbd className="px-1.5 py-0.5 bg-cream rounded text-xs font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-cream rounded text-xs font-mono">K</kbd> to open</span>
                <span><kbd className="px-1.5 py-0.5 bg-cream rounded text-xs font-mono">Esc</kbd> to close</span>
              </div>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-8 text-text-lighter">
              <p>Type at least 2 characters to search</p>
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-text-lighter">
              <p>No results found for &quot;{query}&quot;</p>
              <span className="text-sm block mt-1">
                {filtersActive
                  ? 'Try adjusting your filters or search terms'
                  : 'Try different keywords or check your spelling'}
              </span>
            </div>
          ) : (
            <ul className="list-none m-0 p-0" role="list">
              {filteredResults.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-cream transition-colors bg-transparent border-none cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="text-text-lighter flex-shrink-0">
                      {getSearchIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary m-0 truncate">{result.title}</p>
                      {result.subtitle && (
                        <span className="text-xs text-text-light block">{result.subtitle}</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
