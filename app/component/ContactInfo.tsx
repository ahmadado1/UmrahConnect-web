const infoItems = [
  { label: 'Business Name', value: 'UmrahConnect' },
  { label: 'Website', value: 'myumrahconnect.com', href: 'https://myumrahconnect.com' },
  { label: 'Developer', value: 'Ahmad Ado Muktar' },
  { label: 'Address', value: 'No 20 Fola Crescent Jahi, Abuja, Nigeria' },
];

export default function ContactInfo() {
  return (
    <div
      style={{
        background: '#f5f0e8',
        borderRadius: '16px',
        padding: '40px 32px',
        border: '1px solid rgba(201,168,76,0.2)',
        boxShadow: '0 8px 24px rgba(30,58,95,0.08)',
        marginBottom: '48px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: '500', letterSpacing: '1px', marginBottom: '8px' }}>
          BUSINESS DETAILS
        </div>
        <h2 style={{ color: '#1E3A5F', fontSize: '24px', fontWeight: '600', margin: 0 }}>
          Business and Contact Information
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {infoItems.map((item) => (
          <div
            key={item.label}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid rgba(30,58,95,0.06)',
            }}
          >
            <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {item.label}
            </span>
            {item.href ? (
              <a
                href={item.href}
                style={{ display: 'block', color: '#1E3A5F', fontSize: '16px', fontWeight: '500', textDecoration: 'none', marginTop: '6px' }}
              >
                {item.value}
              </a>
            ) : (
              <span style={{ display: 'block', color: '#1E3A5F', fontSize: '16px', fontWeight: '500', marginTop: '6px' }}>
                {item.value}
              </span>
            )}
          </div>
        ))}

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid rgba(30,58,95,0.06)',
          }}
        >
          <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Phone / WhatsApp
          </span>
          <a
            href="tel:+2347037124869"
            style={{ display: 'block', color: '#1E3A5F', fontSize: '16px', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}
          >
            +234 703 712 4869
          </a>
          <a
            href="https://wa.me/2347037124869"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              color: '#25D366',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              marginTop: '10px',
            }}
          >
            Message on WhatsApp
          </a>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid rgba(30,58,95,0.06)',
          }}
        >
          <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Email
          </span>
          <a
            href="mailto:ahmadado1@icloud.com"
            style={{ display: 'block', color: '#1E3A5F', fontSize: '16px', fontWeight: '600', textDecoration: 'none', marginTop: '10px' }}
          >
            ahmadado1@icloud.com
          </a>
          <p style={{ color: '#999', fontSize: '12px', margin: '8px 0 6px' }}>Alternative contact</p>
          <a
            href="mailto:ahmadado6002@gmail.com"
            style={{ display: 'block', color: '#666', fontSize: '15px', fontWeight: '500', textDecoration: 'none' }}
          >
            ahmadado6002@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
