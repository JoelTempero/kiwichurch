import { cn } from '@/utils/cn'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
  className?: string
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className
}: SkeletonProps) {
  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100px')
  }

  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === 'card') {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-white">
            <div className={cn('animate-pulse bg-cream-dark', className)} style={{ height: '120px' }} />
            <div className="p-4 space-y-2">
              <div className="animate-pulse bg-cream-dark rounded h-4 w-3/5" />
              <div className="animate-pulse bg-cream-dark rounded h-4 w-4/5" />
              <div className="animate-pulse bg-cream-dark rounded h-4 w-2/5" />
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-cream-dark',
            variant === 'circular' ? 'rounded-full' : 'rounded',
            variant === 'text' && 'mb-2',
            className
          )}
          style={style}
        />
      ))}
    </>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
      <div className="flex flex-col items-center">
        <div className="animate-pulse bg-cream-dark rounded w-6 h-7" />
        <div className="animate-pulse bg-cream-dark rounded w-8 h-3.5 mt-1" />
      </div>
      <div className="flex-1">
        <div className="animate-pulse bg-cream-dark rounded h-4 w-[70%] mb-2" />
        <div className="animate-pulse bg-cream-dark rounded h-4 w-1/2" />
      </div>
    </div>
  )
}

export function GatheringCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <div className="animate-pulse bg-cream-dark h-20" />
      <div className="p-4 space-y-2">
        <div className="animate-pulse bg-cream-dark rounded h-4 w-3/5" />
        <div className="animate-pulse bg-cream-dark rounded h-4 w-full" />
        <div className="animate-pulse bg-cream-dark rounded h-4 w-4/5" />
      </div>
    </div>
  )
}
