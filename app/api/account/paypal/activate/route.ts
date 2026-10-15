import { NextResponse } from "next/server"
import { syncPremiumSubscription } from "@/lib/premiumBilling"
import { userFromBearer } from "@/lib/requestUser"

export const dynamic = "force-dynamic"

/** Called right after the user approves a Premium subscription in PayPal. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const subscriptionId = typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : ""
  if (!/^I-[A-Z0-9]+$/.test(subscriptionId)) {
    return NextResponse.json({ error: "Missing PayPal subscription." }, { status: 400 })
  }
  try {
    const result = await syncPremiumSubscription(subscriptionId, user.id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("premium activate failed:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not confirm the subscription." }, { status: 502 })
  }
}
