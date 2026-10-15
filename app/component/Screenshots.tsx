'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import PhoneMockup from './PhoneMockup';
import { Reveal } from './Reveal';
import { APP_SCREENSHOTS } from './screenshotPaths';

export default function Screenshots() {
  const { t } = useT();
  const screens = [
    { title: t.screens.prayerTitle, description: t.screens.prayerBody, screenshot: APP_SCREENSHOTS.prayer, slot: 'scatter-phone--1' },
    { title: t.screens.homeTitle, description: t.screens.homeBody, screenshot: APP_SCREENSHOTS.home, slot: 'scatter-phone--2' },
    { title: t.screens.guideTitle, description: t.screens.guideBody, screenshot: APP_SCREENSHOTS.umrahChecklist, slot: 'scatter-phone--3' },
    { title: t.screens.aiTitle, description: t.screens.aiBody, screenshot: APP_SCREENSHOTS.aiGuide, slot: 'scatter-phone--4' },
    { title: t.screens.quranTitle, description: t.screens.quranBody, screenshot: APP_SCREENSHOTS.quran, slot: 'scatter-phone--5' },
    { title: t.screens.servicesTitle, description: t.screens.servicesBody, screenshot: APP_SCREENSHOTS.services, slot: 'scatter-phone--6' },
  ];

  return (
    <section className="section-padding screenshots-showcase" style={{ backgroundColor: '#f5f0e8' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            {t.screens.label}
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F', margin: 0 }}>
            {t.screens.title}
          </h2>
        </div>
      </Reveal>

      <div className="scatter-phones">
        {screens.map((screen, index) => (
          <Reveal key={screen.slot} delay={index * 80} className={`scatter-phone ${screen.slot}`}>
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
