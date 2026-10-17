import { NextResponse } from "next/server"
import { announcementStatus, sendAnnouncementBatch } from "@/lib/premiumReminders"
import { requireAdmin } from "@/lib/requireAdmin"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Is Paystack live, how many people, how many already emailed. Admin only. */
export async function GET(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return NextResponse.json({ error: "Only an admin can do this." }, { status: gate.status })
  try {
    return NextResponse.json(await announcementStatus())
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not load." }, { status: 500 })
  }
}

/** Sends the next batch of "new way to pay" emails. The admin page calls this until left = 0. */
export async function POST(request: Request) {
  const gate = await requireAdmin(request)
  if (!("user" in gate)) return NextResponse.json({ error: "Only an admin can do this." }, { status: gate.status })
  try {
    return NextResponse.json(await sendAnnouncementBatch())
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not send." }, { status: 400 })
  }
}
