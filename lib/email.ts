import "server-only"
import { Resend } from "resend"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

const BRAND = {
  navy: "#1E3A5F",
  gold: "#C9A84C",
  goldSoft: "#E8D5A3",
  cream: "#F7F5F0",
  white: "#FFFFFF",
  text: "#1A2332",
  muted: "#5C6B7A",
  border: "#E2E8F0",
}

const LOGO_URL = "https://cdn.jsdelivr.net/gh/ahmadado1/unrahconnect@main/assets/images/logo.jpg"
const SITE_URL = "https://myumrahconnect.com"
const INFO_EMAIL = "info@myumrahconnect.com"
const SUPPORT_EMAIL = "support@myumrahconnect.com"
const WHATSAPP_NUMBER = "+201222151335"
const WHATSAPP_URL = "https://wa.me/201222151335"

export type AgentEmailType =
  | "application_received"
  | "account_activated"
  | "reminder_7_days"
  | "reminder_1_day"
  | "expired"

type AgentMail = {
  agent_id: string
  email: string
  business_name: string | null
  owner_name: string | null
  agent_code: string | null
  plan: string | null
  paid_until: string | null
  type: AgentEmailType
}

const LIFECYCLE = new Set<AgentEmailType>(["application_received", "account_activated"])

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function wrapEmail(bodyHtml: string, options: { preheader?: string; title?: string } = {}) {
  const preheader = escapeHtml(options.preheader || "")
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(options.title || "UmrahConnect")}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};-webkit-font-smoothing:antialiased;">
  ${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 8px 28px rgba(30,58,95,0.10);">
          <tr>
            <td style="background:${BRAND.navy};padding:28px 32px 24px;text-align:center;">
              <img src="${LOGO_URL}" alt="UmrahConnect" width="88" height="88" style="display:block;margin:0 auto 14px;border-radius:16px;border:1px solid rgba(201,168,76,0.35);" />
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.5px;color:${BRAND.white};font-weight:700;">UmrahConnect</div>
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.goldSoft};margin-top:6px;letter-spacing:0.4px;">Your Umrah &amp; Hajj companion</div>
              <div style="height:3px;width:56px;background:${BRAND.gold};margin:18px auto 0;border-radius:2px;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#F1F4F8;padding:24px 32px;border-top:1px solid ${BRAND.border};text-align:center;">
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${BRAND.navy};font-weight:600;">UmrahConnect</p>
              <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:${BRAND.muted};line-height:1.5;">
                Supporting pilgrims with guides, prayer times, Quran, and trusted services.
              </p>
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;">
                <a href="mailto:${INFO_EMAIL}" style="color:${BRAND.navy};text-decoration:none;font-weight:600;">${INFO_EMAIL}</a>
                &nbsp;·&nbsp;
                <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.navy};text-decoration:none;font-weight:600;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;">
                <a href="${SITE_URL}" style="color:${BRAND.navy};text-decoration:none;font-weight:600;">myumrahconnect.com</a>
              </p>
              <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;color:#8A97A5;">
                © ${year} UmrahConnect. All rights reserved.<br />
                This is an automated message related to your UmrahConnect account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ctaButton(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
  <tr>
    <td style="background:${BRAND.gold};border-radius:28px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${BRAND.navy};text-decoration:none;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`
}

function planLabel(plan: string | null) {
  if (plan === "pro" || plan === "featured") return "Pro (Featured)"
  if (plan === "basic" || plan === "listed") return "Basic (Listed)"
  return "Trial (Listed)"
}

