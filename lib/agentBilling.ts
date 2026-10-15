import "server-only"
import { dateInputValue } from "@/lib/agentFormat"
import { formatMoney, planFromPaypalId, type Currency, type PlanId } from "@/lib/agentPlans"
import { sendPaymentReceivedEmail, sendSubscriptionStoppedEmail } from "@/lib/email"
import { cancelSubscription, getSubscription, listSubscriptionTransactions } from "@/lib/paypal"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export type BillingAgent = {
  id: string
  business_name: string | null
  agency_name: string | null
  owner_name: string | null
  email: string | null
  country: string | null
  status: string | null
  plan: string | null
  verified: boolean | null
  paid_until: string | null
  user_id: string | null
  owner_user_id: string | null
  paypal_subscription_id: string | null
  paypal_status: string | null
}

const AGENT_COLUMNS =
  "id, business_name, agency_name, owner_name, email, country, status, plan, verified, paid_until, user_id, owner_user_id, paypal_subscription_id, paypal_status"

export const PLAN_NAMES: Record<PlanId, string> = { listed: "Listed", featured: "Featured" }
export const METHOD_NAMES: Record<string, string> = { paypal: "PayPal / card", opay: "OPay", nita: "Nita", other: "Other" }

/** The agent row owned by this login, or null. */
export async function agentForUser(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("agents")
    .select(AGENT_COLUMNS)
    .or(`owner_user_id.eq.${userId},user_id.eq.${userId}`)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as BillingAgent | null) ?? null
}

export async function agentById(agentId: string) {
  const { data, error } = await getSupabaseAdmin().from("agents").select(AGENT_COLUMNS).eq("id", agentId).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as BillingAgent | null) ?? null
}

export async function agentEmail(agent: BillingAgent) {
  if (agent.email?.trim()) return agent.email.trim()
  const userId = agent.owner_user_id || agent.user_id
  if (!userId) return ""
  const { data } = await getSupabaseAdmin().auth.admin.getUserById(userId)
  return data.user?.email?.trim() || ""
}

/**
 * Adds paid months to an agent: from their current paid-until date if it is still in the future, otherwise from today.
 * Sets the plan. Expired agents become active again. Pending (not yet verified) agents stay pending.
 */
export async function extendAgent(agentId: string, months: number, plan: PlanId) {
  const agent = await agentById(agentId)
  if (!agent) throw new Error("Agent not found.")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const current = agent.paid_until ? new Date(`${agent.paid_until.slice(0, 10)}T00:00:00`) : null
  const start = current && !Number.isNaN(current.getTime()) && current > today ? current : today
  const next = new Date(start)
  next.setMonth(next.getMonth() + months)
  const paidUntil = dateInputValue(next)
  const patch: Record<string, string> = { paid_until: paidUntil, plan: plan === "featured" ? "pro" : "basic" }
  if ((agent.status || "").toLowerCase() === "expired") patch.status = "active"
  const { error } = await getSupabaseAdmin().from("agents").update(patch).eq("id", agentId)
  if (error) throw new Error(error.message)
  return { agent, paidUntil }
}

export async function emailPaymentReceived(agentId: string, info: { plan: PlanId; amount: number; currency: Currency; months: number; method: string; paidUntil: string }) {
  const agent = await agentById(agentId)
  if (!agent) return
  const to = await agentEmail(agent)
  if (!to) return
  try {
    await sendPaymentReceivedEmail({
      to,
      ownerName: agent.owner_name,
      businessName: agent.business_name || agent.agency_name,
      planName: PLAN_NAMES[info.plan],
      amount: formatMoney(info.amount, info.currency),
      months: info.months,
      method: METHOD_NAMES[info.method] || info.method,
      paidUntil: info.paidUntil,
    })
  } catch (error) {
    console.error("payment email failed:", error)
  }
}

/** Emails the agent that monthly billing stopped. Never throws. */
export async function emailSubscriptionStopped(agentId: string, plan: PlanId, reason: "cancelled" | "failed") {
  try {
    const agent = await agentById(agentId)
    if (!agent) return
    const to = await agentEmail(agent)
    if (!to) return
    await sendSubscriptionStoppedEmail({
      to,
      ownerName: agent.owner_name,
      businessName: agent.business_name || agent.agency_name,
      planName: PLAN_NAMES[plan],
      paidUntil: agent.paid_until,
      reason,
    })
  } catch (error) {
    console.error("subscription stopped email failed:", error)
  }
}

