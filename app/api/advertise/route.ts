import { NextResponse } from 'next/server';

const CONTACT_EMAIL = 'info@myumrahconnect.com';

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Basic Featured — $39.99/month',
  premium: 'Premium Featured — $79.99/month',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agencyName = typeof body.agencyName === 'string' ? body.agencyName.trim() : '';
    const country = typeof body.country === 'string' ? body.country.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const packageChoice = typeof body.packageChoice === 'string' ? body.packageChoice.trim() : '';

    if (!agencyName || !country || !phone || !email || !packageChoice) {
      return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }

    if (!PACKAGE_LABELS[packageChoice]) {
      return NextResponse.json({ error: 'Please select a valid package.' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Email service is not configured yet. Please try again later or contact us on WhatsApp.' },
        { status: 503 },
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'UmrahConnect <onboarding@resend.dev>';
    const packageLabel = PACKAGE_LABELS[packageChoice];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `Featured listing request — ${agencyName}`,
        text: [
          'New Featured listing request from the Advertise page',
          '',
          `Agency Name: ${agencyName}`,
          `Country: ${country}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Package: ${packageLabel}`,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Resend error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send your request. Please try again later or contact us on WhatsApp.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Advertise form error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    );
  }
}
