'use client';

import { FormEvent, useState } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    color: '#333',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    color: '#1E3A5F',
    fontSize: '14px',
    fontWeight: '600' as const,
    marginBottom: '8px',
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {status === 'success' ? (
        <div
          style={{
            background: '#f0f7f0',
            border: '1px solid #b8ddb8',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#1E3A5F', fontSize: '20px', fontWeight: '600', margin: '0 0 12px' }}>
            Message sent successfully
          </p>
          <p style={{ color: '#444', lineHeight: '1.7', margin: '0 0 24px' }}>
            Thank you for reaching out. We will respond within 24–48 hours.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            style={{
              background: '#1E3A5F',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label htmlFor="name" style={labelStyle}>Your name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>Your email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="message" style={labelStyle}>Reason for contact or complaint</label>
            <textarea
              id="message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              style={{ ...inputStyle, resize: 'vertical' as const, minHeight: '140px' }}
            />
          </div>

          {status === 'error' && (
            <p style={{ color: '#b42318', fontSize: '14px', margin: 0 }}>{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              background: status === 'submitting' ? '#8fa3bc' : '#1E3A5F',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {status === 'submitting' ? 'Sending...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}
