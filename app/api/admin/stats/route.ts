import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

/** Numbers for the admin Reports page (admins only). Counts come from public.admin_stats() in Supabase. */
export async function GET(request: Request) {
  const check = await requireAdmin(request)
  if ("status" in check) {
    return NextResponse.json({ error: check.status === 401 ? "Log in again." : "Admins only." }, { status: check.status })
  }
  const { data, error } = await getSupabaseAdmin().rpc("admin_stats")
  if (error) {
    const missing = /admin_stats/.test(error.message)
    return NextResponse.json(
      { error: missing ? "Run supabase/admin-stats.sql in the Supabase SQL editor first." : error.message },
      { status: 500 },
    )
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } })
}
