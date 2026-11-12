import { NextResponse } from "next/server"
import { verificationGaps } from "@/lib/agentAccount"
import { agentLanguage, sendAdminDocsReadyNotice, sendAdminInfoUpdatedNotice, sendDocsReceivedEmail } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

/**
 * Called after an agency saves its details or documents (Settings, and the sign-up wizard).
 * 1. If the admin had asked for more info: clear the message and tell the team (English).
 * 2. The first time all documents are in (and the agency isn't verified yet):
 *    - the agency gets "Documents received" in its own language,
 *    - the team (you + your mum) gets "Ready to verify" in English.
 */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("agents")
    .select("id, business_name, agency_name, owner_name, email, country, verified, info_request, licence_number, doc_business_reg, doc_licence, doc_owner_id, doc_office_photo")
    .or(`owner_user_id.eq.${user.id},user_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ ok: true, cleared: false })

  const businessName = data.business_name || data.agency_name || "An agency"
  let cleared = false

  // ─── 1. Reply to a "need more info" request ───
  if (data.info_request) {
    const { error: updateError } = await admin
      .from("agents")
      .update({ info_request: null, info_requested_at: null })
      .eq("id", data.id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    cleared = true
    try {
      await sendAdminInfoUpdatedNotice({ businessName, request: data.info_request })
    } catch (err) {
      console.error(err)
    }
  }

  // ─── 2. All documents in for the first time ───
  let docsNotified = false
  if (!data.verified && verificationGaps(data).length === 0) {
    // Claim the notification once (docs_notified_at is added by supabase/agents-system.sql).
    const { data: claimed, error: claimError } = await admin
      .from("agents")
      .update({ docs_notified_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("docs_notified_at", null)
      .select("id")
    if (!claimError && claimed && claimed.length > 0) {
      docsNotified = true
      const language = await agentLanguage(data.id)
      const to = data.email?.trim() || user.email || ""
      try {
        if (to) await sendDocsReceivedEmail({ to, ownerName: data.owner_name, businessName, language })
      } catch (err) {
        console.error(err)
      }
      try {
        await sendAdminDocsReadyNotice({ businessName, country: data.country, language })
      } catch (err) {
        console.error(err)
      }
    }
  }

  return NextResponse.json({ ok: true, cleared, docsNotified })
}
