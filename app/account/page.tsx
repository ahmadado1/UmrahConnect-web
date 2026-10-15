import Navbar from "../component/Navbar"
import Footer from "../component/footer"
import AccountDashboard from "./AccountDashboard"

export const metadata = {
  title: "My account | UmrahConnect",
}

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <AccountDashboard />
      <Footer />
    </>
  )
}
