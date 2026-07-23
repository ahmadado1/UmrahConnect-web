import Navbar from '../component/Navbar';
import ContactInfo from '../component/ContactInfo';
import ContactForm from '../component/contact';
import Footer from '../component/footer';

export const metadata = {
  title: 'Contact Us | UmrahConnect',
  description: 'Business and contact information for UmrahConnect — myumrahconnect.com',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 86px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: '500', letterSpacing: '1px', marginBottom: '8px' }}>
              GET IN TOUCH
            </div>
            <h1 style={{ color: '#1E3A5F', fontSize: '36px', fontWeight: '500', margin: '0 0 12px' }}>
              Contact
            </h1>
            <p style={{ color: '#666', lineHeight: '1.8', margin: 0 }}>
              Reach out for support, feedback, or business inquiries.
            </p>
          </div>

          <ContactInfo />

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ color: '#1E3A5F', fontSize: '22px', fontWeight: '600', margin: '0 0 8px' }}>
              Send us a message
            </h2>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
              Have a question or complaint? Fill out the form below and we will respond within 24–48 hours.
            </p>
          </div>

          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
