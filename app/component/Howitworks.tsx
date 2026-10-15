'use client';

import { fill, useT } from '@/lib/i18n/I18nProvider';
import { AccountIcon, KaabaIcon, SmartphoneIcon } from './Icons';
import { Reveal } from './Reveal';

export default function HowItWorks() {
  const { t } = useT();
  const steps = [
    { number: '01', Icon: SmartphoneIcon, title: t.how.downloadTitle, description: t.how.downloadBody },
    { number: '02', Icon: AccountIcon, title: t.how.accountTitle, description: t.how.accountBody },
    { number: '03', Icon: KaabaIcon, title: t.how.journeyTitle, description: t.how.journeyBody },
  ];

  return (
    <section className="section-padding" style={{ backgroundColor: '#fff' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            {t.how.label}
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F' }}>
            {t.how.title}
          </h2>
        </div>
      </Reveal>

      <div className="steps-row">
        {steps.map((step, index) => (
          <Reveal key={step.number} delay={index * 100} className="step-item">
            {index < steps.length - 1 && (
              <div className="step-connector" />
            )}

            <div className="step-icon-wrap">
              <step.Icon size={32} />
            </div>

            <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' }}>
              {fill(t.how.step, { n: step.number })}
            </div>

            <h3 style={{ color: '#1E3A5F', fontSize: '18px', fontWeight: '500', marginBottom: '10px' }}>
              {step.title}
            </h3>

            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              {step.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
