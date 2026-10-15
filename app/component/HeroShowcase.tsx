'use client';

import { useT } from '@/lib/i18n/I18nProvider';

/**
 * Hero picture: a night mosque photo with three small "glass" cards
 * (next prayer, Qibla, Umrah journey). The real app screenshots stay
 * further down the page, so the top no longer repeats them.
 */
export default function HeroShowcase() {
  const { t } = useT();
  const h = t.hero;

  return (
    <div className="hero-showcase" aria-hidden="true">
      <div className="hero-showcase-photo">
        <img src="/images/hero-mosque-night.jpg" alt="" />
      </div>

      <div className="hero-glass hero-glass--prayer hero-float">
        <span className="hero-glass-label">{h.cardNext}</span>
        <strong>Maghrib</strong>
        <span className="hero-glass-time">17:42</span>
      </div>

      <div className="hero-glass hero-glass--qibla">
        <span className="hero-glass-icon">🧭</span>
        <div>
          <span className="hero-glass-label">{h.cardQibla}</span>
          <strong>136° SE</strong>
        </div>
      </div>

      <div className="hero-glass hero-glass--umrah">
        <span className="hero-glass-label">{h.cardUmrah}</span>
        <strong>{h.cardStep}</strong>
        <span className="hero-glass-bar"><span style={{ width: '43%' }} /></span>
      </div>
    </div>
  );
}
