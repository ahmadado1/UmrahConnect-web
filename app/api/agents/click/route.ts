// Called by the agent page (/a/CODE) when it opens on a phone.
// Remembers "this internet connection opened agency X" for 24 hours, so the app can ask
// "Were you sent by X?" after the person installs from the App Store (iPhone can't pass the code).
import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { clientIp, ipHash } from "@/lib/linkMatch"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { code?: string }
    const code = String(body.code || "").trim().toUpperCase()
    const ip = clientIp(request)
    if (!code || code.length > 32 || !ip) return NextResponse.json({ ok: false })

    const admin = getSupabaseAdmin()
    // Only real, active agencies.
    const { data: agent } = await admin
      .from("active_agents")
      .select("id, agent_code")
      .eq("agent_code", code)
      .maybeSingle()
    if (!agent) return NextResponse.json({ ok: false })

    await admin.from("agent_link_clicks").insert({ agent_id: agent.id, agent_code: agent.agent_code, ip_hash: ipHash(ip) })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
