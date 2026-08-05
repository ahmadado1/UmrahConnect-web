'use client';

import AdvertiseForm from './AdvertiseForm';
import { AIGuideIcon, TravelAgentsIcon } from './Icons';
import { Reveal } from './Reveal';

const WHATSAPP_URL =
  'https://wa.me/2347037124869?text=Hi%2C%20I%27m%20interested%20in%20Featured%20listing%20for%20my%20Umrah%20agency%20on%20UmrahConnect.';

const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic Featured',
    price: '$39.99',
    period: '/month',
    highlight: false,
    features: ['Gold Featured badge on your listing', 'Top placement in your country list', 'Priority over free listings'],
  },
  {
    id: 'premium',
    name: 'Premium Featured',
    price: '$79.99',
    period: '/month',
    highlight: true,
    badge: 'Most visibility',
    features: [
      'Everything in Basic Featured',
      'Banner ad shown to users browsing your country',
      'Highlighted in AI guide recommendations',
      'Maximum exposure to pilgrims searching in your region',
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: 'Listed in the app', free: true, basic: true, premium: true },
  { feature: 'Gold Featured badge', free: false, basic: true, premium: true },
  { feature: 'Top of country list', free: false, basic: true, premium: true },
  { feature: 'Country banner ad', free: false, basic: false, premium: true },
  { feature: 'AI guide recommendations', free: false, basic: false, premium: true },
];

function CheckCell({ included }: { included: boolean }) {
  return (
    <span className={`advertise-check${included ? ' advertise-check--yes' : ' advertise-check--no'}`}>
      {included ? '✓' : '—'}
    </span>
  );
}

export default function AdvertisePageContent() {
  return (
    <main className="advertise-page">
      <section className="advertise-hero">
        <div className="advertise-hero-inner">
          <Reveal threshold={0.1} slideFrom="scale">
            <div className="section-label advertise-hero-label">FOR UMRAH AGENCIES</div>
          </Reveal>
          <Reveal threshold={0.1} slideFrom="left" delay={80}>
            <h1>Get Featured on UmrahConnect</h1>
          </Reveal>
          <Reveal threshold={0.1} slideFrom="up" delay={160}>
            <p>
              <strong>Featured</strong> puts your agency in front of pilgrims actively planning Umrah. When users
              browse travel agents in your country, Featured agencies appear first with a gold badge — so you stand
              out from free listings and reach more bookings.
            </p>
          </Reveal>
          <Reveal threshold={0.1} slideFrom="up" delay={240}>
            <div className="advertise-hero-icons">
              <TravelAgentsIcon size={40} stroke="#C9A84C" />
              <AIGuideIcon size={40} stroke="#C9A84C" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="advertise-section">
        <div className="page-container">
          <Reveal threshold={0.1} slideFrom="up">
            <div className="advertise-section-header">
              <div className="section-label">PRICING</div>
              <h2 className="section-title" style={{ color: '#1E3A5F', margin: '12px 0 8px' }}>
                Choose your plan
              </h2>
              <p>Simple monthly pricing. Cancel anytime after your billing period.</p>
            </div>
          </Reveal>

          <div className="advertise-pricing-grid">
            {PRICING_TIERS.map((tier, index) => (
              <Reveal key={tier.id} threshold={0.1} slideFrom={index === 0 ? 'left-lg' : 'right-lg'} delay={index * 100}>
                <article className={`advertise-pricing-card${tier.highlight ? ' advertise-pricing-card--premium' : ''}`}>
                  {tier.badge && <span className="advertise-pricing-badge">{tier.badge}</span>}
                  <h3>{tier.name}</h3>
                  <div className="advertise-pricing-price">
                    <span className="advertise-pricing-amount">{tier.price}</span>
                    <span className="advertise-pricing-period">{tier.period}</span>
                  </div>
                  <ul className="advertise-pricing-features">
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="advertise-section advertise-section--muted">
        <div className="page-container">
          <Reveal threshold={0.1} slideFrom="up">
            <div className="advertise-section-header">
              <div className="section-label">BENEFITS</div>
              <h2 className="section-title" style={{ color: '#1E3A5F', margin: '12px 0 8px' }}>
                What agencies get
              </h2>
              <p>See how Featured listing compares to a free agency profile.</p>
            </div>
          </Reveal>

          <Reveal threshold={0.1} slideFrom="up" delay={100}>
            <div className="advertise-comparison-wrap">
              <table className="advertise-comparison">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free listing</th>
                    <th>Basic Featured</th>
                    <th>Premium Featured</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>
                        <CheckCell included={row.free} />
                      </td>
                      <td>
                        <CheckCell included={row.basic} />
                      </td>
                      <td>
                        <CheckCell included={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="advertise-section">
        <div className="page-container">
          <Reveal threshold={0.1} slideFrom="up">
            <div className="advertise-section-header">
              <div className="section-label">GET STARTED</div>
              <h2 className="section-title" style={{ color: '#1E3A5F', margin: '12px 0 8px' }}>
                Request Featured listing
              </h2>
              <p>Tell us about your agency and preferred package. We will get back to you within 24–48 hours.</p>
            </div>
          </Reveal>

          <Reveal threshold={0.1} slideFrom="up" delay={100}>
            <AdvertiseForm />
          </Reveal>

          <Reveal threshold={0.1} slideFrom="up" delay={180}>
            <div className="advertise-whatsapp-wrap">
              <p>Prefer to chat first?</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="advertise-btn advertise-btn--whatsapp"
              >
                Message us on WhatsApp
              </a>
              <span className="advertise-whatsapp-number">+234 703 712 4869</span>
            </div>
          </Reveal>

          <Reveal threshold={0.1} slideFrom="up" delay={260}>
            <p className="advertise-payment-note">
              Payment is handled via invoice after we review your request and confirm your package. No payment is
              required when submitting this form.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
