import { redirect } from 'next/navigation';
import { FREE_FOR_AGENCIES } from '@/lib/agentPlans';
import Navbar from '../component/Navbar';
import AdvertisePageContent from '../component/AdvertisePageContent';
import Footer from '../component/footer';

export const metadata = {
  title: 'Advertise Your Agency | UmrahConnect',
  description:
    'Get your Umrah agency featured on UmrahConnect. Reach pilgrims worldwide with gold badges, top listings, and premium visibility.',
};

export default function AdvertisePage() {
  // Agencies are free for now (founding offer): the old paid Featured prices are hidden.
  if (FREE_FOR_AGENCIES) redirect('/agents#pricing');
  return (
    <>
      <Navbar />
      <AdvertisePageContent />
      <Footer />
    </>
  );
}
