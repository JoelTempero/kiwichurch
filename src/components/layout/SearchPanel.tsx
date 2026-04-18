import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/common'
import { useQuery } from '@tanstack/react-query'
import { dbService } from '@/services/firebase/db'
import { Search, X, Calendar, FileText, Users, User } from 'lucide-react'
import type { Event, KetePost, User as UserType, Gathering } from '@/types'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  type: 'event' | 'kete' | 'user' | 'group'
  id: string
  title: string
  subtitle?: string
  link: string
}

function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return []

      const normalizedQuery = query.toLowerCase()
      const results: SearchResult[] = []

      // Search events
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
            link: `/events?highlight=${event.id}`
          })
        }
      })

      // Search kete posts
      const posts = await dbService.getKetePosts({ published: true, limit: 100 })
      posts.forEach((post: KetePost) => {
        if (
          post.title.toLowerCase().includes(normalizedQuery) ||
          post.excerpt?.toLowerCase().includes(normalizedQuery) ||
          post.content.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'kete',
            id: post.id,
            title: post.title,
            subtitle: `Post by ${post.authorName}`,
            link: `/kete/${post.id}`
          })
        }
      })

      // Search groups/gatherings
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

      // Search users (for directory)
      const users = await dbService.getAllUsers()
      users.forEach((user: UserType) => {
        if (
          user.displayName.toLowerCase().includes(normalizedQuery) ||
          user.email?.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            type: 'user',
            id: user.id,
            title: user.displayName,
            subtitle: 'Member',
            link: `/directory?highlight=${user.id}`
          })
        }
      })

      return results.slice(0, 20) // Limit to 20 results
    },
    enabled: query.length >= 2,
    staleTime: 30000 // 30 seconds
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

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setDebouncedQuery('')
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
            className="p-1 text-text-lighter hover:text-text-light transition-colors bg-transparent border-none cursor-pointer"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

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
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-text-lighter">
              <p>No results found for "{query}"</p>
              <span className="text-sm block mt-1">Try different keywords or check your spelling</span>
            </div>
          ) : (
            <ul className="list-none m-0 p-0" role="list">
              {results.map((result) => (
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
