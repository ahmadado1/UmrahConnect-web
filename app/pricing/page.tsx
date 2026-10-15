import Navbar from "../component/Navbar"
import Footer from "../component/footer"
import PricingContent from "./PricingContent"

export const metadata = {
  title: "Pricing | UmrahConnect",
  description: "UmrahConnect is free for pilgrims. See the plans for travel agencies.",
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <PricingContent />
      <Footer />
    </>
  )
}
