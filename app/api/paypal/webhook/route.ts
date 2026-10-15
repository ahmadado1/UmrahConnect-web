import { NextResponse } from "next/server"
import { syncPaypalSubscription } from "@/lib/agentBilling"
import { getSubscription, verifyWebhook } from "@/lib/paypal"
import { isPremiumPaypalPlan, syncPremiumSubscription } from "@/lib/premiumBilling"

export const dynamic = "force-dynamic"

/**
 * PayPal calls this when a subscription is paid, cancelled or suspended.
 * Set it up in developer.paypal.com > your app > Webhooks, URL https://myumrahconnect.com/api/paypal/webhook,
 * then put the Webhook ID in PAYPAL_WEBHOOK_ID.
 */
export async function POST(request: Request) {
  const event = await request.json().catch(() => null)
  if (!event?.event_type) return NextResponse.json({ error: "Bad event." }, { status: 400 })

  try {
    if (!(await verifyWebhook(request.headers, event))) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
    }
  } catch (err) {
    console.error("paypal webhook verify failed:", err)
    return NextResponse.json({ error: "Could not verify." }, { status: 500 })
  }

  const type = String(event.event_type)
  const resource = event.resource || {}
  const subscriptionId: string | undefined = type.startsWith("BILLING.SUBSCRIPTION.")
    ? resource.id
    : resource.billing_agreement_id

  if (!subscriptionId) return NextResponse.json({ ok: true, ignored: type })

  try {
    const subscription = await getSubscription(subscriptionId)
    const result = isPremiumPaypalPlan(subscription.plan_id)
      ? await syncPremiumSubscription(subscriptionId)
      : await syncPaypalSubscription(subscriptionId)
    console.log(`paypal webhook ${type}: ${subscriptionId} → ${result.status}, credited ${result.credited}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`paypal webhook ${type} failed:`, err)
    // 500 makes PayPal retry later.
    return NextResponse.json({ error: err instanceof Error ? err.message : "sync failed" }, { status: 500 })
  }
}
