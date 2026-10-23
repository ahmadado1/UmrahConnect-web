import "server-only"
// Paystack (card, bank transfer, USSD, OPay) for agency subscriptions and Pilgrim Premium.
//
// How a payment works:
//  1. The website asks /api/paystack/initialize → we ask Paystack for a checkout link.
//  2. The person pays on Paystack's page and comes back to the website.
//  3. Paystack calls /api/paystack/webhook, and the page calls /api/paystack/verify.
//     Both run creditPaystack(): it checks the payment with Paystack and adds the months.
//     A unique reference in the database means a payment is never counted twice.
//
// Vercel environment variables (Settings → Environment Variables):
//   PAYSTACK_SECRET_KEY         sk_live_... (Paystack → Settings → API Keys). Server only, never in the browser.
//   NEXT_PUBLIC_PAYSTACK_LIVE   "true" to show the "Pay with Paystack" buttons.
//   PAYSTACK_PLAN_* (optional)  Override the plan codes below (Paystack → Recurring → Plans).
//
// Auto-renew: checkout with a plan code. Paystack charges the card now, then every month/year by itself.
// The first payment carries our user id; renewals don't, so we remember customer + plan in
// paystack_subscriptions and look the person up from there.
import crypto from "node:crypto"
import { formatMoney, PLAN_PRICES, type PlanId } from "@/lib/agentPlans"
import { emailPaymentReceived, extendAgent, PLAN_NAMES } from "@/lib/agentBilling"
import { sendPremiumReceivedEmail } from "@/lib/email"
import { contactFor, extendPremium, PREMIUM_PLAN_NAMES } from "@/lib/premiumBilling"
import { PREMIUM_LOCAL_PRICES, PREMIUM_MONTHS, type PremiumPlanId } from "@/lib/premiumPlans"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const API = "https://api.paystack.co"

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error("Paystack is not set up yet (PAYSTACK_SECRET_KEY).")
  return key
}

export type PaystackKind = "premium" | "agent"

export type PaystackMeta = {
  kind: PaystackKind
  user_id: string
  agent_id?: string
  plan: string
  months: number
}

/** Price in Naira for what is being bought. */
export function nairaPrice(kind: PaystackKind, plan: string, months: number) {
  if (kind === "premium") return PREMIUM_LOCAL_PRICES[plan as PremiumPlanId].NGN
  return PLAN_PRICES[plan as PlanId].NGN * months
}

type PlanInfo = { kind: PaystackKind; plan: string; months: number }

/** Our plans and their Paystack plan codes (only the ones set in Vercel). */
function planTable(): Record<string, PlanInfo> {
  const rows: [string | undefined, PlanInfo][] = [
    // Plan codes are not secret. A Vercel variable with the same name overrides them.
    [process.env.PAYSTACK_PLAN_PREMIUM_MONTHLY || "PLN_bebycso55voqay4", { kind: "premium", plan: "monthly", months: 1 }],
    [process.env.PAYSTACK_PLAN_PREMIUM_YEARLY || "PLN_fa694e1tx9hwb5t", { kind: "premium", plan: "yearly", months: 12 }],
    [process.env.PAYSTACK_PLAN_AGENT_LISTED || "PLN_d12y00ch4gbgg95", { kind: "agent", plan: "listed", months: 1 }],
    [process.env.PAYSTACK_PLAN_AGENT_FEATURED || "PLN_y1ty0xgwa0p23im", { kind: "agent", plan: "featured", months: 1 }],
  ]
  const out: Record<string, PlanInfo> = {}
  for (const [code, info] of rows) if (code?.trim()) out[code.trim()] = info
  return out
}

/** Paystack plan code for one of our plans, or null if auto-renew is not set up for it. */
export function planCodeFor(kind: PaystackKind, plan: string) {
  for (const [code, info] of Object.entries(planTable())) if (info.kind === kind && info.plan === plan) return code
  return null
}

export function planInfo(code: string | null | undefined) {
  return code ? planTable()[code] ?? null : null
}

/** Asks Paystack for a checkout link. Amount is in Naira (Paystack wants kobo). */
export async function initializePaystack(input: {
  email: string
  amountNgn: number
  reference: string
  callbackUrl: string
  metadata: PaystackMeta
  /** Paystack plan code: the card is then charged again automatically. */
  planCode?: string | null
}) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNgn * 100),
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      // Auto-renew needs a card. One-off payments use every method switched on in
      // Paystack → Settings → Preferences (card, transfer, USSD, Apple Pay, Google Pay...).
      ...(input.planCode ? { plan: input.planCode, channels: ["card"] } : {}),
    }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.status || !json?.data?.authorization_url) {
    throw new Error(json?.message || "Could not start the Paystack payment.")
  }
  return json.data.authorization_url as string
}

