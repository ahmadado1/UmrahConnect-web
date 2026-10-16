import { NextResponse } from "next/server"
import { formatMoney, MANUAL_METHODS, type Currency, type ManualMethod } from "@/lib/agentPlans"
import { sendPremiumReceivedEmail, sendPremiumRejectedEmail } from "@/lib/email"
import { contactFor, extendPremium } from "@/lib/premiumBilling"
import type { PremiumPlanId } from "@/lib/premiumPlans"
import { requireAdmin } from "@/lib/requireAdmin"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

function denied(status: 401 | 403) {
  return NextResponse.json({ error: status === 401 ? "Log in again." : "Only an admin can see payments." }, { status })
}

/** Premium OPay / MyNita transfers, pending first (PayPal ones are automatic and not listed). */
export async function GET(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return denied(gate.status)
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("premium_payments")
    .select("id, user_id, plan, months, amount, currency, method, reference, receipt_path, status, admin_note, created_at")
    .neq("method", "paypal")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Add who paid (email / phone) so the admin knows who it is.
  const rows = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: u } = await admin.auth.admin.getUserById(row.user_id as string)
      return { ...row, who: u.user?.email || u.user?.phone || "" }
    }),
  )
  rows.sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"))
  return NextResponse.json({ payments: rows })
}

/** Body: { paymentId, action: "confirm" | "reject" | "receipt", note? } */
export async function POST(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return denied(gate.status)
  const body = await request.json().catch(() => null)
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : ""
  const action = body?.action
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : ""
  if (!paymentId || !["confirm", "reject", "receipt"].includes(action)) {
    return NextResponse.json({ error: "Choose a payment and an action." }, { status: 400 })
  }
  const admin = getSupabaseAdmin()

  // ─── Open the receipt (link works for 60 seconds) ───
  if (action === "receipt") {
    const { data: row } = await admin.from("premium_payments").select("receipt_path").eq("id", paymentId).maybeSingle()
    if (!row?.receipt_path) return NextResponse.json({ error: "No receipt for this payment." }, { status: 404 })
    const { data, error } = await admin.storage.from("agent-docs").createSignedUrl(row.receipt_path, 60)
    if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message || "Could not open the receipt." }, { status: 500 })
    return NextResponse.json({ url: data.signedUrl })
  }

  // Only a pending payment can change, so a double click never counts twice.
  const { data: payment, error } = await admin
    .from("premium_payments")
    .update({
      status: action === "confirm" ? "confirmed" : "rejected",
      admin_note: note || null,
      confirmed_at: action === "confirm" ? new Date().toISOString() : null,
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id, user_id, plan, months, amount, currency, method")
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!payment) return NextResponse.json({ error: "This payment was already handled." }, { status: 409 })

  const plan = (payment.plan === "yearly" ? "yearly" : "monthly") as PremiumPlanId
  const amount = formatMoney(Number(payment.amount), payment.currency as Currency)
  const contact = await contactFor(payment.user_id).catch(() => ({ email: "", name: null }))

  if (action === "confirm") {
    try {
      const premiumUntil = await extendPremium(payment.user_id, payment.months, plan)
      if (contact.email) {
        await sendPremiumReceivedEmail({
          to: contact.email,
          name: contact.name,
          planName: plan === "yearly" ? "Yearly" : "Monthly",
          amount,
          premiumUntil,
        }).catch((err) => console.error("premium received email failed:", err))
      }
      return NextResponse.json({ ok: true, message: `Confirmed. Premium until ${premiumUntil}.` })
    } catch (err) {
      // Put it back so the admin can try again.
      await admin.from("premium_payments").update({ status: "pending", confirmed_at: null }).eq("id", payment.id)
      return NextResponse.json({ error: err instanceof Error ? err.message : "Could not switch Premium on." }, { status: 500 })
    }
  }

  if (contact.email) {
    await sendPremiumRejectedEmail({
      to: contact.email,
      name: contact.name,
      amount,
      method: MANUAL_METHODS[payment.method as ManualMethod]?.label || payment.method,
      note,
    }).catch((err) => console.error("premium rejected email failed:", err))
  }
  return NextResponse.json({ ok: true, message: "Rejected and the user was emailed." })
}
