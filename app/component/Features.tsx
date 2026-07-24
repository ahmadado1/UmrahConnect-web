'use client';

import { FeatureIcon, type FeatureIconName } from './Icons';
import { Reveal } from './Reveal';

const features: {
  icon: FeatureIconName;
  title: string;
  description: string;
}[] = [
  {
    icon: 'prayer-times',
    title: 'Prayer Times & Adhan',
    description:
      'Accurate prayer times for any city worldwide. Full Adhan plays automatically — even on lock screen.',
  },
  {
    icon: 'quran-reader',
    title: 'Quran Reader',
    description:
      'Complete Quran in Arabic with 7 translations. Bookmark verses and track your reading progress.',
  },
  {
    icon: 'umrah-guide',
    title: 'Umrah & Hajj Guide',
    description:
      'Step-by-step ritual guidance with duas, tips and notes for female pilgrims. Track your progress.',
  },
  {
    icon: 'ai-guide',
    title: 'AI Islamic Guide',
    description:
      'Ask any Islamic question in your language. Powered by Claude AI, available 24/7.',
  },
  {
    icon: 'maps',
    title: 'Maps & Navigation',
    description:
      'Find every gate, Zamzam station and landmark in Masjid al-Haram and Masjid an-Nabawi.',
  },
  {
    icon: 'services',
    title: 'Hotels & Services',
    description:
      '35+ hotels near the Haram with directions. Restaurants, transport, travel agents and flights.',
  },
];

export default function Features() {
  return (
    <section id="features" className="section-padding features-section" style={{ backgroundColor: '#fff' }}>
      <Reveal className="features-header">
        <div className="section-label" style={{ marginBottom: '8px', textAlign: 'center' }}>
          EVERYTHING YOU NEED
        </div>
        <h2 className="section-title" style={{ color: '#1E3A5F', marginBottom: '12px', textAlign: 'center' }}>
          Built for pilgrims, by design
        </h2>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          Every feature crafted to make your Umrah journey easier and more spiritual
        </p>
      </Reveal>

      <div className="feature-cards-grid">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 100} className="feature-card">
            <FeatureIcon name={feature.icon} size={56} className="feature-card-icon" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
