import { useState } from 'react'
import { cn } from '@/utils/cn'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-xl',
  xl: 'size-20 text-2xl'
}

export function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const showImage = src && !imgError

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full shrink-0 font-semibold overflow-hidden',
        showImage ? 'bg-transparent' : 'bg-sage-light text-forest',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="size-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  )
}
