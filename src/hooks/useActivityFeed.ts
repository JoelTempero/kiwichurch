import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { dbService } from '@/services/firebase'
import type { BoardPost } from '@/types/gathering'
import type { KetePost } from '@/types/kete'

export interface ActivityItem {
  id: string
  type: 'post' | 'kete'
  title: string
  description: string
  authorName: string
  authorId: string
  groupName?: string
  timestamp: Date
  link: string
}

function toDate(val: unknown): Date {
  if (val instanceof Date) return val
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate()
  }
  return new Date()
}

function postToActivity(post: BoardPost, groupName: string, groupId: string): ActivityItem {
  return {
    id: `post-${post.id}`,
    type: 'post',
    title: post.authorName,
    description: `posted in ${groupName}`,
    authorName: post.authorName,
    authorId: post.authorId,
    groupName,
    timestamp: toDate(post.createdAt),
    link: `/groups/${groupId}`
  }
}

function keteToActivity(post: KetePost): ActivityItem {
  return {
    id: `kete-${post.id}`,
    type: 'kete',
    title: post.authorName,
    description: `published "${post.title}"`,
    authorName: post.authorName,
    authorId: post.authorId,
    timestamp: toDate(post.publishedAt || post.createdAt),
    link: `/kete/${post.id}`
  }
}

export function useActivityFeed(limit = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['activityFeed', user?.id],
    queryFn: async () => {
      const activities: ActivityItem[] = []

      // Fetch recent kete posts
      const ketePosts = await dbService.getKetePosts({ published: true, limit: 5 })
      activities.push(...ketePosts.map(keteToActivity))

      // Fetch recent board posts from user's groups
      const gatheringIds = user?.assignedGatherings || []
      for (const gatheringId of gatheringIds.slice(0, 5)) {
        const gathering = await dbService.getGathering(gatheringId)
        if (!gathering) continue
        const posts = await dbService.getBoardPosts(gatheringId, { limit: 3 })
        activities.push(...posts.map(p => postToActivity(p, gathering.name, gatheringId)))
      }

      // Sort by timestamp descending, limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000
  })
}
