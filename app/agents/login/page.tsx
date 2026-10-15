import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import LoginForm from "./LoginForm"

export const metadata = {
  title: "Agent login | UmrahConnect",
  description: "Log in to your UmrahConnect agent dashboard.",
}

export default function AgentLoginPage() {
  return (
    <>
      <Navbar />
      <LoginForm />
      <Footer />
    </>
  )
}
