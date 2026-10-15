'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { DuasDhikrIcon, GlobeIcon, KaabaIcon } from './Icons';
import { Reveal } from './Reveal';

export default function WhyUmrahConnect() {
  const { t } = useT();
  const reasons = [
    { Icon: GlobeIcon, text: t.why.ai },
    { Icon: KaabaIcon, text: t.why.steps },
    { Icon: DuasDhikrIcon, text: t.why.built },
  ];

  return (
    <section className="section-padding why-section">
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            {t.why.label}
          </div>
          <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>
            {t.why.title}
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
