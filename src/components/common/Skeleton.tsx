interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1
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
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-rectangular" style={{ height: '120px' }} />
            <div className="skeleton-card-content">
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
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
          className={`skeleton skeleton-${variant}`}
          style={style}
        />
      ))}
    </>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="app-event-card skeleton-event-card">
      <div className="app-event-date">
        <div className="skeleton skeleton-text" style={{ width: '24px', height: '28px' }} />
        <div className="skeleton skeleton-text" style={{ width: '32px', height: '14px' }} />
      </div>
      <div className="app-event-info" style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: '8px' }} />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      </div>
    </div>
  )
}

export function GatheringCardSkeleton() {
  return (
    <div className="gathering-card skeleton-gathering-card">
      <div className="gathering-card-header skeleton" style={{ height: '80px' }} />
      <div className="gathering-card-body">
        <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '8px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '4px' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      </div>
    </div>
  )
}
