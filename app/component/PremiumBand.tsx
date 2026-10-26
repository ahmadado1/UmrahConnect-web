'use client';

// Premium teaser: what Premium adds, the starting price, and what always stays free.
import Link from 'next/link';
import { useT } from '@/lib/i18n/I18nProvider';
import { StarIcon } from './Icons';
import { Reveal } from './Reveal';

export default function PremiumBand() {
  const { t } = useT();
  const p = t.premiumBand;
  const perks = [p.p1, p.p2, p.p3, p.p4, p.p5, p.p6];

  return (
    <section className="section-padding premium-band-section">
      <Reveal slideFrom="scale" className="premium-band">
        <div className="premium-band-glow" aria-hidden="true" />
        <div className="premium-band-text">
          <div className="premium-band-badge">
            <StarIcon size={14} stroke="#1E3A5F" /> {p.label}
          </div>
          <h2>{p.title}</h2>
          <p className="premium-band-lead">{p.lead}</p>
          <div className="premium-band-actions">
            <Link href="/pricing" className="premium-band-cta">{p.cta}</Link>
            <span className="premium-band-price">{p.price}</span>
          </div>
          <p className="premium-band-free">{p.free}</p>
        </div>
        <ul className="premium-band-perks">
          {perks.map((perk, i) => (
            <Reveal as="li" key={perk} delay={120 + i * 70} slideFrom="right">
              <span className="premium-band-check" aria-hidden="true">✓</span>
              {perk}
            </Reveal>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
