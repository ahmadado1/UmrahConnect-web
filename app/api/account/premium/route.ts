import { NextResponse } from "next/server"
import { premiumForUser } from "@/lib/premiumBilling"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** The logged-in user's Premium status + payment history (for /account). */
export async function GET(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  try {
    const admin = getSupabaseAdmin()
    const [premium, payments, agent] = await Promise.all([
      premiumForUser(user.id),
      admin
        .from("premium_payments")
        .select("id, plan, months, amount, currency, method, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      admin.from("agents").select("id").or(`owner_user_id.eq.${user.id},user_id.eq.${user.id}`).limit(1).maybeSingle(),
    ])
    if (payments.error) throw new Error(payments.error.message)
    return NextResponse.json({ premium, payments: payments.data ?? [], isAgent: Boolean(agent.data) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load your account." }, { status: 500 })
  }
}
