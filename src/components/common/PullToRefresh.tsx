import { type ReactNode } from 'react'
import { ArrowDown, Loader2 } from 'lucide-react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { cn } from '@/utils/cn'

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
  className
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
      className={cn('relative min-h-full overflow-y-auto', className)}
      style={{
        transform: showIndicator ? `translateY(${pullDistance}px)` : undefined,
        transition: !isPulling ? 'transform 0.3s ease-out' : undefined,
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        className={cn(
          'absolute -top-15 left-0 right-0 flex flex-col items-center justify-center gap-2 p-4 pointer-events-none z-10 transition-all',
          showIndicator && 'pointer-events-auto'
        )}
        style={{
          transform: `translateY(${showIndicator ? 0 : -60}px)`,
          opacity: showIndicator ? 1 : 0
        }}
      >
        <div
          className="flex items-center justify-center text-forest"
          style={{ transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)` }}
        >
          {isRefreshing ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <ArrowDown size={24} />
          )}
        </div>
        <span className="text-sm text-text-light">
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
