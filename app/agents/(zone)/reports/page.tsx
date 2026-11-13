import Reports from "./Reports"

export const metadata = {
  title: "Reports | UmrahConnect",
  robots: { index: false, follow: false },
}

// Admin-only numbers from Supabase (users, Premium, agencies, AI), inside the Agent Zone.
export default function AgentZoneReportsPage() {
  return <Reports />
}
