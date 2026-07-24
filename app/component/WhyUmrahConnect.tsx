'use client';

import { DuasDhikrIcon, GlobeIcon, KaabaIcon } from './Icons';
import { Reveal } from './Reveal';

const reasons = [
  {
    Icon: GlobeIcon,
    text: 'The only Umrah app with AI guidance in 7 languages',
  },
  {
    Icon: KaabaIcon,
    text: 'From home preparation to performing Tawaf — we guide every step',
  },
  {
    Icon: DuasDhikrIcon,
    text: 'Built by a Muslim, for Muslims worldwide',
  },
];

export default function WhyUmrahConnect() {
  return (
    <section className="section-padding why-section">
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            WHY UMRAHCONNECT
          </div>
          <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>
            Why UmrahConnect?
          </h2>
        </div>
      </Reveal>

      <div className="why-grid">
        {reasons.map((reason, index) => (
          <Reveal key={reason.text} delay={index * 100} slideFrom="left" className="why-card">
            <div className="why-icon">
              <span className="svg-icon-wrap svg-icon-wrap--on-dark">
                <reason.Icon size={40} />
              </span>
            </div>
            <p>{reason.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
