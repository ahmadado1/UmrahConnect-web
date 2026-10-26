'use client';

// "Your journey, step by step": a pilgrim's journey from planning to home, one stage leading to
// the next. A gold line fills in as you scroll, each stage slides in once, and its dot lights up.
import { useEffect, useRef } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { FeatureIcon, KaabaIcon, type FeatureIconName } from './Icons';
import { Reveal } from './Reveal';

type Stage = { kicker: string; title: string; body: string; icon: FeatureIconName | 'kaaba' };

export default function JourneyStory() {
  const { t } = useT();
  const s = t.story;
  const stages: Stage[] = [
    { kicker: s.s1Kicker, title: s.s1Title, body: s.s1Body, icon: 'hotels' },
    { kicker: s.s2Kicker, title: s.s2Title, body: s.s2Body, icon: 'flights' },
    { kicker: s.s3Kicker, title: s.s3Title, body: s.s3Body, icon: 'kaaba' },
    { kicker: s.s4Kicker, title: s.s4Title, body: s.s4Body, icon: 'prayer-times' },
    { kicker: s.s5Kicker, title: s.s5Title, body: s.s5Body, icon: 'maps' },
    { kicker: s.s6Kicker, title: s.s6Title, body: s.s6Body, icon: 'quran-reader' },
  ];

  // Scroll progress of the timeline (0 → 1) drives the gold line. One passive listener,
  // updated at most once per frame, so scrolling stays smooth.
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (view * 0.6 - rect.top) / rect.height));
      el.style.setProperty('--journey-progress', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="journey" className="section-padding journey-section">
      <Reveal className="journey-header">
        <div className="section-label">{s.label}</div>
        <h2 className="section-title journey-title">{s.title}</h2>
        <p className="journey-lead">{s.lead}</p>
      </Reveal>

      <div className="journey-track" ref={trackRef}>
        {/* The line: grey base, gold fill that grows with scrolling */}
        <div className="journey-line" aria-hidden="true">
          <div className="journey-line-fill" />
        </div>

        {stages.map((stage, i) => (
          <Reveal
            key={stage.title}
            slideFrom={i % 2 === 0 ? 'left' : 'right'}
            threshold={0.3}
            className={`journey-stage ${i % 2 === 0 ? 'journey-stage--left' : 'journey-stage--right'}`}
          >
            <div className="journey-dot" aria-hidden="true">
              <span>{i + 1}</span>
            </div>
            <div className="journey-card">
              <div className="journey-icon">
                {stage.icon === 'kaaba' ? <KaabaIcon size={30} /> : <FeatureIcon name={stage.icon} size={30} />}
              </div>
              <div>
                <div className="journey-kicker">{stage.kicker}</div>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </div>
            </div>
            {/* Little arrow to the next stage */}
            {i < stages.length - 1 ? <div className="journey-next" aria-hidden="true">↓</div> : null}
          </Reveal>
        ))}
      </div>

      <Reveal className="journey-cta-wrap" delay={100}>
        <a href="#download" className="journey-cta">
          {s.cta}
          <span aria-hidden="true">→</span>
        </a>
      </Reveal>
    </section>
  );
}
