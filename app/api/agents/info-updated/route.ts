import { NextResponse } from "next/server"
import { sendAdminInfoUpdatedNotice } from "@/lib/email"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

/**
 * Called by Settings after the agency saves its details or documents.
 * If the admin had asked for more info, clear the message and tell the admin.
 */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("agents")
    .select("id, business_name, agency_name, info_request")
    .or(`owner_user_id.eq.${user.id},user_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || !data.info_request) return NextResponse.json({ ok: true, cleared: false })

  const { error: updateError } = await admin
    .from("agents")
    .update({ info_request: null, info_requested_at: null })
    .eq("id", data.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  try {
    await sendAdminInfoUpdatedNotice({
      businessName: data.business_name || data.agency_name || "An agency",
      request: data.info_request,
    })
  } catch (err) {
    console.error(err)
  }
  return NextResponse.json({ ok: true, cleared: true })
}
