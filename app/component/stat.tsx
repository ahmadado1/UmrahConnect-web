'use client';

// The numbers bar under the hero. Numbers count up once when they come into view.
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { Reveal, useInView } from './Reveal';

/** Counts from 0 to the number in `value` (keeps any "+" after it). Text values show as they are. */
function CountUp({ value }: { value: string }) {
  const { ref, inView } = useInView(0.4);
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || !match) return;
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - Math.pow(1 - p, 3)))); // ease-out
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target]);

  return (
    <span ref={ref as never} className="stat-number">
      {match ? `${inView ? shown : 0}${suffix}` : value}
    </span>
  );
}

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
          <div style={{ color: '#1E3A5F', fontSize: '28px', fontWeight: '600' }}>
            <CountUp value={stat.number} />
          </div>
          <div style={{ color: 'rgba(30,58,95,0.7)', fontSize: '13px', marginTop: '2px' }}>{stat.label}</div>
        </Reveal>
      ))}
    </section>
  );
}
