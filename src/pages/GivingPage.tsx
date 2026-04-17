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

      <div className="bg-white rounded-lg p-8 shadow-sm">
        <section className="mb-8">
          <h2 className="text-xl text-forest mb-4">Why Give?</h2>
          <p className="leading-relaxed mb-4">
            At Kiwi Church, we believe in the power of generosity. Your giving helps us:
          </p>
          <ul className="pl-6 leading-loose m-0">
            <li>Support our community gatherings</li>
            <li>Provide resources for spiritual growth</li>
            <li>Help those in need within our community</li>
            <li>Maintain and grow our online presence</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl text-forest mb-4">How to Give</h2>

          <div className="p-6 bg-cream rounded-md mb-4">
            <h3 className="text-lg mb-3">Bank Transfer</h3>
            <p className="leading-relaxed mb-4">
              You can give directly via bank transfer to our account:
            </p>
            <div className="bg-white rounded-sm p-4">
              <div className="flex justify-between py-2 border-b border-cream">
                <span className="text-text-light">Account Name:</span>
                <span className="font-semibold font-mono">Kiwi Church</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cream">
                <span className="text-text-light">Account Number:</span>
                <span className="font-semibold font-mono">00-0000-0000000-00</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-light">Reference:</span>
                <span className="font-semibold font-mono">Your name</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-cream rounded-md">
            <h3 className="text-lg mb-3">Regular Giving</h3>
            <p className="leading-relaxed m-0">
              Consider setting up an automatic payment to support us regularly.
              This helps us plan and budget for ongoing ministry.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl text-forest mb-4">Questions?</h2>
          <p className="leading-relaxed mb-4">
            If you have any questions about giving, please reach out to us.
            We're happy to chat about how your generosity makes a difference.
          </p>
          <Button variant="outline" icon={<Mail size={18} />}>
            Contact Us
          </Button>
        </section>
      </div>

      <div className="text-center mt-8 p-6 bg-cream rounded-lg">
        <p className="text-text-light m-0">
          Thank you for your generosity. Every gift, no matter the size, makes a difference.
        </p>
      </div>
    </div>
  )
}
