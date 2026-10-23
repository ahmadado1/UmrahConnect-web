import { NextResponse } from "next/server"
import { creditPaystack, handleSubscriptionEvent, validPaystackSignature } from "@/lib/paystack"

export const dynamic = "force-dynamic"

/**
 * Paystack calls this after a payment (Paystack → Settings → API Keys & Webhooks → Webhook URL:
 * https://myumrahconnect.com/api/paystack/webhook).
 * Always answers 200 quickly for events we don't use; 500 makes Paystack retry later.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!validPaystackSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 })
  }
  const event = JSON.parse(raw || "{}")
  const name = String(event?.event || "")
  try {
    if (name === "charge.success" && event?.data?.reference) {
      // First payments and every automatic renewal arrive here.
      const result = await creditPaystack(String(event.data.reference))
      if (!result.ok) console.warn("paystack webhook not credited:", event.data.reference, result.reason)
      return NextResponse.json({ ok: true })
    }
    if (["subscription.create", "subscription.disable", "subscription.not_renew", "invoice.payment_failed"].includes(name)) {
      await handleSubscriptionEvent(name, event.data ?? {})
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true, ignored: true })
  } catch (err) {
    console.error("paystack webhook error:", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
