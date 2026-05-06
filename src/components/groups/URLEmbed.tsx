import { ExternalLink } from 'lucide-react'
import { extractUrls, getEmbedType, getYouTubeId, getVimeoId, getDomain } from '../../utils/urlEmbed'

interface URLEmbedProps {
  text: string
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full pt-[56.25%] mt-2 rounded-lg overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function VimeoEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full pt-[56.25%] mt-2 rounded-lg overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://player.vimeo.com/video/${videoId}`}
        title="Vimeo video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function LinkCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      <span className="truncate">{getDomain(url)}</span>
    </a>
  )
}

export default function URLEmbed({ text }: URLEmbedProps) {
  const urls = extractUrls(text)
  if (urls.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {urls.map((url, i) => {
        const type = getEmbedType(url)
        if (type === 'youtube') {
          const id = getYouTubeId(url)
          return id ? <YouTubeEmbed key={i} videoId={id} /> : <LinkCard key={i} url={url} />
        }
        if (type === 'vimeo') {
          const id = getVimeoId(url)
          return id ? <VimeoEmbed key={i} videoId={id} /> : <LinkCard key={i} url={url} />
        }
        return <LinkCard key={i} url={url} />
      })}
    </div>
  )
}
