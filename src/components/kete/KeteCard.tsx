import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { KetePost } from '@/types'

interface KeteCardProps {
  post: KetePost
}

function formatDate(date: Date | { toDate: () => Date } | null): string {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function KeteCard({ post }: KeteCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link to={`/kete/${post.id}`} className="flex items-center gap-3 py-3 px-2 hover:bg-cream/50 transition-colors no-underline text-inherit">
      {post.featuredImage && !imgError && (
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[15px] text-text-primary truncate">{post.title}</p>
        <p className="text-sm text-text-light truncate">
          {post.authorName}{post.authorName && formatDate(post.publishedAt as Date) ? ' · ' : ''}{formatDate(post.publishedAt as Date)}
        </p>
      </div>
    </Link>
  )
}
