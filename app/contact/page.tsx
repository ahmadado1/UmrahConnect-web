import Navbar from '../component/Navbar';
import ContactForm from '../component/contact';
import Footer from '../component/footer';

export const metadata = {
  title: 'Contact Us | UmrahConnect',
  description: 'Get in touch with the UmrahConnect team for support, feedback, or complaints.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 86px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#1E3A5F', fontSize: '36px', fontWeight: '500', marginBottom: '8px', textAlign: 'center' }}>
            Contact Us
          </h1>
          <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '40px', textAlign: 'center' }}>
            Have a question, feedback, or complaint? Fill out the form below and our team will get back to you.
          </p>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