/** True if the webhook really comes from Paystack (HMAC SHA-512 of the raw body). */
export function validPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false
  const expected = crypto.createHmac("sha512", secret()).update(rawBody).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

type VerifiedTx = {
  status: string
  reference: string
  amount: number
  currency: string
  metadata: PaystackMeta | string | null
  plan?: string | { plan_code?: string } | null
  plan_object?: { plan_code?: string } | null
  customer?: { customer_code?: string; email?: string } | null
}

function planCodeOf(tx: { plan?: unknown; plan_object?: { plan_code?: string } | null }) {
  if (typeof tx.plan === "string" && tx.plan.startsWith("PLN_")) return tx.plan
  const fromObj = (tx.plan as { plan_code?: string } | null)?.plan_code || tx.plan_object?.plan_code
  return fromObj || null
}

async function verifyWithPaystack(reference: string): Promise<VerifiedTx> {
  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.status || !json?.data) throw new Error(json?.message || "Could not check the payment.")
  return json.data as VerifiedTx
}

export type CreditResult =
  | { ok: true; kind: PaystackKind; until: string | null; already: boolean }
  | { ok: false; reason: "not_paid" | "wrong_amount" | "bad_metadata" | "not_owner"; status?: string }

/**
 * Checks a payment with Paystack and adds the months once.
 * expectedUserId: when called from the website page, the payment must belong to the logged-in person.
 */
export async function creditPaystack(reference: string, expectedUserId?: string): Promise<CreditResult> {
  const tx = await verifyWithPaystack(reference)
  if (tx.status !== "success") return { ok: false, reason: "not_paid", status: tx.status }

  let meta: PaystackMeta | null = null
  try {
    meta = (typeof tx.metadata === "string" ? JSON.parse(tx.metadata || "null") : tx.metadata) as PaystackMeta | null
  } catch {
    meta = null
  }
  const planCode = planCodeOf(tx)
  const customerCode = tx.customer?.customer_code || ""
  const admin0 = getSupabaseAdmin()

  if (meta?.kind && meta.user_id && planCode && customerCode) {
    // First payment of an auto-renew plan: remember who this customer + plan belongs to.
    await admin0.from("paystack_subscriptions").upsert(
      {
        kind: meta.kind,
        user_id: meta.user_id,
        agent_id: meta.agent_id ?? null,
        plan: meta.plan,
        plan_code: planCode,
        customer_code: customerCode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "customer_code,plan_code" },
    )
  } else if ((!meta || !meta.user_id) && planCode && customerCode) {
    // A renewal: Paystack doesn't repeat our metadata, so look the person up.
    const { data: row } = await admin0
      .from("paystack_subscriptions")
      .select("kind, user_id, agent_id, plan")
      .eq("customer_code", customerCode)
      .eq("plan_code", planCode)
      .maybeSingle()
    const info = planInfo(planCode)
    if (row?.user_id && info) {
      meta = { kind: row.kind, user_id: row.user_id, agent_id: row.agent_id ?? undefined, plan: row.plan, months: info.months }
    }
  }

  if (!meta || (meta.kind !== "premium" && meta.kind !== "agent") || !meta.user_id) return { ok: false, reason: "bad_metadata" }
  if (expectedUserId && meta.user_id !== expectedUserId) return { ok: false, reason: "not_owner" }

  const months = Math.max(1, Math.min(24, Number(meta.months) || 1))
  const amountNgn = tx.amount / 100
  // The amount paid must match our price (protects against edited checkout links).
  if (tx.currency !== "NGN" || amountNgn + 0.001 < nairaPrice(meta.kind, meta.plan, months)) {
    return { ok: false, reason: "wrong_amount" }
  }

  const admin = getSupabaseAdmin()

  if (meta.kind === "premium") {
    const plan = meta.plan as PremiumPlanId
    const { error } = await admin.from("premium_payments").insert({
      user_id: meta.user_id,
      plan,
      months: PREMIUM_MONTHS[plan],
      amount: amountNgn,
      currency: "NGN",
      method: "paystack",
      reference: tx.reference,
      status: "confirmed",
    })
    if (error) {
      if (error.code === "23505") return { ok: true, kind: "premium", until: null, already: true }
      throw new Error(error.message)
    }
    const until = await extendPremium(meta.user_id, PREMIUM_MONTHS[plan], plan)
    try {
      const contact = await contactFor(meta.user_id)
      if (contact.email) {
        await sendPremiumReceivedEmail({
          to: contact.email,
          name: contact.name,
          planName: PREMIUM_PLAN_NAMES[plan],
          amount: formatMoney(amountNgn, "NGN"),
          premiumUntil: until,
        })
      }
    } catch (e) {
      console.error("paystack premium receipt failed:", e)
    }
    return { ok: true, kind: "premium", until, already: false }
  }

  // Agency subscription
  const plan = meta.plan as PlanId
  if (!meta.agent_id) return { ok: false, reason: "bad_metadata" }
  const { error } = await admin.from("agent_payments").insert({
    agent_id: meta.agent_id,
    plan,
    months,
    amount: amountNgn,
    currency: "NGN",
    method: "paystack",
    reference: tx.reference,
    status: "confirmed",
    confirmed_at: new Date().toISOString(),
    admin_note: `Paystack ${PLAN_NAMES[plan]} × ${months}`,
  })
  if (error) {
    if (error.code === "23505") return { ok: true, kind: "agent", until: null, already: true }
    throw new Error(error.message)
  }
  const { paidUntil } = await extendAgent(meta.agent_id, months, plan)
  await emailPaymentReceived(meta.agent_id, { plan, amount: amountNgn, currency: "NGN", months, method: "paystack", paidUntil })
  return { ok: true, kind: "agent", until: paidUntil, already: false }
}


