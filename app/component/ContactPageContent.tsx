'use client';

import ContactForm from './contact';
import ContactInfo from './ContactInfo';
import { Reveal } from './Reveal';
import HubSpotChat from './HubSpotChat';

// UmrahConnect WhatsApp Business chat link
const WHATSAPP_URL = 'https://wa.me/message/DYCCE67LO243B1';

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

        {/* Live chat with the UmrahConnect team (HubSpot), right on this page */}
        <Reveal threshold={0.1} slideFrom="up" delay={80}>
          <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
            <h2 style={{ color: '#1E3A5F', fontSize: '22px', fontWeight: '600', margin: '0 0 8px' }}>
              Chat with us
            </h2>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              Ask anything about UmrahConnect, Premium or agencies. If we're offline, leave your email and we'll reply.
            </p>
            {/* Prefer WhatsApp? Opens a chat with our business account */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '16px',
                padding: '12px 22px', borderRadius: '999px', background: '#25D366', color: '#fff',
                fontWeight: 600, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </Reveal>
        <HubSpotChat />

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
