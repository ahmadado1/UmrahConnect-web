import { NextResponse } from "next/server"
import { VERIFICATION_DOC_FIELDS, type VerificationDocKey } from "@/lib/agentAccount"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const DOC_FIELDS = new Set<VerificationDocKey>(VERIFICATION_DOC_FIELDS.map((field) => field.key))

export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) {
    return NextResponse.json({ error: "Log in again." }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can open these documents." }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const agentId = typeof body?.agentId === "string" ? body.agentId : ""
  const field = typeof body?.field === "string" ? body.field : ""
  if (!agentId || !DOC_FIELDS.has(field as VerificationDocKey)) {
    return NextResponse.json({ error: "Choose a document." }, { status: 400 })
  }

  const { data, error } = await admin
    .from("agents")
    .select("doc_business_reg, doc_licence, doc_owner_id, doc_office_photo")
    .eq("id", agentId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const stored = data?.[field as VerificationDocKey]
  const path = typeof stored === "string" ? stored : ""
  if (!path) return NextResponse.json({ error: "This document has not been uploaded." }, { status: 404 })

  const { data: signed, error: signError } = await admin.storage.from("agent-docs").createSignedUrl(path, 60)
  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: signError?.message || "Could not open this document." }, { status: 500 })
  }
  return NextResponse.json({ url: signed.signedUrl })
}
