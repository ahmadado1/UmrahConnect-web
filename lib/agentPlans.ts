/** Agent plans, prices and payment details. Edit the values here to change what agents see. */

export type PlanId = "listed" | "featured"
export type Currency = "USD" | "NGN" | "XOF"
export type ManualMethod = "opay" | "nita"

/** Monthly price of each plan in each currency. */
export const PLAN_PRICES: Record<PlanId, Record<Currency, number>> = {
  listed: { USD: 19.99, NGN: 30000, XOF: 12000 },
  featured: { USD: 39.99, NGN: 60000, XOF: 24000 },
}

/** PayPal subscription plans (Pay & Get Paid > Subscriptions). Plan IDs are not secret. */
export const PAYPAL_PLAN_IDS: Record<PlanId, string> = {
  // NEXT_PUBLIC_PAYPAL_PLAN_* can point to sandbox plans while testing.
  listed: process.env.NEXT_PUBLIC_PAYPAL_PLAN_LISTED || "P-4Y737264VN488205XNLHB4XA",
  featured: process.env.NEXT_PUBLIC_PAYPAL_PLAN_FEATURED || "P-03B65249A36198903NLHCAKI",
}

/**
 * Manual transfer details. A method is hidden from agents while its accountNumber is empty.
 * Fill these in with your real OPay and Nita details.
 */
export const MANUAL_METHODS: Record<ManualMethod, {
  label: string
  currency: Currency
  country: string
  accountName: string
  accountNumber: string
  bank: string
  instructions: string
}> = {
  opay: {
    label: "OPay",
    currency: "NGN",
    country: "Nigeria",
    accountName: "AHMAD ADO MUKTAR",
    accountNumber: "7064443392",
    bank: "OPay",
    instructions: "Send the exact amount and write your payment code in the transfer note (narration).",
  },
  nita: {
    label: "MyNita",
    currency: "XOF",
    country: "Niger",
    accountName: "AHMAD ADO MUKTAR",
    accountNumber: "+227 79 55 22 67",
    bank: "MyNita",
    instructions: "Send the exact amount with MyNita (Send Money) and write your payment code in the note.",
  },
}

export const MONTH_OPTIONS = [1, 3, 6, 12] as const

export function formatMoney(amount: number, currency: Currency) {
  if (currency === "USD") return `$${amount.toFixed(2)}`
  const rounded = Math.round(amount).toLocaleString("en-US")
  return currency === "NGN" ? `₦${rounded}` : `${rounded} CFA`
}

export function priceFor(plan: PlanId, currency: Currency, months = 1) {
  return Math.round(PLAN_PRICES[plan][currency] * months * 100) / 100
}

export function isPlanId(value: unknown): value is PlanId {
  return value === "listed" || value === "featured"
}

export function planFromPaypalId(id: string | null | undefined): PlanId | null {
  if (!id) return null
  if (id === PAYPAL_PLAN_IDS.listed) return "listed"
  if (id === PAYPAL_PLAN_IDS.featured) return "featured"
  return null
}

/** Local currency for an agent's country. */
export function currencyForCountry(country: string | null | undefined): Currency {
  const value = (country || "").trim().toLowerCase()
  if (value === "nigeria" || value === "ng") return "NGN"
  if (value === "niger" || value === "ne") return "XOF"
  return "USD"
}

/** Manual methods that are set up, the agent's own country first. */
export function manualMethodsFor(country: string | null | undefined): ManualMethod[] {
  const local = currencyForCountry(country)
  return (Object.keys(MANUAL_METHODS) as ManualMethod[])
    .filter((key) => MANUAL_METHODS[key].accountNumber.trim())
    .sort((a, b) => Number(MANUAL_METHODS[b].currency === local) - Number(MANUAL_METHODS[a].currency === local))
}

export const AGENT_PLANS = [
  {
    id: "listed" as PlanId,
    name: "Listed",
    price: formatMoney(PLAN_PRICES.listed.USD, "USD"),
    localPrice: `${formatMoney(PLAN_PRICES.listed.NGN, "NGN")} · ${formatMoney(PLAN_PRICES.listed.XOF, "XOF")}`,
    period: "per month",
    summary: "Your agency is listed in the app for pilgrims in your country.",
    features: [
      "Agency profile in the UmrahConnect app",
      "A personal agent code pilgrims can enter",
      "A QR poster that opens your agent page",
    ],
    highlight: false,
  },
  {
    id: "featured" as PlanId,
    name: "Featured",
    price: formatMoney(PLAN_PRICES.featured.USD, "USD"),
    localPrice: `${formatMoney(PLAN_PRICES.featured.NGN, "NGN")} · ${formatMoney(PLAN_PRICES.featured.XOF, "XOF")}`,
    period: "per month",
    summary: "Featured agencies are shown ahead of Listed ones, with a gold badge.",
    features: [
      "Everything in Listed",
      "Featured placement in your country",
      "Gold badge on your listing",
    ],
    highlight: true,
  },
] as const

export const AGENT_RENEW = {
  email: "info@myumrahconnect.com",
  whatsappDisplay: "+201222151335",
  whatsappUrl: "https://wa.me/201222151335",
}

export const SITE_URL = "https://myumrahconnect.com"

export function agentJoinUrl(agentCode: string) {
  return `${SITE_URL}/a/${encodeURIComponent(agentCode)}`
}

/** Short code an agent writes in the OPay / MyNita transfer note (e.g. "UA-1A2B3C"). */
export function agentPayCode(agentId: string) {
  return `UA-${String(agentId).replace(/-/g, "").slice(0, 6).toUpperCase()}`
}
