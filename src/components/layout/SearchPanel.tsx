import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/common'
import { useQuery } from '@tanstack/react-query'
import { dbService } from '@/services/firebase/db'
import type { Event, KetePost, User, Gathering } from '@/types'

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
      users.forEach((user: User) => {
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
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case 'kete':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case 'group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'user':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
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
      className="search-panel-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="search-panel" tabIndex={-1}>
        <div className="search-panel-header">
          <div className="search-panel-input-wrapper">
            <svg className="search-panel-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="search-panel-input"
              placeholder="Search events, posts, groups, members..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search"
            />
            {query && (
              <button
                className="search-panel-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            className="search-panel-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="search-panel-body">
          {!query ? (
            <div className="search-panel-hint">
              <p>Start typing to search...</p>
              <div className="search-panel-shortcuts">
                <span><kbd>Ctrl</kbd>+<kbd>K</kbd> to open</span>
                <span><kbd>Esc</kbd> to close</span>
              </div>
            </div>
          ) : query.length < 2 ? (
            <div className="search-panel-hint">
              <p>Type at least 2 characters to search</p>
            </div>
          ) : isLoading ? (
            <div className="search-panel-loading">
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="rectangular" height={50} />
            </div>
          ) : results.length === 0 ? (
            <div className="search-panel-empty">
              <p>No results found for "{query}"</p>
              <span>Try different keywords or check your spelling</span>
            </div>
          ) : (
            <ul className="search-results" role="list">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    className="search-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="search-result-icon">
                      {getSearchIcon(result.type)}
                    </div>
                    <div className="search-result-content">
                      <p className="search-result-title">{result.title}</p>
                      {result.subtitle && (
                        <span className="search-result-subtitle">{result.subtitle}</span>
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
