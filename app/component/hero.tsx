'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import HeroPhones from './HeroPhones';
import StoreButtons from './StoreButtons';
import { CrescentMoonIcon } from './Icons';

const stars = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  delay: `${(i % 6) * 0.4}s`,
  size: i % 3 === 0 ? 3 : 2,
}));

export default function Hero() {
  const { t } = useT();
  return (
    <section className="hero hero-full">
      {/* Soft moving light behind the hero (navy and gold) */}
      <div className="hero-aurora" aria-hidden="true">
        <span className="hero-aurora-a" />
        <span className="hero-aurora-b" />
      </div>

      <div className="hero-particles" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className="hero-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-badge hero-enter" style={{ animationDelay: '0.05s' }}>
          <span className="hero-badge-icon">
            <CrescentMoonIcon size={18} />
          </span>
          <span>{t.hero.badge}</span>
        </div>

        <h1 className="hero-title">
          {t.hero.titleBefore}{' '}
          <span className="hero-title-gold">{t.hero.titleGold}</span>{' '}
          {t.hero.titleAfter}
        </h1>

        <p className="hero-subtitle hero-enter" style={{ animationDelay: '0.35s' }}>
          {t.hero.subtitle}
        </p>

        {/* Desktop: buttons under the text. On phones they move under the phones (see below). */}
        <StoreButtons className="hero-enter hero-store hero-store--desktop" />
      </div>

      <HeroPhones />

      {/* Phones and small screens: buttons under the fan of phones, centred, like the poster. */}
      <StoreButtons className="hero-enter hero-store hero-store--mobile" />

      {/* Mosque skyline along the bottom of the hero */}
      <svg className="hero-skyline" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 160V120h60v-10h20v10h40V96c0-18 14-32 32-36 18 4 32 18 32 36v24h30V70l6-14 6 14v50h34v-34c0-30 24-54 54-58 30 4 54 28 54 58v34h40v-20c0-12 10-22 22-24 12 2 22 12 22 24v20h46V52l7-18 7 18v68h36V90c0-40 32-72 72-78 40 6 72 38 72 78v30h36V52l7-18 7 18v68h46v-20c0-12 10-22 22-24 12 2 22 12 22 24v20h40V86c0-30 24-54 54-58 30 4 54 28 54 58v34h34V70l6-14 6 14v50h30V96c0-18 14-32 32-36 18 4 32 18 32 36v24h40v-10h20v10h60v40z" />
      </svg>

      {/* Scroll cue: leads into the journey story below */}
      <a href="#journey" className="hero-scroll-cue hero-enter" style={{ animationDelay: '0.9s' }}>
        <span>{t.hero.scroll}</span>
        <span className="hero-scroll-mouse" aria-hidden="true"><span /></span>
      </a>
    </section>
  );
}
