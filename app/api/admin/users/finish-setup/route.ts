// Admin: email people who created an account but never chose Pilgrim / Travel agent.
// Each person gets at most 2 of these emails, at least 7 days apart. Sends up to 15 per press
// (so the request never times out); press again to send the next ones.
import { NextResponse } from "next/server"
import { sendFinishSetupEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const BATCH = 15
export const maxDuration = 60
const WEEK = 7 * 24 * 60 * 60 * 1000
const MAX_EMAILS = 2
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Only an admin can send this." }, { status: 403 })

  // Everyone who owns an agency, and every admin: never "unfinished"
  const [{ data: agents }, { data: admins }] = await Promise.all([
    admin.from("agents").select("user_id, owner_user_id"),
    admin.from("profiles").select("id").eq("role", "admin"),
  ])
  const skip = new Set<string>()
  for (const a of agents ?? []) {
    if (a.user_id) skip.add(a.user_id)
    if (a.owner_user_id) skip.add(a.owner_user_id)
  }
  for (const a of admins ?? []) skip.add(a.id)

  // All accounts (paged)
  const due: { id: string; email: string; name: string | null; lang: string | null; count: number; app: Record<string, unknown> }[] = []
  let notYet = 0
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>
      if (meta.user_type || skip.has(u.id) || !u.email) continue
      // Give people at least an hour after creating the account
      if (Date.now() - new Date(u.created_at).getTime() < 60 * 60 * 1000) continue
      const app = (u.app_metadata ?? {}) as Record<string, unknown>
      const count = Number(app.finish_nudge_count) || 0
      const last = app.finish_nudge_at ? new Date(String(app.finish_nudge_at)).getTime() : 0
      if (count >= MAX_EMAILS || Date.now() - last < WEEK) {
        notYet++
        continue
      }
      due.push({
        id: u.id,
        email: u.email,
        name: typeof meta.full_name === "string" ? meta.full_name : null,
        lang: typeof meta.language === "string" ? meta.language : null,
        count,
        app,
      })
    }
    if (data.users.length < 1000) break
  }

  let sent = 0
  const failed: string[] = []
  for (const p of due.slice(0, BATCH)) {
    try {
      await sendFinishSetupEmail({ to: p.email, name: p.name, language: p.lang })
      await admin.auth.admin.updateUserById(p.id, {
        app_metadata: { ...p.app, finish_nudge_at: new Date().toISOString(), finish_nudge_count: p.count + 1 },
      })
      sent++
    } catch (e) {
      failed.push(`${p.email} (${e instanceof Error ? e.message : "failed"})`)
    }
    await sleep(600) // stay under the email service's rate limit
  }
  const left = Math.max(0, due.length - BATCH)
  const parts = [
    sent ? `Sent to ${sent} ${sent === 1 ? "person" : "people"}.` : "Nobody to email right now.",
    left ? `${left} more waiting: press again.` : "",
    notYet ? `${notYet} already emailed recently (or twice) and skipped.` : "",
    failed.length ? `Failed: ${failed.join(", ")}.` : "",
  ]
  return NextResponse.json({ ok: true, sent, left, message: parts.filter(Boolean).join(" ") })
}
