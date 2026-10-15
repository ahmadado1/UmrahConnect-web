import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import ResetPasswordForm from "./ResetPasswordForm"

export const metadata = {
  title: "Reset agent password | UmrahConnect",
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <ResetPasswordForm />
      <Footer />
    </>
  )
}
