'use client';

import PhoneMockup from './PhoneMockup';
import { Reveal } from './Reveal';
import { APP_SCREENSHOTS } from './screenshotPaths';

const screens = [
  {
    title: 'Prayer Times & Adhan',
    description: 'Live countdowns, weekly tracking, and full Adhan on lock screen.',
    screenshot: APP_SCREENSHOTS.prayer,
    slot: 'scatter-phone--1',
  },
  {
    title: 'Home',
    description: 'Your dashboard for prayer times, dhikr, and Umrah progress.',
    screenshot: APP_SCREENSHOTS.home,
    slot: 'scatter-phone--2',
  },
  {
    title: 'Umrah & Hajj Guide',
    description: 'Step-by-step rituals with duas, tips, and progress tracking.',
    screenshot: APP_SCREENSHOTS.umrahChecklist,
    slot: 'scatter-phone--3',
  },
  {
    title: 'AI Islamic Guide',
    description: 'Instant Islamic answers in your language, available 24/7.',
    screenshot: APP_SCREENSHOTS.aiGuide,
    slot: 'scatter-phone--4',
  },
  {
    title: 'Quran Reader',
    description: '114 surahs in Arabic with translations and bookmarks.',
    screenshot: APP_SCREENSHOTS.quran,
    slot: 'scatter-phone--5',
  },
  {
    title: 'Services',
    description: 'Hotels, restaurants, transport, and essential pilgrim services.',
    screenshot: APP_SCREENSHOTS.services,
    slot: 'scatter-phone--6',
  },
];

export default function Screenshots() {
  return (
    <section className="section-padding screenshots-showcase" style={{ backgroundColor: '#f5f0e8' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            SEE IT IN ACTION
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F', margin: 0 }}>
            See it in action
          </h2>
        </div>
      </Reveal>

      <div className="scatter-phones">
        {screens.map((screen, index) => (
          <Reveal key={screen.title} delay={index * 80} className={`scatter-phone ${screen.slot}`}>
            <PhoneMockup src={screen.screenshot} alt={`UmrahConnect ${screen.title}`} />
            <div className="scatter-phone-label">
              <h3>{screen.title}</h3>
              <p>{screen.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
