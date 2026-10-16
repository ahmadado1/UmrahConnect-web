import "server-only"
import { dateInputValue } from "@/lib/agentFormat"
import { sendPremiumReceivedEmail, sendPremiumStoppedEmail } from "@/lib/email"
import { cancelSubscription, getSubscription, listSubscriptionTransactions } from "@/lib/paypal"
import {
  formatUsd,
  PREMIUM_CUSTOM_PREFIX,
  PREMIUM_MONTHS,
  premiumPlanFromPaypalId,
  type PremiumPlanId,
} from "@/lib/premiumPlans"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export type PremiumRow = {
  user_id: string
  premium_until: string | null
  plan: PremiumPlanId | null
  source: string
  paypal_subscription_id: string | null
  paypal_status: string | null
}

export const PREMIUM_PLAN_NAMES: Record<PremiumPlanId, string> = { monthly: "Premium monthly", yearly: "Premium yearly" }

// ─── Reading ────────────────────────────────────────────────────────────────

export async function premiumForUser(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("user_premium")
    .select("user_id, premium_until, plan, source, paypal_subscription_id, paypal_status")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as PremiumRow | null) ?? null
}

/** Email + name for receipts. Phone-only accounts have no email: then we skip the email. */
export async function contactFor(userId: string) {
  const { data } = await getSupabaseAdmin().auth.admin.getUserById(userId)
  const user = data.user
  return {
    email: user?.email?.trim() || "",
    name: String(user?.user_metadata?.full_name || user?.user_metadata?.name || "") || null,
  }
}

// ─── Writing ────────────────────────────────────────────────────────────────

/** Adds months of Premium: from the current end date if still in the future, otherwise from today. */
export async function extendPremium(userId: string, months: number, plan: PremiumPlanId) {
  const current = await premiumForUser(userId)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = current?.premium_until ? new Date(`${current.premium_until.slice(0, 10)}T00:00:00`) : null
  const start = end && !Number.isNaN(end.getTime()) && end > today ? end : today
  const next = new Date(start)
  next.setMonth(next.getMonth() + months)
  const premiumUntil = dateInputValue(next)
  const { error } = await getSupabaseAdmin()
    .from("user_premium")
    .upsert({ user_id: userId, premium_until: premiumUntil, plan, source: "web", updated_at: new Date().toISOString() }, { onConflict: "user_id" })
  if (error) throw new Error(error.message)
  return premiumUntil
}

// ─── PayPal ─────────────────────────────────────────────────────────────────

/** Is this PayPal plan one of the Premium plans (and not an agency plan)? */
export function isPremiumPaypalPlan(planId: string | null | undefined) {
  return premiumPlanFromPaypalId(planId) !== null
}

/**
 * Reads a Premium PayPal subscription and credits every completed payment not counted yet.
 * Safe to call many times: right after checkout, from the webhook, and from the daily job.
 */
export async function syncPremiumSubscription(subscriptionId: string, expectedUserId?: string) {
  const subscription = await getSubscription(subscriptionId)
  const plan = premiumPlanFromPaypalId(subscription.plan_id)
  if (!plan) throw new Error("This PayPal plan is not a Premium plan.")

  const fromCustom = subscription.custom_id?.startsWith(PREMIUM_CUSTOM_PREFIX)
    ? subscription.custom_id.slice(PREMIUM_CUSTOM_PREFIX.length)
    : ""
  const userId = fromCustom || expectedUserId
  if (!userId) throw new Error("The subscription is not linked to a user.")
  if (expectedUserId && fromCustom && fromCustom !== expectedUserId) {
    throw new Error("This subscription belongs to another account.")
  }

  const admin = getSupabaseAdmin()
  const row = await premiumForUser(userId)
  const previous = row?.paypal_subscription_id || null
  const isCurrent = !previous || previous === subscription.id || subscription.status === "ACTIVE"
  if (isCurrent) {
    const { error } = await admin.from("user_premium").upsert(
      {
        user_id: userId,
        plan,
        paypal_subscription_id: subscription.id,
        paypal_status: subscription.status,
        premium_until: row?.premium_until ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    if (error) throw new Error(error.message)
  }

  // Billing just stopped (cancelled in PayPal, or the card failed): tell the user once.
  if (previous === subscription.id && row?.paypal_status === "ACTIVE" && subscription.status !== "ACTIVE") {
    await emailPremiumStopped(userId, subscription.status === "SUSPENDED" ? "failed" : "cancelled")
  }

  // Switched monthly ↔ yearly: stop the old subscription.
  if (subscription.status === "ACTIVE" && previous && previous !== subscription.id) {
    try {
      await cancelSubscription(previous, "Replaced by a new UmrahConnect Premium plan")
    } catch (error) {
      console.error("could not cancel old Premium subscription:", error)
    }
  }

  const since = new Date(subscription.start_time || subscription.create_time || Date.now() - 400 * 24 * 60 * 60 * 1000)
  const transactions = await listSubscriptionTransactions(subscription.id, since)
  let credited = 0
  let premiumUntil = row?.premium_until ?? null
  for (const tx of transactions) {
    if ((tx.status || "").toUpperCase() !== "COMPLETED") continue
    const gross = tx.amount_with_breakdown?.gross_amount
    const amount = Number(gross?.value || 0)
    const { error } = await admin.from("premium_payments").insert({
      user_id: userId,
      plan,
      months: PREMIUM_MONTHS[plan],
      amount,
      currency: gross?.currency_code || "USD",
      method: "paypal",
      reference: tx.id,
      status: "confirmed",
    })
    if (error) {
      if (error.code === "23505") continue // already counted
      throw new Error(error.message)
    }
    premiumUntil = await extendPremium(userId, PREMIUM_MONTHS[plan], plan)
    credited += 1
    console.log(`premium: credited ${tx.id} to ${userId}, until ${premiumUntil}`)
    try {
      const contact = await contactFor(userId)
      if (contact.email) {
        await sendPremiumReceivedEmail({
          to: contact.email,
          name: contact.name,
          planName: PREMIUM_PLAN_NAMES[plan],
          amount: formatUsd(amount),
          premiumUntil,
        })
      }
    } catch (error) {
      console.error("premium receipt email failed:", error)
    }
  }

  return { status: subscription.status, plan, credited, premiumUntil }
}

/** Emails the user that auto-renew stopped. Never throws. */
export async function emailPremiumStopped(userId: string, reason: "cancelled" | "failed") {
  try {
    const [contact, row] = await Promise.all([contactFor(userId), premiumForUser(userId)])
    if (!contact.email) return
    await sendPremiumStoppedEmail({ to: contact.email, name: contact.name, premiumUntil: row?.premium_until ?? null, reason })
  } catch (error) {
    console.error("premium stopped email failed:", error)
  }
}

/** Daily safety net: re-check every linked Premium subscription. */
export async function syncAllPremiumSubscriptions() {
  const { data, error } = await getSupabaseAdmin()
    .from("user_premium")
    .select("user_id, paypal_subscription_id")
    .not("paypal_subscription_id", "is", null)
  if (error) throw new Error(error.message)
  const results: { userId: string; status?: string; credited?: number; error?: string }[] = []
  for (const row of data ?? []) {
    try {
      const result = await syncPremiumSubscription(row.paypal_subscription_id as string, row.user_id as string)
      results.push({ userId: row.user_id as string, status: result.status, credited: result.credited })
    } catch (err) {
      results.push({ userId: row.user_id as string, error: err instanceof Error ? err.message : "sync failed" })
    }
  }
  return results
}
