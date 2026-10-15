'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { Reveal } from './Reveal';

/** Privacy policy. Text lives in lib/i18n/<lang>.ts under legalDoc. */
export default function PrivacyPolicyContent() {
  const { t } = useT();
  const doc = t.legalDoc;
  const last = doc.privacy.length - 1;
  return (
    <div className="legal-page">
      <Reveal threshold={0.1} slideFrom="top">
        <h1>{t.legal.privacy}</h1>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={80}>
        <span className="privacy-updated-badge">{doc.updated}</span>
        <p style={{ color: '#777', fontSize: '13px', margin: '10px 0 0' }}>{doc.englishPrevails}</p>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={120}>
        <div className="privacy-intro-box">{doc.privacyIntro}</div>
      </Reveal>

      {doc.privacy.map((section, index) => (
        <div key={section.title} className="privacy-section-block">
          <Reveal threshold={0.1} slideFrom="left">
            <h2 className="privacy-section-heading">{section.title}</h2>
          </Reveal>
          {index === last ? (
            <Reveal threshold={0.1} slideFrom="bounce" delay={150} className="reveal-privacy-contact">
              <div className="privacy-contact-box">
                {section.body.replace('info@myumrahconnect.com', '').trim()}{' '}
                <a href="mailto:info@myumrahconnect.com">info@myumrahconnect.com</a>
              </div>
            </Reveal>
          ) : (
            <Reveal threshold={0.1} slideFrom="up" delay={150}>
              <p style={{ color: '#444', lineHeight: '1.8', margin: 0 }}>{section.body}</p>
            </Reveal>
          )}
        </div>
      ))}
    </div>
  );
}
