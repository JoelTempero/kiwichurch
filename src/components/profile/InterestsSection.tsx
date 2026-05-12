import { useState, type KeyboardEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { X, Plus } from 'lucide-react'

const MAX_TAGS = 20
const MAX_TAG_LEN = 32

function normalise(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_TAG_LEN)
}

export function InterestsSection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const interests = user?.interests || []
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    const cleaned = normalise(draft)
    if (!cleaned) return
    if (interests.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      showToast('Already added', 'error')
      setDraft('')
      return
    }
    if (interests.length >= MAX_TAGS) {
      showToast(`Max ${MAX_TAGS} interests`, 'error')
      return
    }
    setIsSaving(true)
    try {
      await updateProfile({ interests: [...interests, cleaned] })
      setDraft('')
    } catch {
      showToast('Could not save', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async (tag: string) => {
    try {
      await updateProfile({ interests: interests.filter((t) => t !== tag) })
    } catch {
      showToast('Could not remove', 'error')
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd()
    } else if (e.key === 'Backspace' && draft === '' && interests.length > 0) {
      e.preventDefault()
      handleRemove(interests[interests.length - 1])
    }
  }

  return (
    <section className="mb-6">
      <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Interests</p>
      <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-4">
        {interests.length === 0 ? (
          <p className="text-sm text-text-light mb-3 m-0">Add a few interests so people can find common ground — gardening, te reo, tramping, music, whatever.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest/10 text-forest text-sm border border-forest/20"
              >
                {tag}
                <button
                  onClick={() => handleRemove(tag)}
                  className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-forest/20 transition-colors"
                  aria-label={`Remove ${tag}`}
                  type="button"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add an interest and press Enter"
            maxLength={MAX_TAG_LEN}
            className="flex-1 px-3 py-2 border border-sage-light rounded-md text-sm focus:outline-none focus:border-forest"
            disabled={isSaving || interests.length >= MAX_TAGS}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim() || isSaving || interests.length >= MAX_TAGS}
            className="px-3 py-2 rounded-md bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            aria-label="Add interest"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-xs text-text-lighter mt-2 m-0">{interests.length}/{MAX_TAGS}</p>
      </div>
    </section>
  )
}
