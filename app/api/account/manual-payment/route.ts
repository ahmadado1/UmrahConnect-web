import { NextResponse } from "next/server"
import { formatMoney, MANUAL_METHODS, type ManualMethod } from "@/lib/agentPlans"
import { sendAdminPaymentNotice } from "@/lib/email"
import { PREMIUM_LOCAL_PRICES, PREMIUM_MONTHS, premiumPayCode, type PremiumPlanId } from "@/lib/premiumPlans"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/**
 * A pilgrim reports an OPay / MyNita transfer for Premium.
 * Nothing switches on here: the row stays "pending" until the admin checks their own account and confirms.
 */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const plan = body?.plan as PremiumPlanId
  const method = body?.method as ManualMethod
  const reference = typeof body?.reference === "string" ? body.reference.trim().slice(0, 120) : ""
  const receiptPath = typeof body?.receiptPath === "string" ? body.receiptPath.trim() : ""

  if (plan !== "monthly" && plan !== "yearly") return NextResponse.json({ error: "Choose a plan." }, { status: 400 })
  if (!(method in MANUAL_METHODS) || !MANUAL_METHODS[method].accountNumber.trim()) {
    return NextResponse.json({ error: "This payment method is not available." }, { status: 400 })
  }
  if (!reference) return NextResponse.json({ error: "Enter the transaction reference or the sender name." }, { status: 400 })
  // Receipt is optional, but if sent it must be in the user's own folder.
  if (receiptPath && (!receiptPath.startsWith(`${user.id}/payments/`) || receiptPath.includes(".."))) {
    return NextResponse.json({ error: "Upload the receipt again." }, { status: 400 })
  }

  const currency = MANUAL_METHODS[method].currency as "NGN" | "XOF"
  const amount = PREMIUM_LOCAL_PRICES[plan][currency]
  const code = premiumPayCode(user.id)
  const admin = getSupabaseAdmin()

  try {
    const { data: open } = await admin
      .from("premium_payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(3)
    if ((open ?? []).length >= 2) {
      return NextResponse.json({ error: "You already have payments waiting for review." }, { status: 429 })
    }
    const { error } = await admin.from("premium_payments").insert({
      user_id: user.id,
      plan,
      months: PREMIUM_MONTHS[plan],
      amount,
      currency,
      method,
      reference: `${code} · ${reference}`,
      receipt_path: receiptPath || null,
      status: "pending",
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await sendAdminPaymentNotice({
        businessName: `Premium · ${user.email || user.phone || code}`,
        amount: formatMoney(amount, currency),
        method: MANUAL_METHODS[method].label,
        reference: `${code} · ${reference}`,
        planName: plan === "yearly" ? "Premium yearly" : "Premium monthly",
        months: PREMIUM_MONTHS[plan],
      })
    } catch (err) {
      console.error("admin premium payment notice failed:", err)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not save the payment." }, { status: 500 })
  }
}
