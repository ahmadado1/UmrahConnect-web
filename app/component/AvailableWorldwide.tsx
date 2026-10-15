'use client';

import { LANGUAGE_NAMES, LANGS } from '@/lib/i18n/languages';
import { useT } from '@/lib/i18n/I18nProvider';
import { Reveal } from './Reveal';

const languages = LANGS.map((code) => ({
  code: code.toUpperCase(),
  name: LANGUAGE_NAMES[code],
}));

export default function AvailableWorldwide() {
  const { t } = useT();
  return (
    <section className="section-padding worldwide-section">
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>
            {t.worldwide.label}
          </div>
          <h2 className="section-title" style={{ color: '#1E3A5F', margin: '0 0 12px' }}>
            {t.worldwide.title}
          </h2>
          <p style={{ color: '#666', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            {t.worldwide.lead}
          </p>
        </div>
      </Reveal>

      <div className="worldwide-flags">
        {languages.map((lang, index) => (
          <Reveal key={lang.code} delay={index * 50} slideFrom="scale" className="flag-card">
            <span className="flag-badge">{lang.code}</span>
            <span className="flag-code">{lang.code}</span>
            <span className="flag-name">{lang.name}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