function formatDate(value: string | null) {
  if (!value) return ""
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return value
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** True once Paystack is switched on (set PAYSTACK_LIVE=true in Vercel). */
export function paystackLive() {
  return (process.env.PAYSTACK_LIVE || "").toLowerCase() === "true"
}

/** "New: pay by card, bank transfer or OPay in one tap" — only shown once Paystack is live. */
function newWayToPayLine() {
  if (!paystackLive()) return ""
  return `
    <p style="margin:16px 0 0;padding:12px 16px;background:#EEF6EE;border:1px solid #B7DFC0;border-radius:10px;color:${BRAND.text};">
      <strong style="color:#2F855A;">New:</strong> pay by card, bank transfer, USSD or OPay in one tap, confirmed straight away.
    </p>
  `
}

function renewLine() {
  return `
    <p style="margin:20px 0 0;padding:14px 16px;background:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:10px;color:${BRAND.text};">
      <strong style="color:${BRAND.navy};">How to renew.</strong>
      Log in to Agent Zone → Pay / Renew and pay by card, PayPal, OPay or MyNita.
      Need help? Email <a href="mailto:${INFO_EMAIL}" style="color:${BRAND.navy};font-weight:600;text-decoration:none;">${INFO_EMAIL}</a>
      or WhatsApp <a href="${WHATSAPP_URL}" style="color:${BRAND.navy};font-weight:600;text-decoration:none;">${WHATSAPP_NUMBER}</a>.
    </p>
    ${newWayToPayLine()}
  `
}

function greeting(name: string) {
  return `<p style="margin:0 0 16px;color:${BRAND.muted};">Assalamu Alaikum <strong style="color:${BRAND.navy};">${name}</strong>,</p>`
}

function buildEmail(agent: AgentMail) {
  const name = escapeHtml(agent.owner_name?.trim() || "there")
  const business = escapeHtml(agent.business_name?.trim() || "your agency")
  const code = escapeHtml(agent.agent_code || "")
  const plan = escapeHtml(planLabel(agent.plan))
  const until = escapeHtml(formatDate(agent.paid_until))

  if (agent.type === "application_received") {
    return {
      subject: "We received your UmrahConnect agent application",
      html: wrapEmail(
        `
        <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Application</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">Application received</h1>
        ${greeting(name)}
        <p style="margin:0 0 16px;color:${BRAND.muted};">
          We received the agent application for <strong style="color:${BRAND.navy};">${business}</strong>.
          It is pending review. We will email you when the account is activated.
        </p>
        <p style="margin:0 0 16px;color:${BRAND.muted};">
          Next step: log in to your dashboard and upload your documents (business registration, Hajj/Umrah licence, owner ID, office photo) so we can verify you.
        </p>
        ${ctaButton("Log in", "https://myumrahconnect.com/agents/login")}
        ${renewLine()}
        ${ctaButton("Email us", `mailto:${INFO_EMAIL}`)}
        <p style="margin:18px 0 0;color:${BRAND.navy};font-size:14px;font-weight:600;">
          Barak Allahu feekum,<br />
          <span style="font-weight:500;color:${BRAND.muted};">The UmrahConnect Team</span>
        </p>
        `,
        { title: "Application received", preheader: "Your UmrahConnect agent application is pending review." },
      ),
    }
  }

  if (agent.type === "account_activated") {
    const paidAhead = Boolean(agent.paid_until && agent.paid_until.slice(0, 10) >= new Date().toISOString().slice(0, 10))
    return {
      subject: "Your UmrahConnect agent account is verified ✓",
      html: wrapEmail(
        `
        <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Welcome</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">You are verified</h1>
        ${greeting(name)}
        <p style="margin:0 0 16px;color:${BRAND.muted};">
          ${paidAhead
            ? `<strong style="color:${BRAND.navy};">${business}</strong> is now verified and visible to pilgrims in the app. Share this code with your pilgrims.`
            : `<strong style="color:${BRAND.navy};">${business}</strong> is now verified. <strong style="color:${BRAND.navy};">Last step:</strong> choose a plan and pay in Agent Zone → Pay / Renew. Your agency goes live in the app as soon as you pay.`}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:10px;margin:0 0 8px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Agent code</p>
              <p style="margin:0 0 14px;color:${BRAND.navy};font-size:22px;font-weight:700;letter-spacing:2px;">${code}</p>
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Plan</p>
              <p style="margin:0;color:${BRAND.text};font-weight:600;">${plan}</p>
            </td>
          </tr>
        </table>
        ${paidAhead ? renewLine() : ""}
        ${paidAhead ? ctaButton("Open Agent Zone", `${SITE_URL}/agents/home`) : ctaButton("Choose a plan and pay", `${SITE_URL}/agents/billing`)}
        <p style="margin:18px 0 0;color:${BRAND.navy};font-size:14px;font-weight:600;">
          Barak Allahu feekum,<br />
          <span style="font-weight:500;color:${BRAND.muted};">The UmrahConnect Team</span>
        </p>
        `,
        { title: "You are verified", preheader: `Your agent code is ${agent.agent_code || ""}.` },
      ),
    }
  }

  if (agent.type === "reminder_7_days" || agent.type === "reminder_1_day") {
    const when = agent.type === "reminder_7_days" ? "in 7 days" : "tomorrow"
    return {
      subject: `Your UmrahConnect listing renews ${when}`,
      html: wrapEmail(
        `
        <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Renewal</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">Your listing ends ${when}</h1>
        ${greeting(name)}
        <p style="margin:0 0 16px;color:${BRAND.muted};">
          The listing for <strong style="color:${BRAND.navy};">${business}</strong>
          is paid through <strong style="color:${BRAND.navy};">${until}</strong>.
          After that date it is hidden until you renew.
        </p>
        ${renewLine()}
        ${ctaButton("Renew in Agent Zone", `${SITE_URL}/agents/billing`)}
        <p style="margin:18px 0 0;color:${BRAND.navy};font-size:14px;font-weight:600;">
          Barak Allahu feekum,<br />
          <span style="font-weight:500;color:${BRAND.muted};">The UmrahConnect Team</span>
        </p>
        `,
        { title: "Renewal reminder", preheader: `Your UmrahConnect listing ends ${when}.` },
      ),
    }
  }

  return {
    subject: "Your UmrahConnect listing has expired",
    html: wrapEmail(
      `
      <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Expired</p>
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">Your listing is hidden</h1>
      ${greeting(name)}
      <p style="margin:0 0 16px;color:${BRAND.muted};">
        The listing for <strong style="color:${BRAND.navy};">${business}</strong>
        ended on <strong style="color:${BRAND.navy};">${until}</strong>.
        It stays hidden until you renew.
      </p>
      ${renewLine()}
      ${ctaButton("Renew in Agent Zone", `${SITE_URL}/agents/billing`)}
      <p style="margin:18px 0 0;color:${BRAND.navy};font-size:14px;font-weight:600;">
        Barak Allahu feekum,<br />
        <span style="font-weight:500;color:${BRAND.muted};">The UmrahConnect Team</span>
      </p>
      `,
      { title: "Listing expired", preheader: "Your UmrahConnect listing is hidden until you renew." },
    ),
  }
}

async function deliver(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set")
  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL || "UmrahConnect <noreply@myumrahconnect.com>"
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: [INFO_EMAIL, SUPPORT_EMAIL],
    bcc: [INFO_EMAIL],
    subject,
    html,
  })
  if (error) {
    console.error("Resend error:", error)
    throw new Error(error.message)
  }
}

