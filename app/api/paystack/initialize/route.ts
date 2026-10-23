import { NextResponse } from "next/server"
import { isPlanId, MONTH_OPTIONS, SITE_URL } from "@/lib/agentPlans"
import { agentForUser } from "@/lib/agentBilling"
import { initializePaystack, nairaPrice, planCodeFor, type PaystackMeta } from "@/lib/paystack"
import { userFromBearer } from "@/lib/requestUser"

export const dynamic = "force-dynamic"

/**
 * Starts a Paystack payment and returns the checkout link.
 * Body: { kind: "premium", plan: "monthly" | "yearly", autoRenew?: boolean }
 *    or  { kind: "agent", plan: "listed" | "featured", months: 1 | 3 | 6 | 12, autoRenew?: boolean }
 * autoRenew = card charged again automatically (Paystack plan). Agencies then pay 1 month at a time.
 */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const kind = body?.kind
  const plan = String(body?.plan || "")
  const autoRenew = body?.autoRenew === true

  let meta: PaystackMeta
  let callbackPath: string
  if (kind === "premium") {
    if (plan !== "monthly" && plan !== "yearly") return NextResponse.json({ error: "Choose a plan." }, { status: 400 })
    meta = { kind, user_id: user.id, plan, months: plan === "yearly" ? 12 : 1 }
    callbackPath = "/account"
  } else if (kind === "agent") {
    if (!isPlanId(plan)) return NextResponse.json({ error: "Choose a plan." }, { status: 400 })
    const months = autoRenew ? 1 : Number(body?.months) || 1
    if (!(MONTH_OPTIONS as readonly number[]).includes(months)) return NextResponse.json({ error: "Choose how many months." }, { status: 400 })
    const agent = await agentForUser(user.id)
    if (!agent) return NextResponse.json({ error: "No agency found for this login." }, { status: 404 })
    meta = { kind, user_id: user.id, agent_id: agent.id, plan, months }
    callbackPath = "/agents/billing"
  } else {
    return NextResponse.json({ error: "Unknown payment." }, { status: 400 })
  }

  const planCode = autoRenew ? planCodeFor(meta.kind, meta.plan) : null
  if (autoRenew && !planCode) return NextResponse.json({ error: "Auto-renew is not available for this plan yet." }, { status: 400 })

  // Paystack needs an email. Phone-only accounts get a placeholder on our own domain (receipts then go nowhere).
  const email = user.email?.trim() || `user-${user.id.slice(0, 8)}@pay.myumrahconnect.com`
  const reference = `UC-${kind === "premium" ? "P" : "A"}-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`

  try {
    const url = await initializePaystack({
      email,
      amountNgn: nairaPrice(meta.kind, meta.plan, meta.months),
      reference,
      callbackUrl: `${SITE_URL}${callbackPath}?paystack=${reference}`,
      metadata: meta,
      planCode,
    })
    return NextResponse.json({ url, reference })
  } catch (err) {
    console.error("paystack initialize failed:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not start the payment." }, { status: 502 })
  }
}
