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
  return (
    <Link to={`/kete/${post.id}`} className="kete-card">
      {post.featuredImage && (
        <div className="kete-card-image">
          <img src={post.featuredImage} alt={post.title} />
        </div>
      )}
      <div className="kete-card-content">
        <div className="kete-card-meta">
          {post.category && (
            <Badge variant="default">{post.category}</Badge>
          )}
          <span className="kete-card-date">
            {formatDate(post.publishedAt as Date)}
          </span>
        </div>
        <h3 className="kete-card-title">{post.title}</h3>
        {post.excerpt && (
          <p className="kete-card-excerpt">{post.excerpt}</p>
        )}
        <div className="kete-card-author">
          <Avatar src={post.authorPhotoURL} name={post.authorName} size="sm" />
          <span className="kete-card-author-name">{post.authorName}</span>
        </div>
      </div>
    </Link>
  )
}
