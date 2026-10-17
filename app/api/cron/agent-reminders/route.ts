import { NextResponse } from "next/server"
import { syncAllPaypalSubscriptions } from "@/lib/agentBilling"
import { sendDueAgentReminders } from "@/lib/email"
import { syncAllPremiumSubscriptions } from "@/lib/premiumBilling"
import { sendDuePremiumReminders } from "@/lib/premiumReminders"

export const dynamic = "force-dynamic"

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("authorization") || ""
  const bearer = header.replace(/^Bearer\s+/i, "").trim()
  const named = request.headers.get("x-cron-secret") || ""
  return bearer === secret || named === secret
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    // Credit any PayPal renewals first, so paid agents do not get "expiring" emails.
    let paypal: unknown = null
    try {
      paypal = await syncAllPaypalSubscriptions()
    } catch (err) {
      paypal = { error: err instanceof Error ? err.message : "PayPal sync failed" }
    }
    let premium: unknown = null
    try {
      premium = await syncAllPremiumSubscriptions()
    } catch (err) {
      premium = { error: err instanceof Error ? err.message : "Premium sync failed" }
    }
    const results = await sendDueAgentReminders()
    // Premium "ends in 3 days" / "has ended" emails (after the PayPal sync, so auto-renewers are skipped).
    let premiumReminders: unknown = null
    try {
      premiumReminders = await sendDuePremiumReminders()
    } catch (err) {
      premiumReminders = { error: err instanceof Error ? err.message : "Premium reminders failed" }
    }
    return NextResponse.json({ ok: true, paypal, premium, results, premiumReminders })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send reminders." },
      { status: 500 },
    )
  }
}

export function GET(request: Request) {
  return run(request)
}

export function POST(request: Request) {
  return run(request)
}
