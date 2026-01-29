import { useState, useEffect, useCallback, useRef } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number // Distance in pixels to trigger refresh
  disabled?: boolean
}

interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
  pullProgress: number // 0 to 1
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshOptions): PullToRefreshState & { containerRef: React.RefObject<HTMLDivElement> } {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    pullProgress: 0
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return

    const container = containerRef.current
    if (!container) return

    // Only start pull if at the top of the scroll container
    if (container.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
  }, [disabled, state.isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return
    if (startY.current === 0) return

    const container = containerRef.current
    if (!container) return

    // Only allow pull if at top
    if (container.scrollTop > 0) {
      startY.current = 0
      setState(prev => ({ ...prev, isPulling: false, pullDistance: 0, pullProgress: 0 }))
      return
    }

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    // Only pull down, not up
    if (distance <= 0) {
      setState(prev => ({ ...prev, isPulling: false, pullDistance: 0, pullProgress: 0 }))
      return
    }

    // Apply resistance - the further you pull, the harder it gets
    const resistedDistance = Math.min(distance * 0.5, threshold * 1.5)
    const progress = Math.min(resistedDistance / threshold, 1)

    setState(prev => ({
      ...prev,
      isPulling: true,
      pullDistance: resistedDistance,
      pullProgress: progress
    }))

    // Prevent default scroll behavior when pulling
    if (distance > 0) {
      e.preventDefault()
    }
  }, [disabled, state.isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing) return
    if (!state.isPulling) return

    const shouldRefresh = state.pullProgress >= 1

    if (shouldRefresh) {
      setState(prev => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullDistance: threshold * 0.75,
        pullProgress: 1
      }))

      try {
        await onRefresh()
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          pullProgress: 0
        })
      }
    } else {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        pullProgress: 0
      })
    }

    startY.current = 0
    currentY.current = 0
  }, [disabled, state.isRefreshing, state.isPulling, state.pullProgress, threshold, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    ...state,
    containerRef
  }
}
