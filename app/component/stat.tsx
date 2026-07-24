'use client';

import { Reveal } from './Reveal';

const stats = [
  { number: '7', label: 'Languages' },
  { number: '114', label: 'Quran Surahs' },
  { number: '7', label: 'Umrah Steps' },
  { number: '35+', label: 'Hotels Listed' },
  { number: 'Free', label: 'Always free' },
];

export default function Stats() {
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
