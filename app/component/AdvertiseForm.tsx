'use client';

import { FormEvent, useState } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type PackageChoice = 'basic' | 'premium';

const PACKAGES: { value: PackageChoice; label: string; price: string }[] = [
  { value: 'basic', label: 'Basic Featured', price: '$39.99/month' },
  { value: 'premium', label: 'Premium Featured', price: '$79.99/month' },
];

export default function AdvertiseForm() {
  const [agencyName, setAgencyName] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [packageChoice, setPackageChoice] = useState<PackageChoice>('basic');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyName, country, phone, email, packageChoice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setAgencyName('');
      setCountry('');
      setPhone('');
      setEmail('');
      setPackageChoice('basic');
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
    <div className="contact-form-wrap advertise-form-wrap">
      {status === 'success' ? (
        <div className="advertise-form-success">
          <p style={{ color: '#1E3A5F', fontSize: '20px', fontWeight: '600', margin: '0 0 12px' }}>
            Request received
          </p>
          <p style={{ color: '#444', lineHeight: '1.7', margin: '0 0 24px' }}>
            Thank you for your interest in Featured listing. We will contact you within 24–48 hours with next
            steps and an invoice.
          </p>
          <button type="button" onClick={() => setStatus('idle')} className="advertise-btn advertise-btn--primary">
            Submit another request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="advertise-form">
          <div>
            <label htmlFor="agencyName" style={labelStyle}>
              Agency name
            </label>
            <input
              id="agencyName"
              type="text"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Your agency name"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="country" style={labelStyle}>
              Country
            </label>
            <input
              id="country"
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country you operate in"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="phone" style={labelStyle}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 703 712 4869"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agency@example.com"
              style={inputStyle}
            />
          </div>

          <fieldset className="advertise-package-fieldset">
            <legend style={labelStyle}>Package choice</legend>
            <div className="advertise-package-options">
              {PACKAGES.map((pkg) => (
                <label
                  key={pkg.value}
                  className={`advertise-package-option${packageChoice === pkg.value ? ' advertise-package-option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="packageChoice"
                    value={pkg.value}
                    checked={packageChoice === pkg.value}
                    onChange={() => setPackageChoice(pkg.value)}
                  />
                  <span className="advertise-package-option-title">{pkg.label}</span>
                  <span className="advertise-package-option-price">{pkg.price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {status === 'error' && (
            <p style={{ color: '#b42318', fontSize: '14px', margin: 0 }}>{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="advertise-btn advertise-btn--primary advertise-btn--full"
          >
            {status === 'submitting' ? 'Sending...' : 'Request Featured listing'}
          </button>
        </form>
      )}
    </div>
  );
}
