import { redirect } from "next/navigation"
import { FREE_FOR_AGENCIES } from "@/lib/agentPlans"
import Billing from "./Billing"

export const metadata = {
  title: "Pay / Renew | UmrahConnect",
}

export default function AgentBillingPage() {
  // Agencies are free for now (founding offer): nothing to pay, so send them home.
  if (FREE_FOR_AGENCIES) redirect("/agents/home")
  return <Billing />
}