export type SendResult = { agent_id: string; type: string; status: string }

async function sendLogged(agent: AgentMail): Promise<SendResult> {
  const admin = getSupabaseAdmin()
  const claim: { agent_id: string; type: string; paid_until?: string | null } = {
    agent_id: agent.agent_id,
    type: agent.type,
  }
  if (!LIFECYCLE.has(agent.type)) claim.paid_until = agent.paid_until

  const { error: claimError } = await admin.from("agent_email_log").insert(claim)
  if (claimError) {
    if (claimError.code === "23505") {
      return { agent_id: agent.agent_id, type: agent.type, status: "already_sent" }
    }
    return { agent_id: agent.agent_id, type: agent.type, status: claimError.message }
  }

  try {
    const message = buildEmail(agent)
    const label = agent.type === "account_activated" ? "activated" : agent.type
    console.log(`agent email: sending ${label} to ${agent.email}`)
    await deliver(agent.email, message.subject, message.html)
    return { agent_id: agent.agent_id, type: agent.type, status: "sent" }
  } catch (error) {
    const match: { agent_id: string; type: string; paid_until?: string | null } = {
      agent_id: agent.agent_id,
      type: agent.type,
    }
    if (!LIFECYCLE.has(agent.type)) match.paid_until = agent.paid_until
    await admin.from("agent_email_log").delete().match(match)
    return {
      agent_id: agent.agent_id,
      type: agent.type,
      status: error instanceof Error ? error.message : "send_failed",
    }
  }
}

type AgentRow = {
  id: string
  email: string | null
  business_name: string | null
  agency_name: string | null
  owner_name: string | null
  agent_code: string | null
  referral_code: string | null
  plan: string | null
  paid_until: string | null
}

