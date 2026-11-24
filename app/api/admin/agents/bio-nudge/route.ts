// Admin: email every verified agency whose profile still has no description, asking it to
// write one. Each agency gets this email at most once every 7 days (agents.bio_nudged_at).
import { NextResponse } from "next/server"
import { agentLanguage, sendAgencyBioEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const maxDuration = 60
const WEEK = 7 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Only an admin can send this." }, { status: 403 })

  const { data: agents, error } = await admin
    .from("agents")
    .select("id, email, user_id, owner_user_id, owner_name, business_name, agency_name, description, bio, verified, hidden, bio_nudged_at")
    .eq("verified", true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  const skipped: string[] = []
  for (const a of agents ?? []) {
    if (a.hidden) continue
    if ((a.description || a.bio || "").trim()) continue
    if (a.bio_nudged_at && Date.now() - new Date(a.bio_nudged_at).getTime() < WEEK) continue
    const name = a.business_name || a.agency_name || "agency"
    let to = a.email?.trim() || ""
    if (!to) {
      const uid = a.user_id || a.owner_user_id
      if (uid) to = (await admin.auth.admin.getUserById(uid)).data.user?.email?.trim() || ""
    }
    if (!to) {
      skipped.push(`${name} (no email)`)
      continue
    }
    try {
      await sendAgencyBioEmail({ to, name: a.owner_name || name, language: await agentLanguage(a.id) })
      await admin.from("agents").update({ bio_nudged_at: new Date().toISOString() }).eq("id", a.id)
      sent++
    } catch (e) {
      skipped.push(`${name} (${e instanceof Error ? e.message : "email failed"})`)
    }
  }
  const message = sent
    ? `Asked ${sent} ${sent === 1 ? "agency" : "agencies"} to write their description.${skipped.length ? ` Not sent: ${skipped.join(", ")}.` : ""}`
    : `Nothing to send (every verified agency has a description, or was asked in the last 7 days).${skipped.length ? ` Not sent: ${skipped.join(", ")}.` : ""}`
  return NextResponse.json({ ok: true, sent, message })
}
