/** Pilgrim Premium plans. Safe to use in the browser and on the server. */

export type PremiumPlanId = "monthly" | "yearly"

export const PREMIUM_PLANS: PremiumPlanId[] = ["monthly", "yearly"]

/** Prices in USD. Change here and in PayPal together. */
export const PREMIUM_PRICES: Record<PremiumPlanId, number> = {
  monthly: 1.99,
  yearly: 21.99,
}

/** How many months one payment adds. */
export const PREMIUM_MONTHS: Record<PremiumPlanId, number> = {
  monthly: 1,
  yearly: 12,
}

/** PayPal plan IDs (Premium product). Set them in .env.local after creating the plans in PayPal. */
export const PREMIUM_PAYPAL_PLAN_IDS: Record<PremiumPlanId, string> = {
  monthly: process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_MONTHLY || "P-0C266215F6024261MNLIKSPA",
  yearly: process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_YEARLY || "P-3R7964164R763420BNLIKUZA",
}

/** PayPal custom_id for a pilgrim: "user:<uuid>". Agents use their plain agent id. */
export const PREMIUM_CUSTOM_PREFIX = "user:"

export function premiumPlanFromPaypalId(id: string | null | undefined): PremiumPlanId | null {
  if (!id) return null
  if (id === PREMIUM_PAYPAL_PLAN_IDS.monthly) return "monthly"
  if (id === PREMIUM_PAYPAL_PLAN_IDS.yearly) return "yearly"
  return null
}

/** "Save 8%" on the yearly plan compared with 12 monthly payments. */
export function yearlySavingPercent() {
  const full = PREMIUM_PRICES.monthly * 12
  return Math.max(0, Math.round(((full - PREMIUM_PRICES.yearly) / full) * 100))
}

export function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`
}
