import Navbar from "../component/Navbar"
import Footer from "../component/footer"
import AgentsEntry from "./AgentsEntry"
import AgentsMarketing from "./AgentsMarketing"

export const metadata = {
  title: "For agents | UmrahConnect",
  description: "List your Umrah agency on UmrahConnect. Apply for a Listed or Featured partner account.",
}

export default function AgentsPage() {
  return (
    <>
      <Navbar />
      <AgentsEntry />
      <AgentsMarketing />
      <Footer />
    </>
  )
}
