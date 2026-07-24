import Navbar from '../component/Navbar';
import ContactPageContent from '../component/ContactPageContent';
import Footer from '../component/footer';

export const metadata = {
  title: 'Contact Us | UmrahConnect',
  description: 'Business and contact information for UmrahConnect — myumrahconnect.com',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactPageContent />
      <Footer />
    </>
  );
}
