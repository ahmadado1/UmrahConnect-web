// Called once by the app on its first open (mainly iPhone).
// If the same internet connection opened an agent link in the last 24 hours, returns that
// agency's code and name so the app can ask "Were you sent by …?". Nothing is linked here:
// the person must tap "Yes" in the app.
import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { MATCH_WINDOW_MS, clientIp, ipHash } from "@/lib/linkMatch"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const ip = clientIp(request)
    if (!ip) return NextResponse.json({ match: null })
    const admin = getSupabaseAdmin()

    // Housekeeping: forget visits older than 2 days.
    await admin
      .from("agent_link_clicks")
      .delete()
      .lt("created_at", new Date(Date.now() - 2 * MATCH_WINDOW_MS).toISOString())

    const { data: click } = await admin
      .from("agent_link_clicks")
      .select("agent_id, agent_code, created_at")
      .eq("ip_hash", ipHash(ip))
      .gte("created_at", new Date(Date.now() - MATCH_WINDOW_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!click) return NextResponse.json({ match: null })

    const { data: agent } = await admin
      .from("active_agents")
      .select("agent_code, business_name")
      .eq("id", click.agent_id)
      .maybeSingle()
    if (!agent) return NextResponse.json({ match: null })

    return NextResponse.json({ match: { code: agent.agent_code, name: agent.business_name } })
  } catch {
    return NextResponse.json({ match: null })
  }
}
