import { NextResponse } from "next/server"
import { verificationGaps } from "@/lib/agentAccount"
import { oneMonthFrom } from "@/lib/agentFormat"
import { sendAgentLifecycleEmail, sendInfoRequestEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const ACTIONS = new Set(["suspend", "set_plan", "verify", "extend", "notes", "request_info"])

function isDate(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
}

async function agentAddress(row: { email: string | null; user_id: string | null; owner_user_id: string | null }) {
  const listed = row.email?.trim()
  if (listed) return listed
  const userId = row.user_id || row.owner_user_id
  if (!userId) return ""
  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId)
  if (error) throw new Error(error.message)
  return data.user?.email?.trim() || ""
}

/** Keeps time the agent already paid for; otherwise uses the admin's free-until date, or none (agent must pay). */
function keepOrFreeUntil(current: string | null, freeUntil: unknown) {
  const today = new Date().toISOString().slice(0, 10)
  const paid = current && current.slice(0, 10) > today ? current.slice(0, 10) : null
  const free = isDate(freeUntil) && freeUntil > today ? freeUntil : null
  if (paid && free) return paid > free ? paid : free
  return paid || free
}

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) {
    return NextResponse.json({ error: "Log in again." }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can update agents." }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const agentId = typeof body?.agentId === "string" ? body.agentId : ""
  const action = typeof body?.action === "string" ? body.action : ""
  if (!agentId || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "Choose an agent and an action." }, { status: 400 })
  }

  if (action === "verify") {
    // Verify first, pay later: the agent goes live once they pay.
    // An optional "free until" date lets the admin give free time.
    if (body.paidUntil && !isDate(body.paidUntil)) {
      return NextResponse.json({ error: "The free-until date is not valid." }, { status: 400 })
    }
    const { data: current, error: readError } = await admin
      .from("agents")
      .select("id, status, paid_until, email, user_id, owner_user_id, licence_number, doc_business_reg, doc_licence, doc_owner_id, doc_office_photo")
      .eq("id", agentId)
      .maybeSingle()
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
    if (!current) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    const status = (current.status || "").toLowerCase()
    if (status !== "pending" && status !== "expired") {
      return NextResponse.json({ error: "Only a pending or expired agent can be verified." }, { status: 400 })
    }
    // Missing documents block verifying, unless the admin confirmed "verify anyway".
    const missing = verificationGaps(current)
    if (missing.length && body.force !== true) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 })
    }

    const { data, error } = await admin
      .from("agents")
      .update({
        status: "active",
        verified: true,
        paid_until: keepOrFreeUntil(current.paid_until, body.paidUntil),
        info_request: null,
        info_requested_at: null,
      })
      .eq("id", agentId)
      .select("id, status, verified, email, user_id, owner_user_id")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    if (data.status !== "active" || !data.verified) {
      return NextResponse.json({ error: "The agent was not verified." }, { status: 500 })
    }

    try {
      const email = await agentAddress(data)
      const result = await sendAgentLifecycleEmail(agentId, "account_activated", email)
      if (result.status === "sent") {
        return NextResponse.json({ ok: true, message: "Agent verified and the email was sent." })
      }
      if (result.status === "already_sent") {
        return NextResponse.json({ ok: true, message: "Agent verified. The email was already sent." })
      }
      return NextResponse.json({ error: result.status }, { status: 502 })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send the verification email."
      return NextResponse.json({ error: message }, { status: 502 })
    }
  }

  if (action === "request_info") {
    // "Need more info": save the message, keep the agency pending, and email it.
    const message = typeof body.message === "string" ? body.message.trim() : ""
    if (message.length < 5) {
      return NextResponse.json({ error: "Write what the agency needs to send or fix." }, { status: 400 })
    }
    const { data, error } = await admin
      .from("agents")
      .update({ info_request: message.slice(0, 2000), info_requested_at: new Date().toISOString() })
      .eq("id", agentId)
      .select("id, email, user_id, owner_user_id, owner_name, business_name, agency_name")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    try {
      const to = await agentAddress(data)
      if (!to) return NextResponse.json({ ok: true, message: "Saved, but this agency has no email." })
      await sendInfoRequestEmail({
        to,
        ownerName: data.owner_name,
        businessName: data.business_name || data.agency_name,
        message,
      })
      return NextResponse.json({ ok: true, message: "Request sent by email. The agency sees it in Agent Home." })
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not send the email."
      return NextResponse.json({ error: `Saved, but the email failed: ${text}` }, { status: 502 })
    }
  }

  if (action === "suspend") {
    const { data, error } = await admin
      .from("agents")
      .update({ status: "suspended" })
      .eq("id", agentId)
      .select("id")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    return NextResponse.json({ ok: true, message: "Agent suspended." })
  }

  if (action === "set_plan") {
    const plan = body.plan === "featured" ? "pro" : body.plan === "listed" ? "basic" : ""
    if (!plan) return NextResponse.json({ error: "Choose Listed or Featured." }, { status: 400 })
    const { data, error } = await admin
      .from("agents")
      .update({ plan })
      .eq("id", agentId)
      .select("id")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    return NextResponse.json({ ok: true, message: "Plan updated." })
  }

  if (action === "notes") {
    const notes = typeof body.verificationNotes === "string" ? body.verificationNotes.trim() : null
    if (notes === null) return NextResponse.json({ error: "Enter the verification notes." }, { status: 400 })
    const { data, error } = await admin
      .from("agents")
      .update({ verification_notes: notes || null })
      .eq("id", agentId)
      .select("id")
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    return NextResponse.json({ ok: true, message: "Notes saved." })
  }

  const { data: current, error: readError } = await admin
    .from("agents")
    .select("id, status, paid_until")
    .eq("id", agentId)
    .maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  if (!current) return NextResponse.json({ error: "Agent not found." }, { status: 404 })

  const patch: { paid_until: string; status?: string } = { paid_until: oneMonthFrom(current.paid_until) }
  if (current.status === "expired") patch.status = "active"
  const { error } = await admin.from("agents").update(patch).eq("id", agentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, message: "Paid until extended by one month." })
}
