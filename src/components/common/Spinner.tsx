import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-[3px]',
  }

  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div
        className={cn(
          'rounded-full border-cream-dark border-t-forest animate-spin-slow',
          sizeClasses[size]
        )}
      />
    </div>
  )
}