/**
 * Reads a PayPal subscription and credits every completed payment that is not recorded yet.
 * Safe to call many times (after checkout, from the webhook, and from the daily cron).
 */
export async function syncPaypalSubscription(subscriptionId: string, expectedAgentId?: string) {
  const subscription = await getSubscription(subscriptionId)
  const plan = planFromPaypalId(subscription.plan_id)
  if (!plan) throw new Error("This PayPal plan is not an UmrahConnect plan.")
  const agentId = subscription.custom_id || expectedAgentId
  if (!agentId) throw new Error("The subscription is not linked to an agent.")
  if (expectedAgentId && subscription.custom_id && subscription.custom_id !== expectedAgentId) {
    throw new Error("This subscription belongs to another agent.")
  }
  const agent = await agentById(agentId)
  if (!agent) throw new Error("Agent not found.")

  const admin = getSupabaseAdmin()
  const previous = agent.paypal_subscription_id
  const isCurrent = !previous || previous === subscription.id || subscription.status === "ACTIVE"
  if (isCurrent) {
    await admin.from("agents").update({ paypal_subscription_id: subscription.id, paypal_status: subscription.status }).eq("id", agentId)
  }

  // The subscription we were billing just stopped (cancelled in PayPal, or payments failed): tell the agent once.
  if (previous === subscription.id && agent.paypal_status === "ACTIVE" && subscription.status !== "ACTIVE") {
    const reason = subscription.status === "SUSPENDED" ? "failed" : "cancelled"
    await emailSubscriptionStopped(agentId, plan, reason)
  }

  // A new active subscription replaces an older one (plan change): stop billing the old one.
  if (subscription.status === "ACTIVE" && previous && previous !== subscription.id) {
    try {
      await cancelSubscription(previous, "Replaced by a new UmrahConnect plan")
    } catch (error) {
      console.error("could not cancel old PayPal subscription:", error)
    }
  }

  const since = new Date(subscription.start_time || subscription.create_time || Date.now() - 400 * 24 * 60 * 60 * 1000)
  const transactions = await listSubscriptionTransactions(subscription.id, since)
  let credited = 0
  let paidUntil = agent.paid_until
  for (const tx of transactions) {
    if ((tx.status || "").toUpperCase() !== "COMPLETED") continue
    const gross = tx.amount_with_breakdown?.gross_amount
    const currency = (gross?.currency_code || "USD") as Currency
    const amount = Number(gross?.value || 0)
    const { error } = await admin.from("agent_payments").insert({
      agent_id: agentId,
      plan,
      months: 1,
      amount,
      currency: ["USD", "NGN", "XOF"].includes(currency) ? currency : "USD",
      method: "paypal",
      reference: tx.id,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      admin_note: `PayPal subscription ${subscription.id}`,
    })
    if (error) {
      if (error.code === "23505") continue // already counted
      throw new Error(error.message)
    }
    const result = await extendAgent(agentId, 1, plan)
    paidUntil = result.paidUntil
    credited += 1
    console.log(`paypal: credited ${tx.id} to agent ${agentId}, paid until ${paidUntil}`)
    await emailPaymentReceived(agentId, { plan, amount, currency, months: 1, method: "paypal", paidUntil })
  }

  return { status: subscription.status, plan, credited, paidUntil }
}

/** Daily safety net: re-check every linked PayPal subscription. */
export async function syncAllPaypalSubscriptions() {
  const { data, error } = await getSupabaseAdmin()
    .from("agents")
    .select("id, paypal_subscription_id")
    .not("paypal_subscription_id", "is", null)
  if (error) throw new Error(error.message)
  const results: { agentId: string; status?: string; credited?: number; error?: string }[] = []
  for (const row of data ?? []) {
    try {
      const result = await syncPaypalSubscription(row.paypal_subscription_id as string, row.id as string)
      results.push({ agentId: row.id as string, status: result.status, credited: result.credited })
    } catch (err) {
      results.push({ agentId: row.id as string, error: err instanceof Error ? err.message : "sync failed" })
    }
  }
  return results
}
