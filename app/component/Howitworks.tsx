'use client';

import { AccountIcon, KaabaIcon, SmartphoneIcon } from './Icons';
import { Reveal } from './Reveal';

const steps = [
  {
    number: '01',
    Icon: SmartphoneIcon,
    title: 'Download the app',
    description: 'Available free on iOS and Android. Takes less than a minute to install.',
  },
  {
    number: '02',
    Icon: AccountIcon,
    title: 'Create your account',
    description: 'Sign up with email or Google. Choose your language from 7 options.',
  },
  {
    number: '03',
    Icon: KaabaIcon,
    title: 'Start your journey',
    description: 'Access prayer times, Umrah guide, Quran, duas and hotel bookings instantly.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding" style={{ backgroundColor: '#fff' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            SIMPLE TO GET STARTED
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F' }}>
            How it works
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
              STEP {step.number}
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
