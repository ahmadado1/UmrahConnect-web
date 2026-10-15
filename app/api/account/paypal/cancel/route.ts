import { NextResponse } from "next/server"
import { emailPremiumStopped, premiumForUser } from "@/lib/premiumBilling"
import { cancelSubscription } from "@/lib/paypal"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** Stops Premium auto-renew. Premium stays on until the paid date. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  try {
    const row = await premiumForUser(user.id)
    if (!row?.paypal_subscription_id || row.paypal_status !== "ACTIVE") {
      return NextResponse.json({ error: "No active subscription." }, { status: 404 })
    }
    await cancelSubscription(row.paypal_subscription_id, "Cancelled by the user on myumrahconnect.com/account")
    await getSupabaseAdmin().from("user_premium").update({ paypal_status: "CANCELLED", updated_at: new Date().toISOString() }).eq("user_id", user.id)
    await emailPremiumStopped(user.id, "cancelled")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not cancel." }, { status: 502 })
  }
}
