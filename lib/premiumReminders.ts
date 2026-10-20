// Premium renewal reminders (daily job) and the one-time "new way to pay" announcement.
// Server only (uses the service role).
import { paystackLive, sendNewWayToPayEmail, sendPremiumReminderEmail, type PremiumReminderType } from "@/lib/email"
import { contactFor } from "@/lib/premiumBilling"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

/** "YYYY-MM-DD" for today plus `days` (UTC, same as the database's current_date). */
function dayFromToday(days: number) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Runs every morning from /api/cron/agent-reminders.
 *   • Premium ends in 3 days → "ends in 3 days" email
 *   • Premium ended yesterday → "has ended" email
 * People on auto-renew (PayPal ACTIVE) are skipped: they renew by themselves.
 * Each email is logged in premium_email_log, so it is never sent twice.
 */
export async function sendDuePremiumReminders() {
  const admin = getSupabaseAdmin()
  const due: { type: PremiumReminderType; date: string }[] = [
    { type: "reminder_3_days", date: dayFromToday(3) },
    { type: "ended", date: dayFromToday(-1) },
  ]
  const results: { user_id: string; type: string; status: string }[] = []

  for (const { type, date } of due) {
    const { data, error } = await admin
      .from("user_premium")
      .select("*")
      .eq("premium_until", date)
    if (error) throw new Error(error.message)

    for (const row of data ?? []) {
      if (row.paypal_status === "ACTIVE") continue
      // Also has Premium from the App Store / Google Play that lasts longer: no "ending" email.
      if (row.store_until && String(row.store_until).slice(0, 10) > date) continue
      // Claim first (unique row), so two runs at once never both send.
      const { error: claimError } = await admin
        .from("premium_email_log")
        .insert({ user_id: row.user_id, type, premium_until: date })
      if (claimError) {
        results.push({ user_id: row.user_id, type, status: claimError.code === "23505" ? "already_sent" : claimError.message })
        continue
      }
      const contact = await contactFor(row.user_id).catch(() => ({ email: "", name: null }))
      if (!contact.email) {
        results.push({ user_id: row.user_id, type, status: "no email (phone account)" })
        continue
      }
      try {
        await sendPremiumReminderEmail({ to: contact.email, name: contact.name, type, premiumUntil: date })
        results.push({ user_id: row.user_id, type, status: "sent" })
      } catch (err) {
        // Let tomorrow's run try again.
        await admin.from("premium_email_log").delete().match({ user_id: row.user_id, type, premium_until: date })
        results.push({ user_id: row.user_id, type, status: err instanceof Error ? err.message : "failed" })
      }
    }
  }
  return results
}

// ─── "New way to pay" announcement ──────────────────────────────────────────

export const ANNOUNCE_KEY = "paystack_launch"
const BATCH = 12 // emails per click-round (keeps each request short; the admin page repeats until done)

type Recipient = { email: string; name: string | null; isAgency: boolean }

/** Everyone who ever had Premium + every agency with an email. Agencies win if both. */
async function allRecipients(): Promise<Recipient[]> {
  const admin = getSupabaseAdmin()
  const byEmail = new Map<string, Recipient>()

  const { data: agents } = await admin.from("agents").select("email, owner_name").not("email", "is", null)
  for (const a of agents ?? []) {
    const email = String(a.email || "").trim().toLowerCase()
    if (email) byEmail.set(email, { email, name: (a.owner_name as string | null) ?? null, isAgency: true })
  }

  const { data: premium } = await admin.from("user_premium").select("user_id")
  for (const p of premium ?? []) {
    const contact = await contactFor(p.user_id as string).catch(() => ({ email: "", name: null }))
    const email = contact.email.trim().toLowerCase()
    if (email && !byEmail.has(email)) byEmail.set(email, { email, name: contact.name, isAgency: false })
  }
  return [...byEmail.values()]
}

/** How many people get it, and how many already got it. */
export async function announcementStatus() {
  const admin = getSupabaseAdmin()
  const [recipients, sent] = await Promise.all([
    allRecipients(),
    admin.from("broadcast_log").select("email", { count: "exact", head: true }).eq("key", ANNOUNCE_KEY),
  ])
  return { live: paystackLive(), total: recipients.length, sent: sent.count ?? 0 }
}

/** Sends the next batch. Returns how many are left, so the admin page can call again. */
export async function sendAnnouncementBatch() {
  if (!paystackLive()) throw new Error("Paystack is not switched on yet (PAYSTACK_LIVE=true in Vercel).")
  const admin = getSupabaseAdmin()
  const { data: done } = await admin.from("broadcast_log").select("email").eq("key", ANNOUNCE_KEY)
  const already = new Set((done ?? []).map(r => String(r.email)))
  const todo = (await allRecipients()).filter(r => !already.has(r.email))

  let sent = 0
  for (const person of todo.slice(0, BATCH)) {
    const { error: claimError } = await admin.from("broadcast_log").insert({ key: ANNOUNCE_KEY, email: person.email })
    if (claimError) continue // someone else already sent it
    try {
      await sendNewWayToPayEmail({ to: person.email, name: person.name, isAgency: person.isAgency })
      sent += 1
      await new Promise(resolve => setTimeout(resolve, 600)) // stay under the email service's rate limit
    } catch (err) {
      await admin.from("broadcast_log").delete().match({ key: ANNOUNCE_KEY, email: person.email })
      console.error("announcement email failed:", person.email, err)
    }
  }
  return { sent, left: Math.max(0, todo.length - sent) }
}
