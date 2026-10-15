import Navbar from "../../component/Navbar"
import Footer from "../../component/footer"
import AgentCodeCard from "./AgentCodeCard"

export default async function AgentCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const agentCode = decodeURIComponent(code).toUpperCase()

  return (
    <>
      <Navbar />
      <AgentCodeCard code={agentCode} />
      <Footer />
    </>
  )
}
