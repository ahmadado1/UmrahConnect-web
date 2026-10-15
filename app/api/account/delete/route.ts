import { NextResponse } from "next/server"
import { cancelSubscription } from "@/lib/paypal"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const MISSING_TABLE = new Set(["PGRST205", "42P01"])

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return MISSING_TABLE.has(error.code || "") || /could not find the table/i.test(error.message || "")
}

/** Removes every file under {prefix}/ in a bucket, including subfolders (e.g. payments/). */
async function removeFolder(bucketName: string, prefix: string) {
  const bucket = getSupabaseAdmin().storage.from(bucketName)
  const paths: string[] = []
  const folders = [prefix]
  while (folders.length) {
    const folder = folders.pop() as string
    let offset = 0
    while (true) {
      const { data, error } = await bucket.list(folder, { limit: 100, offset })
      if (error) {
        if (/not found/i.test(error.message)) break
        throw new Error(error.message)
      }
      if (!data?.length) break
      for (const file of data) {
        if (!file.name) continue
        if (file.id) paths.push(`${folder}/${file.name}`)
        else folders.push(`${folder}/${file.name}`)
      }
      if (data.length < 100) break
      offset += data.length
    }
  }
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await bucket.remove(paths.slice(i, i + 100))
    if (error) throw new Error(error.message)
  }
}

async function removeRows(table: string, column: string, value: string | string[]) {
  const query = getSupabaseAdmin().from(table).delete()
  const filtered = Array.isArray(value) ? query.in(column, value) : query.eq(column, value)
  const { error } = await filtered
  if (error && !missingTable(error)) throw new Error(error.message)
}

export async function POST(request: Request) {
  try {
    const header = request.headers.get("authorization") || ""
    const token = header.replace(/^Bearer\s+/i, "").trim()
    if (!token || token === header.trim()) {
      return NextResponse.json({ error: "Log in again to delete this account." }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data.user) {
      return NextResponse.json({ error: "Log in again to delete this account." }, { status: 401 })
    }
    const userId = data.user.id

    await removeFolder("agent-logos", userId)
    await removeFolder("agent-docs", userId)

    const { data: agents, error: agentError } = await admin
      .from("agents")
      .select("id, paypal_subscription_id, paypal_status")
      .or(`owner_user_id.eq.${userId},user_id.eq.${userId}`)
    if (agentError && !missingTable(agentError)) throw new Error(agentError.message)
    const agentIds = (agents ?? []).map((row) => row.id).filter(Boolean)

    // Stop monthly PayPal charges before the account disappears.
    for (const row of agents ?? []) {
      const subscriptionId = (row as { paypal_subscription_id?: string | null }).paypal_subscription_id
      const status = (row as { paypal_status?: string | null }).paypal_status
      if (subscriptionId && status !== "CANCELLED" && status !== "EXPIRED") {
        try {
          await cancelSubscription(subscriptionId, "UmrahConnect account deleted")
        } catch (err) {
          console.error("could not cancel PayPal subscription on delete:", err)
        }
      }
    }

    // Stop Premium auto-renew too.
    const { data: premium, error: premiumError } = await admin
      .from("user_premium")
      .select("paypal_subscription_id, paypal_status")
      .eq("user_id", userId)
      .maybeSingle()
    if (premiumError && !missingTable(premiumError)) throw new Error(premiumError.message)
    if (premium?.paypal_subscription_id && premium.paypal_status === "ACTIVE") {
      try {
        await cancelSubscription(premium.paypal_subscription_id, "UmrahConnect account deleted")
      } catch (err) {
        console.error("could not cancel Premium subscription on delete:", err)
      }
    }
    await removeRows("premium_payments", "user_id", userId)
    await removeRows("user_premium", "user_id", userId)

    await removeRows("agent_leads", "user_id", userId)
    if (agentIds.length) await removeRows("agent_leads", "agent_id", agentIds)
    await removeRows("agent_pilgrims", "user_id", userId)
    if (agentIds.length) await removeRows("agent_pilgrims", "agent_id", agentIds)
    if (agentIds.length) await removeRows("agent_email_log", "agent_id", agentIds)
    await removeRows("agents", "owner_user_id", userId)
    await removeRows("agents", "user_id", userId)
    await removeRows("profiles", "id", userId)

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw new Error(deleteError.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete this account."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
