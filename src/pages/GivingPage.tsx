import { Button } from '@/components/common'

export function GivingPage() {
  return (
    <div className="giving-page">
      <div className="giving-header">
        <div className="giving-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 className="giving-title">Giving</h1>
        <p className="giving-subtitle">
          Your generosity helps us continue our mission and support our communities
        </p>
      </div>

      <div className="giving-content">
        <section className="giving-section">
          <h2 className="giving-section-title">Why Give?</h2>
          <p className="giving-text">
            At Kiwi Church, we believe in the power of generosity. Your giving helps us:
          </p>
          <ul className="giving-list">
            <li>Support our community gatherings</li>
            <li>Provide resources for spiritual growth</li>
            <li>Help those in need within our community</li>
            <li>Maintain and grow our online presence</li>
          </ul>
        </section>

        <section className="giving-section">
          <h2 className="giving-section-title">How to Give</h2>

          <div className="giving-method">
            <h3 className="giving-method-title">Bank Transfer</h3>
            <p className="giving-text">
              You can give directly via bank transfer to our account:
            </p>
            <div className="giving-bank-details">
              <div className="giving-bank-row">
                <span className="giving-bank-label">Account Name:</span>
                <span className="giving-bank-value">Kiwi Church</span>
              </div>
              <div className="giving-bank-row">
                <span className="giving-bank-label">Account Number:</span>
                <span className="giving-bank-value">00-0000-0000000-00</span>
              </div>
              <div className="giving-bank-row">
                <span className="giving-bank-label">Reference:</span>
                <span className="giving-bank-value">Your name</span>
              </div>
            </div>
          </div>

          <div className="giving-method">
            <h3 className="giving-method-title">Regular Giving</h3>
            <p className="giving-text">
              Consider setting up an automatic payment to support us regularly.
              This helps us plan and budget for ongoing ministry.
            </p>
          </div>
        </section>

        <section className="giving-section">
          <h2 className="giving-section-title">Questions?</h2>
          <p className="giving-text">
            If you have any questions about giving, please reach out to us.
            We're happy to chat about how your generosity makes a difference.
          </p>
          <Button variant="outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contact Us
          </Button>
        </section>
      </div>

      <div className="giving-footer">
        <p className="giving-footer-text">
          Thank you for your generosity. Every gift, no matter the size, makes a difference.
        </p>
      </div>
    </div>
  )
}
