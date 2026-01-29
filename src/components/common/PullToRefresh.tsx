import { ReactNode } from 'react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  className = ''
}: PullToRefreshProps) {
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    containerRef
  } = usePullToRefresh({
    onRefresh,
    disabled
  })

  const showIndicator = isPulling || isRefreshing

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh-container ${className}`}
      style={{
        transform: showIndicator ? `translateY(${pullDistance}px)` : undefined,
        transition: !isPulling ? 'transform 0.3s ease-out' : undefined
      }}
    >
      {/* Pull indicator */}
      <div
        className={`pull-indicator ${showIndicator ? 'pull-indicator-visible' : ''}`}
        style={{
          transform: `translateY(${showIndicator ? 0 : -60}px)`,
          opacity: showIndicator ? 1 : 0
        }}
      >
        <div
          className={`pull-indicator-spinner ${isRefreshing ? 'pull-indicator-refreshing' : ''}`}
          style={{
            transform: `rotate(${pullProgress * 360}deg)`
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="24"
            height="24"
          >
            {isRefreshing ? (
              // Spinning loader
              <path d="M12 2v4m0 12v4m-8-10H2m20 0h-4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            ) : (
              // Arrow down
              <>
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </>
            )}
          </svg>
        </div>
        <span className="pull-indicator-text">
          {isRefreshing
            ? 'Refreshing...'
            : pullProgress >= 1
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </span>
      </div>

      {children}
    </div>
  )
}
