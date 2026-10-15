import Navbar from "../component/Navbar"
import Footer from "../component/footer"
import LoginChooser from "./LoginChooser"

export const metadata = {
  title: "Log in | UmrahConnect",
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <LoginChooser />
      <Footer />
    </>
  )
}