function mailFromRow(row: AgentRow, type: AgentEmailType): AgentMail | null {
  if (!row.email || !row.email.trim()) return null
  return {
    agent_id: row.id,
    email: row.email.trim(),
    business_name: row.business_name || row.agency_name,
    owner_name: row.owner_name,
    agent_code: row.agent_code || row.referral_code,
    plan: row.plan,
    paid_until: row.paid_until,
    type,
  }
}

export async function sendAgentLifecycleEmail(
  agentId: string,
  type: "application_received" | "account_activated",
  fallbackEmail?: string,
) {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("agents")
    .select("id, email, business_name, agency_name, owner_name, agent_code, referral_code, plan, paid_until")
    .eq("id", agentId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return { agent_id: agentId, type, status: "agent not found" } satisfies SendResult
  const row = data as AgentRow
  const mail = mailFromRow(row, type) ?? (fallbackEmail?.trim()
    ? mailFromRow({ ...row, email: fallbackEmail.trim() }, type)
    : null)
  if (!mail) return { agent_id: agentId, type, status: "no email" } satisfies SendResult
  return sendLogged(mail)
}

export async function sendDueAgentReminders() {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.rpc("agent_emails_due")
  if (error) throw new Error(error.message)
  const queue = (data ?? []) as AgentMail[]
  const results: SendResult[] = []
  for (const agent of queue) {
    if (!agent.email) {
      results.push({ agent_id: agent.agent_id, type: agent.type, status: "no email" })
      continue
    }
    results.push(await sendLogged(agent))
  }
  return results
}

// ─── Payment emails ─────────────────────────────────────────────────────────

export type PaymentMail = {
  to: string
  ownerName: string | null
  businessName: string | null
  planName: string
  amount: string
  months: number
  method: string
  paidUntil: string | null
}

function signOff() {
  return `<p style="margin:18px 0 0;color:${BRAND.navy};font-size:14px;font-weight:600;">
    Barak Allahu feekum,<br />
    <span style="font-weight:500;color:${BRAND.muted};">The UmrahConnect Team</span>
  </p>`
}

/** Sent when a payment is confirmed (PayPal automatically, OPay/Nita by the admin). */
export async function sendPaymentReceivedEmail(mail: PaymentMail) {
  const name = escapeHtml(mail.ownerName?.trim() || "there")
  const business = escapeHtml(mail.businessName?.trim() || "your agency")
  const until = escapeHtml(formatDate(mail.paidUntil))
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Payment</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">Payment received</h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      Thank you. We received <strong style="color:${BRAND.navy};">${escapeHtml(mail.amount)}</strong>
      for <strong style="color:${BRAND.navy};">${business}</strong>
      (${escapeHtml(mail.planName)}, ${mail.months} month${mail.months === 1 ? "" : "s"}, ${escapeHtml(mail.method)}).
    </p>
    ${until ? `<p style="margin:0 0 16px;color:${BRAND.muted};">Your listing is paid until <strong style="color:${BRAND.navy};">${until}</strong>.</p>` : ""}
    ${ctaButton("Open Agent Zone", `${SITE_URL}/agents/billing`)}
    ${signOff()}
    `,
    { title: "Payment received", preheader: "We received your UmrahConnect payment." },
  )
  await deliver(mail.to, "Payment received | UmrahConnect", html)
}

/** Sent when the admin rejects a manual payment. */
export async function sendPaymentRejectedEmail(mail: PaymentMail & { note: string }) {
  const name = escapeHtml(mail.ownerName?.trim() || "there")
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Payment</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">We could not confirm your payment</h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      We could not match your ${escapeHtml(mail.method)} payment of <strong style="color:${BRAND.navy};">${escapeHtml(mail.amount)}</strong> to our account.
    </p>
    ${mail.note.trim() ? `<p style="margin:0 0 16px;padding:14px 16px;background:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:10px;color:${BRAND.text};">${escapeHtml(mail.note)}</p>` : ""}
    <p style="margin:0 0 16px;color:${BRAND.muted};">Please check the details and send the receipt again from your Agent Zone, or reply to this email.</p>
    ${ctaButton("Open Agent Zone", `${SITE_URL}/agents/billing`)}
    ${signOff()}
    `,
    { title: "Payment not confirmed", preheader: "We could not confirm your UmrahConnect payment." },
  )
  await deliver(mail.to, "Payment not confirmed | UmrahConnect", html)
}

