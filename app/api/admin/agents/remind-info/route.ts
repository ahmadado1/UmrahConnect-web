// Admin: send a reminder to every agency we asked for more information 2+ days ago that
// hasn't answered yet (still not verified). Each agency gets at most one reminder every 2 days.
import { NextResponse } from "next/server"
import { agentLanguage, sendInfoRequestEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Only an admin can send reminders." }, { status: 403 })

  const cutoff = new Date(Date.now() - TWO_DAYS).toISOString()
  const { data: agents, error } = await admin
    .from("agents")
    .select("id, email, user_id, owner_user_id, owner_name, business_name, agency_name, info_request, info_requested_at, info_reminded_at, verified, hidden")
    .not("info_request", "is", null)
    .lte("info_requested_at", cutoff)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  const skipped: string[] = []
  for (const a of agents ?? []) {
    if (a.verified || a.hidden) continue
    if (a.info_reminded_at && Date.now() - new Date(a.info_reminded_at).getTime() < TWO_DAYS) continue
    let to = a.email?.trim() || ""
    if (!to) {
      const uid = a.user_id || a.owner_user_id
      if (uid) to = (await admin.auth.admin.getUserById(uid)).data.user?.email?.trim() || ""
    }
    const name = a.business_name || a.agency_name || "agency"
    if (!to) {
      skipped.push(`${name} (no email)`)
      continue
    }
    try {
      await sendInfoRequestEmail({
        to,
        ownerName: a.owner_name,
        businessName: a.business_name || a.agency_name,
        message: a.info_request,
        language: await agentLanguage(a.id),
        reminder: true,
      })
      await admin.from("agents").update({ info_reminded_at: new Date().toISOString() }).eq("id", a.id)
      sent++
    } catch (e) {
      skipped.push(`${name} (${e instanceof Error ? e.message : "email failed"})`)
    }
  }
  const message = sent
    ? `Reminder sent to ${sent} ${sent === 1 ? "agency" : "agencies"}.${skipped.length ? ` Not sent: ${skipped.join(", ")}.` : ""}`
    : `No reminders to send (nobody asked 2+ days ago is still waiting).${skipped.length ? ` Not sent: ${skipped.join(", ")}.` : ""}`
  return NextResponse.json({ ok: true, sent, message })
}
