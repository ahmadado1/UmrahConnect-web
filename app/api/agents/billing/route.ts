import { NextResponse } from "next/server"
import { agentForUser } from "@/lib/agentBilling"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** The logged-in agent's plan, PayPal subscription and payment history. */
export async function GET(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  try {
    const agent = await agentForUser(user.id)
    if (!agent) return NextResponse.json({ error: "No agent profile for this login." }, { status: 404 })
    const { data: payments, error } = await getSupabaseAdmin()
      .from("agent_payments")
      .select("id, plan, months, amount, currency, method, reference, status, admin_note, created_at, confirmed_at")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(30)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      agent: {
        id: agent.id,
        country: agent.country,
        status: agent.status,
        plan: agent.plan === "pro" ? "featured" : "listed",
        verified: Boolean(agent.verified),
        paid_until: agent.paid_until,
        paypal_subscription_id: agent.paypal_subscription_id,
        paypal_status: agent.paypal_status,
      },
      payments: payments ?? [],
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load billing." }, { status: 500 })
  }
}
