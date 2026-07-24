import Navbar from '../component/Navbar';
import PrivacyPolicyContent from '../component/PrivacyPolicyContent';
import Footer from '../component/footer';

export const metadata = {
  title: 'Privacy Policy | UmrahConnect',
  description: 'UmrahConnect privacy policy — how we collect, use, and protect your information.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#fff', minHeight: 'calc(100vh - 86px)' }}>
        <PrivacyPolicyContent />
      </main>
      <Footer />
    </>
  );
}
