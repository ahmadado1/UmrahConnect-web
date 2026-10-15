import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import SignupForm from "./SignupForm"

export const metadata = {
  title: "Become a partner agent | UmrahConnect",
  description: "Create an UmrahConnect agent account and send your agency application.",
}

export default function AgentSignupPage() {
  return (
    <>
      <Navbar />
      <SignupForm />
      <Footer />
    </>
  )
}
