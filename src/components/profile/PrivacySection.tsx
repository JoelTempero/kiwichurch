import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { DEFAULT_PRIVACY, type PrivacySettings } from '@/types'

type PrivacyKey = keyof PrivacySettings

const ROWS: Array<{ key: PrivacyKey; label: string; hint: string }> = [
  { key: 'showEmail', label: 'Show email', hint: 'Other members can see and message your email' },
  { key: 'showPhone', label: 'Show phone', hint: 'Other members can see and call your number' },
  { key: 'showBio', label: 'Show bio', hint: 'Your bio is visible in the directory' },
  { key: 'showInterests', label: 'Show interests', hint: 'Your interest tags are visible in the directory' },
  { key: 'showGroups', label: 'Show groups', hint: 'Other members can see what groups you’re in' },
  { key: 'showGallery', label: 'Show gallery', hint: 'Your gallery images appear on your profile card' },
  { key: 'showFamily', label: 'Show family', hint: 'Off by default — family list stays private to you' },
]

export function PrivacySection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(user?.privacy || {}) }

  const handleToggle = async (key: PrivacyKey, next: boolean) => {
    try {
      await updateProfile({ privacy: { ...privacy, [key]: next } })
    } catch {
      showToast('Could not update privacy', 'error')
    }
  }

  return (
    <section className="mb-6">
      <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Privacy</p>
      <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
        {ROWS.map((row) => {
          const checked = !!privacy[row.key]
          return (
            <div key={row.key} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 pr-3">
                <p className="text-sm font-semibold text-text-primary m-0">{row.label}</p>
                <p className="text-xs text-text-light m-0">{row.hint}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={checked}
                  onChange={(e) => handleToggle(row.key, e.target.checked)}
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-forest/30 rounded-full peer-checked:bg-forest transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>
          )
        })}
      </div>
    </section>
  )
}
