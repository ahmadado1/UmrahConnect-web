import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import DeleteAccount from "./DeleteAccount"

export const metadata = {
  title: "Delete account | UmrahConnect",
}

export default function DeleteAccountPage() {
  return (
    <>
      <Navbar />
      <DeleteAccount />
      <Footer />
    </>
  )
}
