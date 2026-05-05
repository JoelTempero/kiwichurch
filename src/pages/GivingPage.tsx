import { Heart, Mail } from 'lucide-react'
import { Button } from '@/components/common'

export function GivingPage() {
  return (
    <div className="max-w-[700px] mx-auto p-6">
      <div className="text-center mb-8">
        <Heart size={48} strokeWidth={1.5} className="text-terracotta mx-auto mb-4" />
        <h1 className="text-3xl mb-2">Giving</h1>
        <p className="text-text-light text-lg m-0">
          Your generosity helps us continue our mission and support our communities
        </p>
      </div>

      <div>
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Why Give?</p>
          <p className="leading-relaxed mb-4 border-b border-[#e0dbd2] pb-4">
            At Kiwi Church, we believe in the power of generosity. Your giving helps us support our
            community gatherings, provide resources for spiritual growth, help those in need, and
            maintain our online presence.
          </p>
        </section>

        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Bank Transfer</p>
          <p className="text-text-light text-sm mb-4">
            Give directly via bank transfer to our account:
          </p>

          {/* Featured: primary giving CTA */}
          <div className="bg-forest text-cream rounded-lg p-4 mb-6">
            <div className="flex justify-between py-2 border-b border-cream/20">
              <span className="text-cream/70 text-sm">Account Name</span>
              <span className="font-semibold font-mono text-cream">Kiwi Church</span>
            </div>
            <div className="flex justify-between py-2 border-b border-cream/20">
              <span className="text-cream/70 text-sm">Account Number</span>
              <span className="font-semibold font-mono text-cream">00-0000-0000000-00</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-cream/70 text-sm">Reference</span>
              <span className="font-semibold font-mono text-cream">Your name</span>
            </div>
          </div>

          <div className="border-b border-[#e0dbd2] pb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Regular Giving</h3>
            <p className="leading-relaxed text-text-light text-sm">
              Consider setting up an automatic payment to support us regularly.
              This helps us plan and budget for ongoing ministry.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">Questions?</p>
          <p className="leading-relaxed mb-4 text-text-light text-sm">
            If you have any questions about giving, please reach out to us.
            We're happy to chat about how your generosity makes a difference.
          </p>
          <Button variant="outline" icon={<Mail size={18} />}>
            Contact Us
          </Button>
        </section>

        <p className="text-text-lighter text-sm text-center pt-4 border-t border-[#e0dbd2]">
          Thank you for your generosity. Every gift, no matter the size, makes a difference.
        </p>
      </div>
    </div>
  )
}
