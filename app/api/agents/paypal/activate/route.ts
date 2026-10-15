import { NextResponse } from "next/server"
import { agentForUser, syncPaypalSubscription } from "@/lib/agentBilling"
import { userFromBearer } from "@/lib/requestUser"

export const dynamic = "force-dynamic"

/** Called right after the agent approves a PayPal subscription. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const subscriptionId = typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : ""
  if (!/^I-[A-Z0-9]+$/.test(subscriptionId)) {
    return NextResponse.json({ error: "Missing PayPal subscription." }, { status: 400 })
  }
  try {
    const agent = await agentForUser(user.id)
    if (!agent) return NextResponse.json({ error: "No agent profile for this login." }, { status: 404 })
    if (!agent.verified || (agent.status || "").toLowerCase() === "pending") {
      return NextResponse.json({ error: "You can pay once your agency is verified." }, { status: 403 })
    }
    const result = await syncPaypalSubscription(subscriptionId, agent.id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("paypal activate failed:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not confirm the subscription." }, { status: 502 })
  }
}
