import { NextResponse } from "next/server"
import { agentForUser, emailSubscriptionStopped } from "@/lib/agentBilling"
import { cancelSubscription } from "@/lib/paypal"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** Stops monthly PayPal billing. The agent stays listed until their paid-until date. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  try {
    const agent = await agentForUser(user.id)
    if (!agent?.paypal_subscription_id) return NextResponse.json({ error: "No active PayPal subscription." }, { status: 404 })
    await cancelSubscription(agent.paypal_subscription_id, "Cancelled by the agent in Agent Zone")
    await getSupabaseAdmin().from("agents").update({ paypal_status: "CANCELLED" }).eq("id", agent.id)
    await emailSubscriptionStopped(agent.id, agent.plan === "pro" ? "featured" : "listed", "cancelled")
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not cancel." }, { status: 502 })
  }
}
