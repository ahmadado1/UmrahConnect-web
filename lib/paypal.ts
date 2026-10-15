import "server-only"

/** Live PayPal API. Set PAYPAL_API_BASE=https://api-m.sandbox.paypal.com to test with sandbox keys. */
const API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com"

let cachedToken: { value: string; expiresAt: number } | null = null

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error("Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the server.")
  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    throw new Error(`PayPal login failed (${response.status}): ${data?.error_description || data?.error || "unknown error"}`)
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 300) * 1000 }
  return cachedToken.value
}

async function paypal<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken()
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = data?.details?.[0]?.description || data?.message || data?.name || "unknown error"
    throw new Error(`PayPal ${path} failed (${response.status}): ${detail}`)
  }
  return data as T
}

export type PaypalSubscription = {
  id: string
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED" | string
  plan_id: string
  custom_id?: string
  start_time?: string
  create_time?: string
  subscriber?: { email_address?: string }
}

export type PaypalTransaction = {
  id: string
  status: string
  time: string
  amount_with_breakdown?: { gross_amount?: { value: string; currency_code: string } }
}

export function getSubscription(id: string) {
  return paypal<PaypalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`)
}

export async function listSubscriptionTransactions(id: string, since: Date) {
  const start = new Date(since.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const end = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const data = await paypal<{ transactions?: PaypalTransaction[] }>(
    `/v1/billing/subscriptions/${encodeURIComponent(id)}/transactions?start_time=${encodeURIComponent(start)}&end_time=${encodeURIComponent(end)}`,
  )
  return data?.transactions ?? []
}

export async function cancelSubscription(id: string, reason: string) {
  await paypal<void>(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason.slice(0, 120) }),
  })
}

/** Checks that a webhook really came from PayPal. Needs PAYPAL_WEBHOOK_ID. */
export async function verifyWebhook(headers: Headers, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is not set.")
  const result = await paypal<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    }),
  })
  return result?.verification_status === "SUCCESS"
}
