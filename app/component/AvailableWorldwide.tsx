'use client';

import { Reveal } from './Reveal';

const languages = [
  { code: 'EN', name: 'English' },
  { code: 'AR', name: 'Arabic' },
  { code: 'FR', name: 'French' },
  { code: 'UR', name: 'Urdu' },
  { code: 'TR', name: 'Turkish' },
  { code: 'BN', name: 'Bengali' },
  { code: 'HA', name: 'Hausa' },
];

export default function AvailableWorldwide() {
  return (
    <section className="section-padding worldwide-section">
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            GLOBAL REACH
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F', margin: '0 0 12px' }}>
            Available Worldwide
          </h2>
          <p style={{ color: '#666', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            Supporting pilgrims across the world in 7 languages
          </p>
        </div>
      </Reveal>

      <div className="worldwide-flags">
        {languages.map((lang, index) => (
          <Reveal key={lang.code} delay={index * 50} slideFrom="scale" className="flag-card">
            <span className="flag-badge">{lang.code}</span>
            <span className="flag-code">{lang.code}</span>
            <span className="flag-name">{lang.name}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
