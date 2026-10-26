'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { LANGUAGE_NAMES, LANGS } from '@/lib/i18n/languages';
import { CrescentMoonIcon } from './Icons';
import { Reveal } from './Reveal';
import StoreButtons from './StoreButtons';

const languages = LANGS.map((code) => ({
  code: code.toUpperCase(),
  label: LANGUAGE_NAMES[code],
}));

export default function Download() {
  const { t } = useT();
  return (
    <section id="download" className="section-padding" style={{ backgroundColor: '#1E3A5F', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <Reveal className="reveal-download-moon">
        <div className="download-icon-wrap">
          <span className="svg-icon-wrap svg-icon-wrap--on-dark download-moon-icon">
            <CrescentMoonIcon size={48} />
          </span>
        </div>
      </Reveal>

      <Reveal delay={100} slideFrom="up">
        <h2 className="section-title" style={{ color: '#fff', marginBottom: '12px' }}>
          {t.download.title}
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginBottom: '36px' }}>
          {t.download.lead}
        </p>

        <StoreButtons className="download-store" />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
          {languages.map((lang) => (
            <div key={lang.code} className="lang-pill">
              <span className="lang-pill-code">{lang.code}</span>
              {lang.label}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
