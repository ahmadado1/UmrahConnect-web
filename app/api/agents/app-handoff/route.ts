import { NextResponse } from "next/server"
import { userFromBearer } from "@/lib/requestUser"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

/**
 * App → website hand-off for the agency application.
 *
 * The app (already logged in) calls this with its login token. We answer with a ONE-TIME login
 * link for the same account. The app opens it in the in-app browser, and /agents/app logs the
 * user in with it and shows the application form straight away (no email/password to type).
 *
 * Safe because: the link only works once, expires quickly, is only given to the logged-in owner
 * of the account, and travels in the "#" part of the address (never sent to any server or log).
 * Accounts without an email (phone-only) get the normal page and log in there.
 */
export async function POST(request: Request) {
  const user = await userFromBearer(request)
  if (!user) return NextResponse.json({ error: "Log in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const lang = typeof body?.lang === "string" ? body.lang.slice(0, 5) : "en"
  const base = "https://myumrahconnect.com/agents/app"

  const email = user.email?.trim()
  if (!email) {
    return NextResponse.json({ url: `${base}#lang=${encodeURIComponent(lang)}` })
  }

  const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({ type: "magiclink", email })
  const tokenHash = data?.properties?.hashed_token
  if (error || !tokenHash) {
    console.error("app-handoff generateLink failed", error?.message)
    return NextResponse.json({ url: `${base}#lang=${encodeURIComponent(lang)}` })
  }

  return NextResponse.json({
    url: `${base}#th=${encodeURIComponent(tokenHash)}&lang=${encodeURIComponent(lang)}`,
  })
}
