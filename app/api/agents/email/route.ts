import { NextResponse } from "next/server"
import { sendAgentLifecycleEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) {
    return NextResponse.json({ error: "Log in again to send this email." }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const type = body.type === "activated" || body.type === "account_activated"
    ? "account_activated"
    : body.type === "application_received"
      ? "application_received"
      : ""
  if (!type) {
    return NextResponse.json({ error: "Unknown email type." }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  if (type === "application_received") {
    const { data, error } = await admin
      .from("agents")
      .select("id")
      .or(`owner_user_id.eq.${user.id},user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "No agent application found." }, { status: 404 })
    const result = await sendAgentLifecycleEmail(data.id, type)
    return NextResponse.json(result, { status: result.status === "sent" || result.status === "already_sent" ? 200 : 502 })
  }

  const agentId = typeof body.agentId === "string" ? body.agentId : ""
  if (!agentId) {
    return NextResponse.json({ error: "Choose an agent to activate." }, { status: 400 })
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can send the activation email." }, { status: 403 })
  }

  const result = await sendAgentLifecycleEmail(agentId, "account_activated")
  return NextResponse.json(result, { status: result.status === "sent" || result.status === "already_sent" ? 200 : 502 })
}
