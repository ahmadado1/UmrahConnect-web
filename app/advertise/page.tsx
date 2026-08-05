import Navbar from '../component/Navbar';
import AdvertisePageContent from '../component/AdvertisePageContent';
import Footer from '../component/footer';

export const metadata = {
  title: 'Advertise Your Agency | UmrahConnect',
  description:
    'Get your Umrah agency featured on UmrahConnect. Reach pilgrims worldwide with gold badges, top listings, and premium visibility.',
};

export default function AdvertisePage() {
  return (
    <>
      <Navbar />
      <AdvertisePageContent />
      <Footer />
    </>
  );
}
