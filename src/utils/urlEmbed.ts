const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g

export function extractUrls(text: string): string[] {
  return text.match(URL_REGEX) || []
}

export type EmbedType = 'youtube' | 'vimeo' | 'link'

export function getEmbedType(url: string): EmbedType {
  if (getYouTubeId(url)) return 'youtube'
  if (getVimeoId(url)) return 'vimeo'
  return 'link'
}

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
