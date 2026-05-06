const USER_MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g
const GROUP_MENTION_REGEX = /#\[([^\]]+)\]\(([^)]+)\)/g

export interface MentionData {
  displayName: string
  userId: string
}

export function encodeMention(displayName: string, userId: string): string {
  return `@[${displayName}](${userId})`
}

export function encodeGroupMention(groupName: string, gatheringId: string): string {
  return `#[${groupName}](${gatheringId})`
}

export function extractMentionIds(text: string): string[] {
  const ids: string[] = []
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    ids.push(match[2])
  }
  return ids
}

export function extractGroupMentionIds(text: string): string[] {
  const ids: string[] = []
  const regex = /#\[([^\]]+)\]\(([^)]+)\)/g
  let match
  while ((match = regex.exec(text)) !== null) {
    ids.push(match[2])
  }
  return ids
}

export interface MentionSegment {
  type: 'text' | 'mention' | 'groupMention'
  content: string
  userId?: string
  gatheringId?: string
}

export function parseMentions(text: string): MentionSegment[] {
  const segments: MentionSegment[] = []
  const combined = /@\[([^\]]+)\]\(([^)]+)\)|#\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'mention', content: match[1], userId: match[2] })
    } else {
      segments.push({ type: 'groupMention', content: match[3], gatheringId: match[4] })
    }
    lastIndex = combined.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}

export function stripMentionMarkup(text: string): string {
  return text
    .replace(USER_MENTION_REGEX, '@$1')
    .replace(GROUP_MENTION_REGEX, '@$1')
}