/** Tells the admin that an agent says they paid by OPay or Nita. */
export async function sendAdminPaymentNotice(info: { businessName: string; amount: string; method: string; reference: string; planName: string; months: number }) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || INFO_EMAIL
  const html = wrapEmail(
    `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.navy};">New payment to confirm</h1>
    <p style="margin:0 0 8px;color:${BRAND.text};"><strong>${escapeHtml(info.businessName)}</strong> says they paid
      <strong>${escapeHtml(info.amount)}</strong> by ${escapeHtml(info.method)}
      (${escapeHtml(info.planName)}, ${info.months} month${info.months === 1 ? "" : "s"}).</p>
    <p style="margin:0 0 8px;color:${BRAND.muted};">Reference: ${escapeHtml(info.reference || "—")}</p>
    <p style="margin:0 0 8px;color:${BRAND.muted};">Check your ${escapeHtml(info.method)} account, then confirm or reject it.</p>
    ${ctaButton("Open payments", `${SITE_URL}/admin/agents#payments`)}
    `,
    { title: "New payment", preheader: `${info.businessName} paid ${info.amount} by ${info.method}` },
  )
  await deliver(to, `New ${info.method} payment from ${info.businessName}, ${info.amount}`, html)
}

/** Sent when monthly card/PayPal billing stops: cancelled by the agent, or PayPal could not take the payment. */
export async function sendSubscriptionStoppedEmail(mail: {
  to: string
  ownerName: string | null
  businessName: string | null
  planName: string
  paidUntil: string | null
  reason: "cancelled" | "failed"
}) {
  const name = escapeHtml(mail.ownerName?.trim() || "there")
  const business = escapeHtml(mail.businessName?.trim() || "your agency")
  const until = escapeHtml(formatDate(mail.paidUntil))
  const failed = mail.reason === "failed"
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Subscription</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">
      ${failed ? "We could not take your monthly payment" : "Your monthly payment is cancelled"}
    </h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      ${failed
        ? `PayPal could not charge your card for the <strong style="color:${BRAND.navy};">${escapeHtml(mail.planName)}</strong> plan of <strong style="color:${BRAND.navy};">${business}</strong>, so monthly billing has stopped.`
        : `Monthly billing for the <strong style="color:${BRAND.navy};">${escapeHtml(mail.planName)}</strong> plan of <strong style="color:${BRAND.navy};">${business}</strong> is cancelled. You will not be charged again.`}
    </p>
    ${until ? `<p style="margin:0 0 16px;color:${BRAND.muted};">Your listing stays visible until <strong style="color:${BRAND.navy};">${until}</strong>. After that it is hidden from the app until you pay again. Your profile is kept.</p>` : ""}
    <p style="margin:0 0 16px;color:${BRAND.muted};">${failed ? "Update your card or pay again in Pay / Renew to stay listed." : "Changed your mind? You can subscribe again any time in Pay / Renew."}</p>
    ${ctaButton("Open Pay / Renew", `${SITE_URL}/agents/billing`)}
    ${signOff()}
    `,
    { title: failed ? "Payment failed" : "Subscription cancelled", preheader: failed ? "We could not take your monthly UmrahConnect payment." : "Your UmrahConnect monthly payment is cancelled." },
  )
  await deliver(mail.to, failed ? "Payment failed | UmrahConnect" : "Monthly payment cancelled | UmrahConnect", html)
}

// ─── "Need more info" emails ────────────────────────────────────────────────

