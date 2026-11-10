import { redirect } from "next/navigation"

// The admin page now lives inside the Agent Zone (same menu), at /agents/admin.
export default function AdminAgentsPage() {
  redirect("/agents/admin")
}
