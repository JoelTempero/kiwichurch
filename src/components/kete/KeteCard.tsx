import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge } from '@/components/common'
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
    <Link to={`/kete/${post.id}`} className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white no-underline text-inherit">
      {post.featuredImage && !imgError && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <Badge variant="default">{post.category}</Badge>
          )}
          <span className="text-xs text-text-lighter">
            {formatDate(post.publishedAt as Date)}
          </span>
        </div>
        <h3 className="text-lg font-display text-forest mb-1 line-clamp-2">{post.title}</h3>
        {post.excerpt && (
          <p className="text-sm text-text-light line-clamp-3 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2">
          <Avatar src={post.authorPhotoURL} name={post.authorName} size="sm" />
          <span className="text-xs text-text-light">{post.authorName}</span>
        </div>
      </div>
    </Link>
  )
}
