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
    <Link to={`/kete/${post.id}`} className="block no-underline text-inherit hover:opacity-90 transition-opacity">
      {post.featuredImage && !imgError && (
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-base text-text-primary mb-1 line-clamp-2">{post.title}</h3>
        <p className="text-sm text-text-light">
          {post.authorName}{post.authorName && formatDate(post.publishedAt as Date) ? ' · ' : ''}{formatDate(post.publishedAt as Date)}
        </p>
      </div>
    </Link>
  )
}
