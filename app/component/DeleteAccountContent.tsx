'use client';

import { Reveal } from './Reveal';

const SUPPORT_EMAIL = 'info@myumrahconnect.com';
const DELETE_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Delete My Account')}`;

const deletedDataItems = [
  'Name',
  'Email address',
  'Language preference',
  'Quran progress and bookmarks',
  'Agent linkage',
  'Any saved preferences',
];

export default function DeleteAccountContent() {
  return (
    <div className="legal-page">
      <Reveal threshold={0.1} slideFrom="top">
        <h1>Delete Your UmrahConnect Account</h1>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={80}>
        <span className="privacy-updated-badge">Account deletion</span>
      </Reveal>

      <Reveal threshold={0.1} slideFrom="up" delay={120}>
        <div className="privacy-intro-box">
          You can request deletion of your UmrahConnect account and all associated data at any time.
          Choose one of the methods below. Once completed, your account and the data listed on this
          page will be permanently removed.
        </div>
      </Reveal>

      <div className="privacy-section-block">
        <Reveal threshold={0.1} slideFrom="left">
          <h2 className="privacy-section-heading">How to delete your account</h2>
        </Reveal>

        <Reveal threshold={0.1} slideFrom="up" delay={100}>
          <div className="delete-route-card">
            <h3 className="delete-route-title">Option 1 — In the app</h3>
            <p style={{ color: '#444', lineHeight: '1.8', margin: '0 0 12px' }}>
              Open UmrahConnect on your device, then go to:
            </p>
            <ol className="delete-steps">
              <li>
                Open the <strong>Me</strong> tab
              </li>
              <li>
                Tap <strong>Settings</strong>
              </li>
              <li>
                Tap <strong>Delete Account</strong> and confirm
              </li>
            </ol>
          </div>
        </Reveal>

        <Reveal threshold={0.1} slideFrom="up" delay={180}>
          <div className="delete-route-card">
            <h3 className="delete-route-title">Option 2 — By email</h3>
            <p style={{ color: '#444', lineHeight: '1.8', margin: '0 0 16px' }}>
              Send an email from the same email address registered to your UmrahConnect account,
              with the subject line <strong>Delete My Account</strong>.
            </p>
            <a href={DELETE_MAILTO} className="delete-email-btn">
              Email {SUPPORT_EMAIL}
            </a>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.7', margin: '16px 0 0' }}>
              Or write to{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#1E3A5F', fontWeight: 600 }}>
                {SUPPORT_EMAIL}
              </a>{' '}
              manually using that subject.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="privacy-section-block">
        <Reveal threshold={0.1} slideFrom="left">
          <h2 className="privacy-section-heading">Data that will be deleted</h2>
        </Reveal>

        <Reveal threshold={0.1} slideFrom="up" delay={100}>
          <p style={{ color: '#444', lineHeight: '1.8', margin: '0 0 16px' }}>
            When your account is deleted, the following data associated with your account is
            permanently removed:
          </p>
        </Reveal>

        <ul className="delete-data-list">
          {deletedDataItems.map((item, index) => (
            <Reveal
              key={item}
              as="li"
              threshold={0.1}
              slideFrom="up"
              delay={140 + index * 60}
              className="delete-data-item"
            >
              {item}
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="privacy-section-block">
        <Reveal threshold={0.1} slideFrom="left">
          <h2 className="privacy-section-heading">Deletion timeframe</h2>
        </Reveal>

        <Reveal
          threshold={0.1}
          slideFrom="bounce"
          delay={150}
          className="reveal-privacy-contact"
        >
          <div className="privacy-contact-box">
            Your account and associated data will be permanently deleted within 30 days of your
            request. You will no longer be able to sign in after deletion is complete.
          </div>
        </Reveal>
      </div>

      <div className="privacy-section-block">
        <Reveal threshold={0.1} slideFrom="left">
          <h2 className="privacy-section-heading">Questions</h2>
        </Reveal>

        <Reveal threshold={0.1} slideFrom="up" delay={100}>
          <p style={{ color: '#444', lineHeight: '1.8', margin: 0 }}>
            If you have questions about account deletion, contact us at{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{ color: '#1E3A5F', fontWeight: 600, textDecoration: 'none' }}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </div>
  );
}