/** Sent when the admin asks an agency for more information or better documents. */
export async function sendInfoRequestEmail(mail: { to: string; ownerName: string | null; businessName: string | null; message: string }) {
  const name = escapeHtml(mail.ownerName?.trim() || "there")
  const business = escapeHtml(mail.businessName?.trim() || "your agency")
  const message = escapeHtml(mail.message.trim()).replace(/\n/g, "<br />")
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Verification</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">We need a little more information</h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      We are reviewing <strong style="color:${BRAND.navy};">${business}</strong> and need the following before we can verify it:
    </p>
    <p style="margin:0 0 16px;padding:14px 16px;background:${BRAND.cream};border:1px solid ${BRAND.border};border-radius:10px;color:${BRAND.text};">${message}</p>
    <p style="margin:0 0 16px;color:${BRAND.muted};">Log in, update your details or documents and press Save. We will review it again straight away.</p>
    ${ctaButton("Update my application", `${SITE_URL}/agents/settings`)}
    ${signOff()}
    `,
    { title: "More information needed", preheader: "We need a little more information to verify your agency." },
  )
  await deliver(mail.to, "More information needed | UmrahConnect", html)
}

/** Tells the admin that an agency updated its application after a "need more info" message. */
export async function sendAdminInfoUpdatedNotice(info: { businessName: string; request: string }) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || INFO_EMAIL
  const html = wrapEmail(
    `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.navy};">Application updated</h1>
    <p style="margin:0 0 8px;color:${BRAND.text};"><strong>${escapeHtml(info.businessName)}</strong> updated its application.</p>
    <p style="margin:0 0 8px;color:${BRAND.muted};">You had asked: ${escapeHtml(info.request)}</p>
    ${ctaButton("Review agents", `${SITE_URL}/admin/agents`)}
    `,
    { title: "Application updated", preheader: `${info.businessName} updated its application` },
  )
  await deliver(to, `Application updated: ${info.businessName}`, html)
}

// ─── Pilgrim Premium emails ─────────────────────────────────────────────────

/** Sent when a Premium payment is credited. */
export async function sendPremiumReceivedEmail(mail: { to: string; name: string | null; planName: string; amount: string; premiumUntil: string }) {
  const name = escapeHtml(mail.name?.trim() || "there")
  const until = escapeHtml(formatDate(mail.premiumUntil))
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Premium</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">Welcome to UmrahConnect Premium</h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      Thank you. We received <strong style="color:${BRAND.navy};">${escapeHtml(mail.amount)}</strong> for the
      <strong style="color:${BRAND.navy};">${escapeHtml(mail.planName)}</strong> plan.
    </p>
    ${until ? `<p style="margin:0 0 16px;color:${BRAND.muted};">Premium is on until <strong style="color:${BRAND.navy};">${until}</strong> and renews automatically. Open the app on the same account to use it.</p>` : ""}
    ${ctaButton("My account", `${SITE_URL}/account`)}
    ${signOff()}
    `,
    { title: "Premium is on", preheader: "Your UmrahConnect Premium payment was received." },
  )
  await deliver(mail.to, "Premium is on | UmrahConnect", html)
}

