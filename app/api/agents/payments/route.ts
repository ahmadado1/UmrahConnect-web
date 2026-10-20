import { NextResponse } from "next/server"
import { agentForUser, METHOD_NAMES, PLAN_NAMES } from "@/lib/agentBilling"
import { agentPayCode, formatMoney, isPlanId, MANUAL_METHODS, MONTH_OPTIONS, priceFor, type ManualMethod } from "@/lib/agentPlans"
import { sendAdminPaymentNotice } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** An agent reports an OPay or Nita transfer. It stays pending until the admin confirms it. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const plan = body?.plan
  const months = Number(body?.months)
  const method = body?.method as ManualMethod
  const reference = typeof body?.reference === "string" ? body.reference.trim().slice(0, 120) : ""
  const receiptPath = typeof body?.receiptPath === "string" ? body.receiptPath.trim() : ""

  if (!isPlanId(plan)) return NextResponse.json({ error: "Choose a plan." }, { status: 400 })
  if (!(MONTH_OPTIONS as readonly number[]).includes(months)) return NextResponse.json({ error: "Choose how many months." }, { status: 400 })
  if (!(method in MANUAL_METHODS) || !MANUAL_METHODS[method].accountNumber.trim()) {
    return NextResponse.json({ error: "This payment method is not available." }, { status: 400 })
  }
  if (!reference) return NextResponse.json({ error: "Enter the transaction reference." }, { status: 400 })
  if (!receiptPath.startsWith(`${user.id}/payments/`) || receiptPath.includes("..")) {
    return NextResponse.json({ error: "Upload the payment receipt." }, { status: 400 })
  }

  try {
    const agent = await agentForUser(user.id)
    if (!agent) return NextResponse.json({ error: "No agent profile for this login." }, { status: 404 })
    if (!agent.verified || (agent.status || "").toLowerCase() === "pending") {
      return NextResponse.json({ error: "You can pay once your agency is verified." }, { status: 403 })
    }
    const code = agentPayCode(agent.id)
    const fullReference = `${code} · ${reference}`
    const currency = MANUAL_METHODS[method].currency
    const amount = priceFor(plan, currency, months)
    const admin = getSupabaseAdmin()
    const { data: open } = await admin
      .from("agent_payments")
      .select("id")
      .eq("agent_id", agent.id)
      .eq("status", "pending")
      .limit(3)
    if ((open ?? []).length >= 3) {
      return NextResponse.json({ error: "You already have payments waiting for review." }, { status: 429 })
    }
    const { error } = await admin.from("agent_payments").insert({
      agent_id: agent.id,
      plan,
      months,
      amount,
      currency,
      method,
      reference: fullReference,
      receipt_path: receiptPath,
      status: "pending",
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await sendAdminPaymentNotice({
        businessName: agent.business_name || agent.agency_name || "An agent",
        amount: formatMoney(amount, currency),
        method: METHOD_NAMES[method],
        reference: fullReference,
        planName: PLAN_NAMES[plan],
        months,
      })
    } catch (err) {
      console.error("admin payment notice failed:", err)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save the payment." }, { status: 500 })
  }
}
