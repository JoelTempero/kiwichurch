import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common'

// Renders the "awaiting approval" screen for users whose account is
// status: 'pending'. Self-signups land here until an admin/host
// activates them via Settings.
export function PendingApprovalGate() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <div className="max-w-md w-full bg-[#faf8f4] border border-[#e0dbd2] rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-forest/10 text-forest mb-4">
          <Clock size={28} />
        </div>
        <h1 className="font-display text-2xl text-forest mb-2">Thanks for signing up, {user.displayName.split(' ')[0]}</h1>
        <p className="text-text-primary mb-2">
          We're a small church and we like to know who's joining. One of our hosts will approve your account shortly.
        </p>
        <p className="text-text-light text-sm mb-6">
          Signed in as <strong>{user.email}</strong>. You'll get full access here as soon as you're approved.
        </p>
        <Button variant="ghost" onClick={() => signOut()}>
          <LogOut size={16} className="mr-1" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
