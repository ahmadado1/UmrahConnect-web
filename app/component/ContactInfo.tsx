'use client';

import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type InfoItem = {
  label: string;
  value?: string;
  href?: string;
  content?: ReactNode;
};

const infoItems: InfoItem[] = [
  { label: 'Business Name', value: 'UmrahConnect' },
  { label: 'Website', value: 'myumrahconnect.com', href: 'https://myumrahconnect.com' },
  { label: 'Developer', value: 'Ahmad Ado Muktar' },
  { label: 'Address', value: 'No 20 Fola Crescent Jahi, Abuja, Nigeria' },
  {
    label: 'Phone / WhatsApp',
    content: (
      <>
        <a href="tel:+2347037124869" className="contact-info-value contact-info-value--strong">
          +234 703 712 4869
        </a>
        <a
          href="https://wa.me/2347037124869"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-info-whatsapp"
        >
          Message on WhatsApp
        </a>
      </>
    ),
  },
  {
    label: 'Email',
    content: (
      <>
        <a href="mailto:ahmadado1@icloud.com" className="contact-info-value contact-info-value--strong">
          ahmadado1@icloud.com
        </a>
        <p className="contact-info-alt-label">Alternative contact</p>
        <a href="mailto:ahmadado6002@gmail.com" className="contact-info-value contact-info-value--alt">
          ahmadado6002@gmail.com
        </a>
      </>
    ),
  },
];

export default function ContactInfo() {
  return (
    <div className="contact-info-card">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: '500', letterSpacing: '1px', marginBottom: '8px' }}>
          BUSINESS DETAILS
        </div>
        <h2 style={{ color: '#1E3A5F', fontSize: '24px', fontWeight: '600', margin: 0 }}>
          Business and Contact Information
        </h2>
      </div>

      <div className="contact-info-list">
        {infoItems.map((item, index) => {
          const fromLeft = index % 2 === 0;
          return (
            <Reveal
              key={item.label}
              threshold={0.1}
              slideFrom={fromLeft ? 'left-lg' : 'right-lg'}
              delay={index * 100}
              className="contact-info-item"
            >
              <span className="contact-info-label">{item.label}</span>
              {item.content ? (
                item.content
              ) : item.href ? (
                <a href={item.href} className="contact-info-value">
                  {item.value}
                </a>
              ) : (
                <span className="contact-info-value">{item.value}</span>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