// ─── Auto-renew subscriptions ───────────────────────────────────────────────

type SubEvent = {
  subscription_code?: string
  email_token?: string
  status?: string
  next_payment_date?: string | null
  plan?: { plan_code?: string } | null
  customer?: { customer_code?: string } | null
}

/** Handles Paystack's subscription events: create, disable, not_renew; and failed renewals. */
export async function handleSubscriptionEvent(event: string, data: SubEvent & Record<string, unknown>) {
  const admin = getSupabaseAdmin()
  const planCode = data.plan?.plan_code || ""
  const customerCode = data.customer?.customer_code || ""
  const subscriptionCode = data.subscription_code || (data.subscription as { subscription_code?: string } | undefined)?.subscription_code || ""

  if (event === "subscription.create") {
    if (!planCode || !customerCode) return
    const info = planInfo(planCode)
    const { data: row } = await admin
      .from("paystack_subscriptions")
      .upsert(
        {
          kind: info?.kind ?? "premium",
          plan: info?.plan ?? "monthly",
          plan_code: planCode,
          customer_code: customerCode,
          subscription_code: subscriptionCode || null,
          email_token: data.email_token || null,
          status: "active",
          next_payment_date: data.next_payment_date || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "customer_code,plan_code" },
      )
      .select("id, kind, user_id, agent_id")
      .maybeSingle()
    // Switched plan (e.g. monthly → yearly): stop the person's other auto-renew of the same kind.
    if (row?.user_id) {
      const { data: others } = await admin
        .from("paystack_subscriptions")
        .select("id, subscription_code, email_token")
        .eq("user_id", row.user_id)
        .eq("kind", row.kind)
        .eq("status", "active")
        .neq("id", row.id)
      for (const other of others ?? []) {
        if (other.subscription_code && other.email_token) {
          await disableOnPaystack(other.subscription_code, other.email_token).catch(e => console.error("disable old plan failed:", e))
        }
        await admin.from("paystack_subscriptions").update({ status: "replaced", updated_at: new Date().toISOString() }).eq("id", other.id)
      }
    }
    return
  }

  if (event === "subscription.disable" || event === "subscription.not_renew" || event === "invoice.payment_failed") {
    if (!subscriptionCode) return
    const status = event === "invoice.payment_failed" ? "failed" : "cancelled"
    const { data: row } = await admin
      .from("paystack_subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("subscription_code", subscriptionCode)
      .select("kind, user_id, agent_id, plan")
      .maybeSingle()
    if (!row) return
    const reason = status === "failed" ? "failed" : "cancelled"
    if (row.kind === "premium" && row.user_id) {
      const { emailPremiumStopped } = await import("@/lib/premiumBilling")
      await emailPremiumStopped(row.user_id, reason)
    } else if (row.kind === "agent" && row.agent_id) {
      const { emailSubscriptionStopped } = await import("@/lib/agentBilling")
      await emailSubscriptionStopped(row.agent_id, row.plan as PlanId, reason)
    }
  }
}

async function disableOnPaystack(code: string, token: string) {
  const res = await fetch(`${API}/subscription/disable`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ code, token }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.status) throw new Error(json?.message || "Could not stop the auto-renew.")
}

/** The person's active Paystack auto-renew of this kind, or null. */
export async function activePaystackSub(userId: string, kind: PaystackKind) {
  const { data } = await getSupabaseAdmin()
    .from("paystack_subscriptions")
    .select("id, plan, status, next_payment_date, subscription_code, email_token")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

/** Stops auto-renew. Months already paid stay. */
export async function cancelPaystackSub(userId: string, kind: PaystackKind) {
  const sub = await activePaystackSub(userId, kind)
  if (!sub) return false
  if (sub.subscription_code && sub.email_token) await disableOnPaystack(sub.subscription_code, sub.email_token)
  await getSupabaseAdmin().from("paystack_subscriptions").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", sub.id)
  return true
}
