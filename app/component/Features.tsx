'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { FeatureIcon, type FeatureIconName } from './Icons';
import { Reveal } from './Reveal';

export default function Features() {
  const { t } = useT();
  const features: { icon: FeatureIconName; title: string; description: string }[] = [
    { icon: 'prayer-times', title: t.features.prayerTitle, description: t.features.prayerBody },
    { icon: 'quran-reader', title: t.features.quranTitle, description: t.features.quranBody },
    { icon: 'umrah-guide', title: t.features.guideTitle, description: t.features.guideBody },
    { icon: 'ai-guide', title: t.features.aiTitle, description: t.features.aiBody },
    { icon: 'maps', title: t.features.mapsTitle, description: t.features.mapsBody },
    { icon: 'services', title: t.features.servicesTitle, description: t.features.servicesBody },
  ];

  return (
    <section id="features" className="section-padding features-section" style={{ backgroundColor: '#fff' }}>
      <Reveal className="features-header">
        <div className="section-label" style={{ marginBottom: '8px', textAlign: 'center' }}>
          {t.features.label}
        </div>
        <h2 className="section-title" style={{ color: '#1E3A5F', marginBottom: '12px', textAlign: 'center' }}>
          {t.features.title}
        </h2>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          {t.features.lead}
        </p>
      </Reveal>

      <div className="feature-cards-grid">
        {features.map((feature, index) => (
          <Reveal key={feature.icon} delay={index * 100} className="feature-card">
            <FeatureIcon name={feature.icon} size={56} className="feature-card-icon" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
