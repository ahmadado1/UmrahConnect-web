import "server-only"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

/** Returns the user when the request comes from an admin, otherwise an HTTP status. */
export async function requireAdmin(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return { status: 401 as const }
  const { data } = await getSupabaseAdmin().from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (data?.role !== "admin") return { status: 403 as const }
  return { user }
}
