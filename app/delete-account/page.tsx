import Navbar from '../component/Navbar';
import DeleteAccountContent from '../component/DeleteAccountContent';
import Footer from '../component/footer';

export const metadata = {
  title: 'Delete Your Account | UmrahConnect',
  description:
    'Request deletion of your UmrahConnect account and associated data. Available in-app or by email.',
};

export default function DeleteAccountPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#fff', minHeight: 'calc(100vh - 86px)' }}>
        <DeleteAccountContent />
      </main>
      <Footer />
    </>
  );
}
