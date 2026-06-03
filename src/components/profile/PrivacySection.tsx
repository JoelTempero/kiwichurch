import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/common/Toast'
import { DEFAULT_PRIVACY, type PrivacySettings } from '@/types'
import { cn } from '@/utils/cn'

type PrivacyKey = keyof PrivacySettings

const ADVANCED_ROWS: Array<{ key: PrivacyKey; label: string; hint: string }> = [
  { key: 'showBio', label: 'Show bio', hint: 'Visible in the directory.' },
  { key: 'showInterests', label: 'Show interests', hint: 'Visible in the directory.' },
  { key: 'showGroups', label: 'Show groups', hint: 'Members can see what groups you’re in.' },
  { key: 'showGallery', label: 'Show gallery', hint: 'Members can see your gallery images.' },
  { key: 'showFamily', label: 'Show family', hint: 'Off by default — keeps family list private to you.' },
]

function Toggle(props: { checked: boolean; onChange: (next: boolean) => void; labelId: string; descId?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-labelledby={props.labelId}
      aria-describedby={props.descId}
      onClick={() => props.onChange(!props.checked)}
      className={cn(
        'relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-forest/30',
        props.checked ? 'bg-forest' : 'bg-cream-dark',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform',
          props.checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

export function PrivacySection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const serverPrivacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...(user?.privacy || {}) }

  // Local copy of the privacy map so toggles feel instant — the Firestore
  // round-trip plus the user-profile mirror write was making each toggle
  // sit unmoved for a beat or two before flipping. We sync from the auth
  // store whenever the server state changes (e.g. another tab updates it).
  const [privacy, setPrivacy] = useState<PrivacySettings>(serverPrivacy)
  useEffect(() => {
    setPrivacy({ ...DEFAULT_PRIVACY, ...(user?.privacy || {}) })
  }, [user?.privacy])

  const [advancedOpen, setAdvancedOpen] = useState(false)

  // "Show my contact details" is the master switch — it flips email + phone
  // together, which is what 95% of members care about. The 5% who want
  // more granular control open the advanced drawer.
  const masterOn = privacy.showPhone !== false || privacy.showEmail !== false

  const handleMaster = async (next: boolean) => {
    const optimistic: PrivacySettings = { ...privacy, showPhone: next, showEmail: next }
    setPrivacy(optimistic)
    try {
      await updateProfile({ privacy: optimistic })
    } catch {
      setPrivacy(serverPrivacy)
      showToast('Could not update privacy', 'error')
    }
  }

  const handleAdvanced = async (key: PrivacyKey, next: boolean) => {
    const optimistic: PrivacySettings = { ...privacy, [key]: next }
    setPrivacy(optimistic)
    try {
      await updateProfile({ privacy: optimistic })
    } catch {
      setPrivacy(serverPrivacy)
      showToast('Could not update privacy', 'error')
    }
  }

  const listedOn = privacy.listInDirectory === true

  return (
    <section className="mb-6">
      <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Privacy</p>

      {/* Directory listing — master discoverability switch. Off by default. */}
      <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden mb-3">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 pr-3">
            <p id="privacy-listing-label" className="text-sm font-semibold text-text-primary m-0">
              List me in the member directory
            </p>
            <p id="privacy-listing-hint" className="text-xs text-text-light m-0">
              When off, other members can’t find you in the directory, search, or
              when starting a new message. You can still use everything yourself.
            </p>
          </div>
          <Toggle
            checked={listedOn}
            onChange={(next) => handleAdvanced('listInDirectory', next)}
            labelId="privacy-listing-label"
            descId="privacy-listing-hint"
          />
        </div>
      </div>

      {/* Master toggle */}
      <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 pr-3">
            <p id="privacy-master-label" className="text-sm font-semibold text-text-primary m-0">
              Show my contact details in the directory
            </p>
            <p id="privacy-master-hint" className="text-xs text-text-light m-0">
              Other members can see your email and phone number.
            </p>
          </div>
          <Toggle
            checked={masterOn}
            onChange={handleMaster}
            labelId="privacy-master-label"
            descId="privacy-master-hint"
          />
        </div>

        {/* Advanced drawer */}
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          aria-expanded={advancedOpen}
          aria-controls="privacy-advanced"
          className="w-full flex items-center justify-between px-4 py-2 border-t border-[#ebe6dc] text-sm text-text-light hover:bg-cream/50 transition-colors"
        >
          <span>Advanced</span>
          <ChevronDown size={16} className={cn('transition-transform', advancedOpen && 'rotate-180')} />
        </button>
        {advancedOpen && (
          <div id="privacy-advanced" className="divide-y divide-[#ebe6dc] border-t border-[#ebe6dc]">
            {ADVANCED_ROWS.map((row) => {
              const labelId = `privacy-${row.key}-label`
              const hintId = `privacy-${row.key}-hint`
              const checked = !!privacy[row.key]
              return (
                <div key={row.key} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 pr-3">
                    <p id={labelId} className="text-sm font-semibold text-text-primary m-0">{row.label}</p>
                    <p id={hintId} className="text-xs text-text-light m-0">{row.hint}</p>
                  </div>
                  <Toggle
                    checked={checked}
                    onChange={(next) => handleAdvanced(row.key, next)}
                    labelId={labelId}
                    descId={hintId}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
