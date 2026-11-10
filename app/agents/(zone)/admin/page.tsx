import AdminAgents from "../../../admin/agents/AdminAgents"

export const metadata = {
  title: "Admin | UmrahConnect",
}

// Agencies admin, inside the Agent Zone (same header and menu as Home and Profile).
export default function AgentZoneAdminPage() {
  return <AdminAgents embedded />
}
