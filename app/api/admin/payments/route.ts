import { NextResponse } from "next/server"
import { agentById, agentEmail, emailPaymentReceived, extendAgent, METHOD_NAMES, PLAN_NAMES } from "@/lib/agentBilling"
import { formatMoney, isPlanId, type Currency } from "@/lib/agentPlans"
import { sendPaymentRejectedEmail } from "@/lib/email"
import { requireAdmin } from "@/lib/requireAdmin"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

function denied(status: 401 | 403) {
  return NextResponse.json({ error: status === 401 ? "Log in again." : "Only an admin can see payments." }, { status })
}

/** All payments, pending first. */
export async function GET(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return denied(gate.status)
  const { data, error } = await getSupabaseAdmin()
    .from("agent_payments")
    .select("id, agent_id, plan, months, amount, currency, method, reference, receipt_path, status, admin_note, created_at, confirmed_at, agents(business_name, agency_name, email, country)")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = (data ?? []).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"))
  return NextResponse.json({ payments: rows })
}

/** Confirm or reject a manual payment. Body: { paymentId, action: "confirm" | "reject", note? } */
export async function POST(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return denied(gate.status)
  const body = await request.json().catch(() => null)
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : ""
  const action = body?.action
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : ""
  if (!paymentId || (action !== "confirm" && action !== "reject")) {
    return NextResponse.json({ error: "Choose a payment and an action." }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  // Only a pending payment can change, so a double click never counts twice.
  const { data: payment, error } = await admin
    .from("agent_payments")
    .update({
      status: action === "confirm" ? "confirmed" : "rejected",
      admin_note: note || null,
      confirmed_at: action === "confirm" ? new Date().toISOString() : null,
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id, agent_id, plan, months, amount, currency, method")
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!payment) return NextResponse.json({ error: "This payment was already handled." }, { status: 409 })

  const plan = isPlanId(payment.plan) ? payment.plan : "listed"
  const currency = payment.currency as Currency
  const amount = Number(payment.amount)

  if (action === "confirm") {
    try {
      const { paidUntil } = await extendAgent(payment.agent_id, payment.months, plan)
      await emailPaymentReceived(payment.agent_id, { plan, amount, currency, months: payment.months, method: payment.method, paidUntil })
      return NextResponse.json({ ok: true, message: `Confirmed. Paid until ${paidUntil}.` })
    } catch (err) {
      // Put it back so the admin can try again.
      await admin.from("agent_payments").update({ status: "pending", confirmed_at: null }).eq("id", payment.id)
      return NextResponse.json({ error: err instanceof Error ? err.message : "Could not extend the agent." }, { status: 500 })
    }
  }

  try {
    const agent = await agentById(payment.agent_id)
    const to = agent ? await agentEmail(agent) : ""
    if (agent && to) {
      await sendPaymentRejectedEmail({
        to,
        ownerName: agent.owner_name,
        businessName: agent.business_name || agent.agency_name,
        planName: PLAN_NAMES[plan],
        amount: formatMoney(amount, currency),
        months: payment.months,
        method: METHOD_NAMES[payment.method] || payment.method,
        paidUntil: agent.paid_until,
        note,
      })
    }
  } catch (err) {
    console.error("payment rejected email failed:", err)
  }
  return NextResponse.json({ ok: true, message: "Payment rejected and the agent was emailed." })
}
