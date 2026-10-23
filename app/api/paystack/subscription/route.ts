import { NextResponse } from "next/server"
import { activePaystackSub, cancelPaystackSub, planCodeFor } from "@/lib/paystack"
import { userFromBearer } from "@/lib/requestUser"

export const dynamic = "force-dynamic"

function kindOf(value: string | null) {
  return value === "agent" ? "agent" : value === "premium" ? "premium" : null
}

/** GET ?kind=premium|agent → is Paystack auto-renew on, and which plans can auto-renew. */
export async function GET(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const kind = kindOf(new URL(request.url).searchParams.get("kind"))
  if (!kind) return NextResponse.json({ error: "Unknown kind." }, { status: 400 })
  const sub = await activePaystackSub(user.id, kind)
  const plans = kind === "premium" ? ["monthly", "yearly"] : ["listed", "featured"]
  return NextResponse.json({
    active: sub ? { plan: sub.plan, nextPayment: sub.next_payment_date } : null,
    autoRenewPlans: plans.filter(p => planCodeFor(kind, p)),
  })
}

/** POST { kind } → stop auto-renew. Months already paid stay. */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const kind = kindOf(body?.kind ?? null)
  if (!kind) return NextResponse.json({ error: "Unknown kind." }, { status: 400 })
  try {
    const stopped = await cancelPaystackSub(user.id, kind)
    return NextResponse.json({ ok: true, stopped })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not stop the auto-renew." }, { status: 502 })
  }
}
