'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { CrescentMoonIcon } from './Icons';
import { Reveal } from './Reveal';

export default function About() {
  const { t } = useT();
  return (
    <section className="section-padding" style={{ backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
        <Reveal>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            {t.about.label}
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F', margin: '0 0 32px' }}>
            {t.about.title}
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="about-card">
            <div className="about-avatar">
              <CrescentMoonIcon size={36} />
            </div>

            <h3 style={{ color: '#1E3A5F', fontSize: '24px', fontWeight: '600', margin: '0 0 4px' }}>
              Ahmad Ado Muktar
            </h3>
            <p style={{ color: '#C9A84C', fontSize: '14px', fontWeight: '500', margin: '0 0 20px' }}>
              {t.about.role}
            </p>
            <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.8', margin: '0 0 24px' }}>
              {t.about.body}
            </p>
            <a
              href="mailto:ahmad@myumrahconnect.com"
              style={{ color: '#1E3A5F', fontSize: '15px', fontWeight: '500', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              ahmad@myumrahconnect.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
