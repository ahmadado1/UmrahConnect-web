'use client';

// For travel agencies: why list in UmrahConnect, with a link to the agency sign-up.
import Link from 'next/link';
import { useT } from '@/lib/i18n/I18nProvider';
import { TravelAgentsIcon } from './Icons';
import { Reveal } from './Reveal';

export default function AgentsBand() {
  const { t } = useT();
  const a = t.agentsBand;
  const points = [
    { title: a.p1, body: a.p1Body },
    { title: a.p2, body: a.p2Body },
    { title: a.p3, body: a.p3Body },
  ];

  return (
    <section className="section-padding agents-band-section">
      <div className="agents-band">
        <Reveal slideFrom="left" className="agents-band-intro">
          <span className="svg-icon-wrap svg-icon-wrap--on-dark agents-band-icon">
            <TravelAgentsIcon size={36} />
          </span>
          <div className="section-label">{a.label}</div>
          <h2 className="section-title agents-band-title">{a.title}</h2>
          <p>{a.lead}</p>
          <Link href="/agents" className="agents-band-cta">{a.cta} →</Link>
        </Reveal>
        <div className="agents-band-points">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 120} slideFrom="right" className="agents-band-point">
              <span className="agents-band-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
