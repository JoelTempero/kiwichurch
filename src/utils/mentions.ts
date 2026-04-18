// Markup format: @[Display Name](userId)
const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g

export interface MentionData {
  displayName: string
  userId: string
}

export function encodeMention(displayName: string, userId: string): string {
  return `@[${displayName}](${userId})`
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

export interface MentionSegment {
  type: 'text' | 'mention'
  content: string
  userId?: string
}

export function parseMentions(text: string): MentionSegment[] {
  const segments: MentionSegment[] = []
  let lastIndex = 0
  let match

  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'mention', content: match[1], userId: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}

export function stripMentionMarkup(text: string): string {
  return text.replace(MENTION_REGEX, '@$1')
}
