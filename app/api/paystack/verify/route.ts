import { NextResponse } from "next/server"
import { creditPaystack } from "@/lib/paystack"
import { userFromBearer } from "@/lib/requestUser"

export const dynamic = "force-dynamic"

/** The website calls this when the person comes back from Paystack (?paystack=<reference>). */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const reference = String(body?.reference || "")
  if (!/^UC-[PA]-[a-f0-9]{16}$/.test(reference)) return NextResponse.json({ error: "Unknown payment." }, { status: 400 })
  try {
    const result = await creditPaystack(reference, user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error("paystack verify error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not check the payment." }, { status: 502 })
  }
}
