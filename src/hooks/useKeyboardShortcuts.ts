import { useEffect, useCallback } from 'react'

interface KeyboardShortcutHandlers {
  onSearch?: () => void
  onNotifications?: () => void
  onHome?: () => void
  onEvents?: () => void
  onGroups?: () => void
  onProfile?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const isMod = e.metaKey || e.ctrlKey

    // Cmd/Ctrl + K = Search
    if (isMod && e.key === 'k') {
      e.preventDefault()
      handlers.onSearch?.()
      return
    }

    // Cmd/Ctrl + Shift + N = Notifications
    if (isMod && e.shiftKey && e.key === 'n') {
      e.preventDefault()
      handlers.onNotifications?.()
      return
    }

    // G + H = Go to Home
    // G + E = Go to Events
    // G + G = Go to Groups
    // G + P = Go to Profile
    // These are implemented as single key shortcuts when no modifier is held
    if (!isMod && !e.altKey && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          // Only trigger if followed by recent 'g' press
          // For simplicity, we'll use 'g' prefix shortcuts later
          break
      }
    }
  }, [handlers])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Hook for 'g' then letter navigation shortcuts (vim-style)
export function useNavigationShortcuts(navigate: (path: string) => void) {
  useEffect(() => {
    let gPressed = false
    let gTimeout: NodeJS.Timeout | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const isMod = e.metaKey || e.ctrlKey || e.altKey

      if (isMod) return

      if (e.key === 'g' && !gPressed) {
        gPressed = true
        gTimeout = setTimeout(() => {
          gPressed = false
        }, 1500) // 1.5 second window to press next key
        return
      }

      if (gPressed) {
        gPressed = false
        if (gTimeout) {
          clearTimeout(gTimeout)
          gTimeout = null
        }

        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault()
            navigate('/home')
            break
          case 'e':
            e.preventDefault()
            navigate('/events')
            break
          case 'g':
            e.preventDefault()
            navigate('/groups')
            break
          case 'k':
            e.preventDefault()
            navigate('/kete')
            break
          case 'p':
            e.preventDefault()
            navigate('/profile')
            break
          case 's':
            e.preventDefault()
            navigate('/settings')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (gTimeout) clearTimeout(gTimeout)
    }
  }, [navigate])
}
