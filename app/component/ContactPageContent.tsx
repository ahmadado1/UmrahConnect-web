'use client';

import ContactForm from './contact';
import ContactInfo from './ContactInfo';
import { Reveal } from './Reveal';

export default function ContactPageContent() {
  return (
    <main style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 86px)' }}>
      <div className="page-container" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Reveal threshold={0.1} slideFrom="scale">
            <div className="section-label" style={{ marginBottom: '8px' }}>
              GET IN TOUCH
            </div>
          </Reveal>

          <Reveal threshold={0.1} slideFrom="left" delay={80}>
            <h1 className="section-title" style={{ color: '#1E3A5F', margin: '0 0 12px' }}>
              Contact
            </h1>
          </Reveal>

          <Reveal threshold={0.1} slideFrom="up" delay={160}>
            <p style={{ color: '#666', lineHeight: '1.8', margin: 0 }}>
              Reach out for support, feedback, or business inquiries.
            </p>
          </Reveal>
        </div>

        <ContactInfo />

        <Reveal threshold={0.1} slideFrom="up" delay={100}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ color: '#1E3A5F', fontSize: '22px', fontWeight: '600', margin: '0 0 8px' }}>
              Send us a message
            </h2>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              Have a question or complaint? Fill out the form below and we will respond within 24–48 hours.
            </p>
          </div>
        </Reveal>

        <ContactForm />
      </div>
    </main>
  );
}