/** Sent when Premium auto-renew stops: cancelled by the user, or PayPal could not charge. */
export async function sendPremiumStoppedEmail(mail: { to: string; name: string | null; premiumUntil: string | null; reason: "cancelled" | "failed" }) {
  const name = escapeHtml(mail.name?.trim() || "there")
  const until = escapeHtml(formatDate(mail.premiumUntil))
  const failed = mail.reason === "failed"
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Premium</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">
      ${failed ? "We could not renew your Premium" : "Premium auto-renew is off"}
    </h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      ${failed ? "PayPal could not charge your card, so Premium will not renew." : "You will not be charged again."}
      ${until ? ` Premium stays on until <strong style="color:${BRAND.navy};">${until}</strong>.` : ""}
    </p>
    <p style="margin:0 0 16px;color:${BRAND.muted};">You can get Premium again any time from your account.</p>
    ${ctaButton("My account", `${SITE_URL}/account`)}
    ${signOff()}
    `,
    { title: failed ? "Renewal failed" : "Auto-renew off", preheader: failed ? "We could not renew your UmrahConnect Premium." : "Your UmrahConnect Premium will not renew." },
  )
  await deliver(mail.to, failed ? "Premium renewal failed | UmrahConnect" : "Premium auto-renew is off | UmrahConnect", html)
}

/** A Premium OPay / MyNita transfer could not be found. */
export async function sendPremiumRejectedEmail(mail: { to: string; name: string | null; amount: string; method: string; note: string }) {
  const name = escapeHtml(mail.name?.trim() || "there")
  const html = wrapEmail(
    `
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.navy};">We could not find your payment</h1>
    <p style="margin:0 0 8px;color:${BRAND.text};">Salam ${name}, we checked our ${escapeHtml(mail.method)} account but could not match your
      payment of <strong>${escapeHtml(mail.amount)}</strong> for UmrahConnect Premium.</p>
    <p style="margin:0 0 8px;color:${BRAND.text};">${escapeHtml(mail.note)}</p>
    <p style="margin:0 0 8px;color:${BRAND.muted};">If you did pay, reply to this email with your receipt and we will fix it quickly.</p>
    ${ctaButton("Open my account", `${SITE_URL}/account`)}
    `,
    { title: "Payment not found", preheader: "We could not match your Premium payment" },
  )
  await deliver(mail.to, "Your UmrahConnect Premium payment", html)
}

// ─── Premium renewal reminders ──────────────────────────────────────────────

export type PremiumReminderType = "reminder_3_days" | "ended"

/** "Your Premium ends in 3 days" / "Your Premium has ended". Only for people who are not on auto-renew. */
export async function sendPremiumReminderEmail(mail: { to: string; name: string | null; type: PremiumReminderType; premiumUntil: string }) {
  const name = escapeHtml(mail.name?.trim() || "there")
  const until = escapeHtml(formatDate(mail.premiumUntil))
  const ended = mail.type === "ended"
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">Premium</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">
      ${ended ? "Your Premium has ended" : "Your Premium ends in 3 days"}
    </h1>
    ${greeting(name)}
    <p style="margin:0 0 16px;color:${BRAND.muted};">
      ${ended
        ? `Your UmrahConnect Premium ended on <strong style="color:${BRAND.navy};">${until}</strong>. The app is back to the free plan. Everything for your Umrah stays free; renew any time to get the Premium extras back.`
        : `Your UmrahConnect Premium is paid until <strong style="color:${BRAND.navy};">${until}</strong>. Renew before then to keep the extra Adhan voices, Mushaf fonts, Quran player, trip tools and unlimited AI guide.`}
    </p>
    <p style="margin:0 0 16px;color:${BRAND.muted};">If you renew early, the new time is added on top, so you lose nothing.</p>
    ${ctaButton(ended ? "Get Premium again" : "Renew Premium", `${SITE_URL}/account`)}
    ${newWayToPayLine()}
    ${signOff()}
    `,
    { title: ended ? "Premium ended" : "Premium ends soon", preheader: ended ? "Your Premium has ended." : `Your Premium ends on ${until}.` },
  )
  await deliver(mail.to, ended ? "Your UmrahConnect Premium has ended" : "Your UmrahConnect Premium ends in 3 days", html)
}

// ─── Announcement: new way to pay (Paystack) ────────────────────────────────

/** Sent once to every Premium user and agency when Paystack goes live. */
export async function sendNewWayToPayEmail(mail: { to: string; name: string | null; isAgency: boolean }) {
  const name = escapeHtml(mail.name?.trim() || "there")
  const html = wrapEmail(
    `
    <p style="margin:0 0 6px;font-size:13px;color:${BRAND.gold};font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">New</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">A new, easier way to pay</h1>
    ${greeting(name)}
    <p style="margin:0 0 12px;color:${BRAND.muted};">
      You can now pay for ${mail.isAgency ? "your agency listing" : "UmrahConnect Premium"} with
      <strong style="color:${BRAND.navy};">card, bank transfer, USSD or OPay</strong>, in one tap.
    </p>
    <ul style="margin:0 0 16px;padding-left:18px;color:${BRAND.muted};line-height:1.7;">
      <li>No more sending transfer details by hand: it is confirmed straight away.</li>
      <li>Choose ${mail.isAgency ? "1, 3, 6 or 12 months" : "a month or a whole year"} and pay once. We email you before it ends.</li>
      <li>Prices in Naira for Nigeria.</li>
    </ul>
    ${ctaButton(mail.isAgency ? "Open Agent Zone" : "Open my account", mail.isAgency ? `${SITE_URL}/agents/billing` : `${SITE_URL}/account`)}
    ${signOff()}
    `,
    { title: "New way to pay", preheader: "Pay by card, bank transfer, USSD or OPay in one tap." },
  )
  await deliver(mail.to, "New: pay UmrahConnect by card, bank transfer or OPay", html)
}
