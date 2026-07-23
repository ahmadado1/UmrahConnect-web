import Navbar from '../component/Navbar';
import Hotels from '../component/hotels';
import Footer from '../component/footer';

export const metadata = {
  title: 'Hotels Near Haram | UmrahConnect',
  description: 'Find the best hotels near Masjid al-Haram in Makkah and Masjid an-Nabawi in Madinah for your Umrah and Hajj journey.',
};

export default function HotelsPage() {
  return (
    <>
      <Navbar />
      <Hotels />
      <Footer />
    </>
  );
}
