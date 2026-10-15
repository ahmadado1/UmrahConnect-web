import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import AccountLogin from "./AccountLogin"

export const metadata = {
  title: "Log in | UmrahConnect",
  description: "Log in to your UmrahConnect account to manage Premium.",
}

export default function AccountLoginPage() {
  return (
    <>
      <Navbar />
      <AccountLogin />
      <Footer />
    </>
  )
}
