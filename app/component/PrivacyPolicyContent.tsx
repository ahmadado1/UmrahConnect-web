'use client';

import { Reveal } from './Reveal';

const dataTableRows = [
  { type: 'Account information', detail: 'Name, email address, and language preference' },
  { type: 'Location data', detail: 'GPS location for prayer times and local weather' },
  { type: 'Usage data', detail: 'Quran progress, bookmarks, and app preferences' },
];

const sections = [
  {
    title: 'Information we collect',
    content:
      'We collect your name, email address, and language preference when you create an account. We also collect your GPS location to provide accurate prayer times and weather information.',
    showTable: true,
  },
  {
    title: 'How we use your information',
    content:
      'We use your information to provide prayer times, personalize your experience, save your Quran progress and bookmarks, and process hotel booking requests.',
  },
  {
    title: 'Data storage',
    content:
      'Your data is stored securely using Supabase. We do not sell your personal information to third parties.',
  },
  {
    title: 'Google Sign In',
    content:
      'If you sign in with Google, we receive your name, email and profile picture. We do not store your Google password.',
  },
  {
    title: 'Location data',
    content:
      'We use your location only to calculate prayer times and local weather. We do not store or share your location history.',
  },
  {
    title: 'Contact us',
    content: 'If you have questions about this privacy policy, contact us at',
    isContact: true,
  },
];

export default function PrivacyPolicyContent() {
  return (
    <div className="legal-page">
      <Reveal threshold={0.1} slideFrom="top">
        <h1>Privacy Policy</h1>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={80}>
        <span className="privacy-updated-badge">Last updated: June 2026</span>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={120}>
        <div className="privacy-intro-box">
          UmrahConnect is committed to protecting your privacy. This policy explains how we collect, use and protect your information.
        </div>
      </Reveal>

      {sections.map((section) => (
        <div key={section.title} className="privacy-section-block">
          <Reveal threshold={0.1} slideFrom="left">
            <h2 className="privacy-section-heading">{section.title}</h2>
          </Reveal>

          {section.isContact ? (
            <Reveal
              threshold={0.1}
              slideFrom="bounce"
              delay={150}
              className="reveal-privacy-contact"
            >
              <div className="privacy-contact-box">
                {section.content}{' '}
                <a href="mailto:ahmadado1@icloud.com">ahmadado1@icloud.com</a>.
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal threshold={0.1} slideFrom="up" delay={150}>
                <p style={{ color: '#444', lineHeight: '1.8', margin: 0 }}>{section.content}</p>
              </Reveal>

              {section.showTable && (
                <div className="privacy-table-scroll">
                  <div className="privacy-table">
                    <div className="privacy-table-head">
                      <span>Data type</span>
                      <span>What we collect</span>
                    </div>
                    {dataTableRows.map((row, index) => (
                      <Reveal
                        key={row.type}
                        threshold={0.1}
                        slideFrom="up"
                        delay={220 + index * 80}
                        className="privacy-table-row"
                      >
                        <span>{row.type}</span>
                        <span>{row.detail}</span>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
