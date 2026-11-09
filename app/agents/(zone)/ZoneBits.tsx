"use client"
// Building blocks shared by the Agent Zone pages (Home, Pilgrims, Earnings).
import { useEffect, useState } from "react"
import type { OwnAgent } from "@/lib/agentAccount"
import { citiesToText } from "@/lib/agentAccount"
import { agentJoinUrl } from "@/lib/agentPlans"
import { formatDate } from "@/lib/agentFormat"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { downloadAgentPoster, useAgentQr } from "../poster"
import VerifiedCheck from "../VerifiedCheck"

export const isFeatured = (agent: Pick<OwnAgent, "plan">) => agent.plan === "pro" || agent.plan === "featured"

/** Whole days until the plan ends (negative = ended). null when there is no date. */
export function daysLeft(paidUntil: string | null) {
  if (!paidUntil) return null
  const end = new Date(`${paidUntil.slice(0, 10)}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86_400_000)
}

/** "$12.50", "₦30,000"... */
export function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ─── Page header: logo, name, badges, small "Manage plan" link (no big pay button) ───
export function ZoneHead({ agent, subtitle }: { agent: OwnAgent; subtitle?: string }) {
  const { t } = useT()
  const left = daysLeft(agent.paid_until)
  const initial = (agent.business_name || "A").trim().charAt(0).toUpperCase()
  return (
    <div className="z-head">
      <div className="z-head-left">
        {agent.logo_url ? <img className="z-logo" src={agent.logo_url} alt="" /> : <div className="z-logo">{initial}</div>}
        <div style={{ minWidth: 0 }}>
          <h1 className="z-title">
            {agent.business_name || t.common.yourAgency}
            {agent.verified ? <VerifiedCheck /> : null}
          </h1>
          {subtitle ? <p className="z-sub">{subtitle}</p> : null}
          <div className="z-chips">
            <span className="z-chip z-chip--gold">{isFeatured(agent) ? t.settings.featured : t.settings.listed}</span>
            {agent.agent_code ? <span className="z-chip">{agent.agent_code}</span> : null}
            {left !== null && left >= 0 && left < 3650 ? (
              <span className="z-chip z-chip--green">{fill(t.zui.activeUntil, { date: formatDate(agent.paid_until) })}</span>
            ) : null}
          </div>
        </div>
      </div>
      <a className="z-plan-link" href="/agents/billing">{t.zui.managePlan}</a>
    </div>
  )
}

// ─── Renew reminder: only when the plan ends within 14 days ───
export function RenewAlert({ agent }: { agent: OwnAgent }) {
  const { t } = useT()
  const left = daysLeft(agent.paid_until)
  if (left === null || left > 14) return null
  return (
    <div className={`z-alert${left < 0 ? " z-alert--red" : ""}`}>
      <span>{left < 0 ? t.zui.ended : fill(t.zui.endsIn, { days: String(left) })}</span>
      <a className="z-btn z-btn--gold" href="/agents/billing">{t.zui.renew}</a>
    </div>
  )
}

// ─── QR card: code, copy link, download poster ───
export function QrPanel({ agent }: { agent: OwnAgent }) {
  const { t } = useT()
  const qrUrl = useAgentQr(agent.agent_code ?? null)
  const [copied, setCopied] = useState(false)
  if (!agent.agent_code) return null
  const link = agentJoinUrl(agent.agent_code)
  return (
    <section className="z-panel" id="qr">
      <div className="z-panel-head">
        <h2>{t.zui.shareTitle}</h2>
      </div>
      <div className="z-qr">
        {qrUrl ? <img src={qrUrl} alt={fill(t.dash.qrAlt, { code: agent.agent_code })} /> : null}
        <div className="z-code">{agent.agent_code}</div>
        <p className="z-muted">{t.zui.shareLead}</p>
        <div className="z-btns">
          <button
            type="button"
            className="z-btn z-btn--line"
            onClick={() => {
              void navigator.clipboard?.writeText(link).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
          >
            {copied ? t.zui.copied : t.zui.copyLink}
          </button>
          <button
            type="button"
            className="z-btn z-btn--gold"
            disabled={!qrUrl}
            onClick={() => downloadAgentPoster(agent.agent_code!, agent.business_name, qrUrl)}
          >
            {t.zui.poster}
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── How pilgrims see the agency in the app (compact) ───
export function ListingPanel({ agent }: { agent: OwnAgent }) {
  const { t } = useT()
  const initial = (agent.business_name || "A").trim().charAt(0).toUpperCase()
  return (
    <section className="z-panel">
      <div className="z-panel-head">
        <h2>{t.zui.listing}</h2>
        <a className="z-link" href="/agents/settings">{t.zui.editProfile}</a>
      </div>
      <div className="z-preview">
        {agent.logo_url ? <img className="z-logo" src={agent.logo_url} alt="" /> : <div className="z-logo">{initial}</div>}
        <div style={{ minWidth: 0 }}>
          <strong style={{ color: "#1E3A5F" }}>
            {agent.business_name || t.common.agency} {agent.verified ? <VerifiedCheck /> : null}
          </strong>
          <p>
            {agent.verified ? `${t.dash.verified} · ` : ""}
            {isFeatured(agent) ? t.settings.featured : t.settings.listed}
            {agent.country ? ` · ${agent.country}` : ""}
          </p>
          {agent.cities?.length ? <p>{citiesToText(agent.cities)}</p> : null}
          {agent.phone ? <p>{fill(t.dash.call, { phone: agent.phone })}</p> : null}
          {agent.whatsapp ? <p>{fill(t.dash.whatsapp, { phone: agent.whatsapp })}</p> : null}
          {agent.email ? <p>{agent.email}</p> : null}
        </div>
      </div>
    </section>
  )
}

// ─── Earnings (10% commission) numbers, from the database ───
export type EarnSummary = { currency: string; premium_pilgrims: number; pending: number; ready: number; paid: number }

export function useEarnings(agentId: string | null) {
  const [rows, setRows] = useState<EarnSummary[] | null>(null)
  useEffect(() => {
    if (!agentId) return
    let cancelled = false
    getSupabase()
      .from("agent_commission_summary")
      .select("currency, premium_pilgrims, pending, ready, paid")
      .eq("agent_id", agentId)
      .then(({ data }) => {
        if (cancelled) return
        setRows(
          ((data as EarnSummary[] | null) ?? []).map((r) => ({
            currency: r.currency,
            premium_pilgrims: Number(r.premium_pilgrims) || 0,
            pending: Number(r.pending) || 0,
            ready: Number(r.ready) || 0,
            paid: Number(r.paid) || 0,
          })),
        )
      })
    return () => {
      cancelled = true
    }
  }, [agentId])
  return rows
}

/** Money for one total (USD first, then local currency). */
export function sumText(rows: EarnSummary[] | null, key: "pending" | "ready" | "paid") {
  if (!rows) return "…"
  const parts = rows.filter((r) => r[key] > 0).map((r) => money(r[key], r.currency))
  return parts.length ? parts.join(" + ") : money(0, "USD")
}
