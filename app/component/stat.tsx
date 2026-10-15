'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { Reveal } from './Reveal';

export default function Stats() {
  const { t } = useT();
  const stats = [
    { number: '6', label: t.stats.languages },
    { number: '114', label: t.stats.surahs },
    { number: '7', label: t.stats.steps },
    { number: '35+', label: t.stats.hotels },
    { number: t.stats.freeWord, label: t.stats.free },
  ];

  return (
    <section className="stats-bar">
      {stats.map((stat, index) => (
        <Reveal key={stat.label} delay={index * 80} className="stat-item">
          <div className="stat-number" style={{ color: '#1E3A5F', fontSize: '28px', fontWeight: '500' }}>{stat.number}</div>
          <div style={{ color: 'rgba(30,58,95,0.7)', fontSize: '13px', marginTop: '2px' }}>{stat.label}</div>
        </Reveal>
      ))}
    </section>
  );
}
