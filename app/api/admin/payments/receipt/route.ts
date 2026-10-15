import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** A 60-second link to a payment receipt. Admin only. */
export async function POST(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return NextResponse.json({ error: "Only an admin can open receipts." }, { status: gate.status })
  const body = await request.json().catch(() => null)
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : ""
  if (!paymentId) return NextResponse.json({ error: "Choose a payment." }, { status: 400 })
  const admin = getSupabaseAdmin()
  const { data: payment } = await admin.from("agent_payments").select("receipt_path").eq("id", paymentId).maybeSingle()
  if (!payment?.receipt_path) return NextResponse.json({ error: "No receipt for this payment." }, { status: 404 })
  const { data, error } = await admin.storage.from("agent-docs").createSignedUrl(payment.receipt_path, 60)
  if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message || "Could not open the receipt." }, { status: 500 })
  return NextResponse.json({ url: data.signedUrl })
}
