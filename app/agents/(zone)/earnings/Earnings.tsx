"use client"
// Agent earnings: 10% of the Premium paid by pilgrims who joined with this agency's code
// (first agency gets the credit, first 12 months, ready 30 days after payment).
// Data: agent_commission_summary (totals) and agent_commissions (each payment).
import { useEffect, useState } from "react"
import { formatDate, isActiveAgent } from "@/lib/agentFormat"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { useAgentSession } from "../../useAgentSession"
import { ZONE_CSS } from "../zoneUi"
import { RenewAlert, ZoneHead, money, sumText, useEarnings, ZoneSkeleton } from "../ZoneBits"

type Commission = {
  id: string
  plan: string | null
  gross_amount: number
  commission: number
  currency: string
  status: "earned" | "paid" | "reversed"
  paid_at: string
  available_at: string
}

export default function Earnings() {
  const { t } = useT()
  const { agent, loading, error } = useAgentSession()
  const totals = useEarnings(agent?.id ?? null)
  const [items, setItems] = useState<Commission[] | null>(null)
  const [referred, setReferred] = useState<number | null>(null)

  // Each payment + how many pilgrims this agency brought
  useEffect(() => {
    if (!agent) return
    let cancelled = false
    const supabase = getSupabase()
    Promise.all([
      supabase
        .from("agent_commissions")
        .select("id, plan, gross_amount, commission, currency, status, paid_at, available_at")
        .eq("agent_id", agent.id)
        .order("paid_at", { ascending: false })
        .limit(200),
      supabase.from("pilgrim_referrals").select("user_id", { count: "exact", head: true }).eq("agent_id", agent.id),
    ]).then(([list, refs]) => {
      if (cancelled) return
      setItems(((list.data as Commission[] | null) ?? []).map((c) => ({ ...c, gross_amount: Number(c.gross_amount), commission: Number(c.commission) })))
      setReferred(refs.count ?? 0)
    })
    return () => {
      cancelled = true
    }
  }, [agent])

  if (loading) return <ZoneSkeleton />
  if (!agent) return <main className="agent-page">{error ? <p className="agent-error">{error}</p> : null}</main>

  const premiumCount = totals ? totals.reduce((n, r) => n + r.premium_pilgrims, 0) : null
  const now = Date.now()

  /** Pending (refund period), Ready (can be paid), Paid, Refunded. */
  function statusOf(c: Commission) {
    if (c.status === "paid") return { label: t.zui.stPaid, cls: "paid" }
    if (c.status === "reversed") return { label: t.zui.stReversed, cls: "reversed" }
    if (new Date(c.available_at).getTime() <= now) return { label: t.zui.stReady, cls: "ready" }
    return { label: t.zui.stPending, cls: "pending" }
  }

  return (
    <main className="z-page">
      <style>{ZONE_CSS}</style>
      <div className="z-wrap">
        <ZoneHead agent={agent} subtitle={t.zui.earnLead} />
        {isActiveAgent(agent) ? <RenewAlert agent={agent} /> : null}

        {/* Totals */}
        <div className="z-kpis">
          <div className="z-kpi z-kpi--navy">
            <span>{t.zui.ready}</span>
            <strong>{sumText(totals, "ready")}</strong>
          </div>
          <div className="z-kpi">
            <span>{t.zui.pending}</span>
            <strong>{sumText(totals, "pending")}</strong>
          </div>
          <div className="z-kpi">
            <span>{t.zui.paid}</span>
            <strong>{sumText(totals, "paid")}</strong>
          </div>
          <div className="z-kpi">
            <span>{t.zui.onPremium}</span>
            <strong>
              {premiumCount ?? "…"}
              <small style={{ fontSize: 13, color: "#5C6B7A", fontWeight: 600 }}> / {referred ?? "…"}</small>
            </strong>
          </div>
        </div>

        <div className="z-grid">
          {/* Each payment */}
          <section className="z-panel">
            <div className="z-panel-head"><h2>{t.zui.history}</h2></div>
            {items === null ? (
              <p className="z-muted">…</p>
            ) : items.length === 0 ? (
              <div className="z-empty">{t.zui.noEarnings}</div>
            ) : (
              <div className="z-list">
                {items.map((c) => {
                  const st = statusOf(c)
                  return (
                    <div className="z-row" key={c.id}>
                      <div className="z-row-main">
                        <strong>
                          {c.plan === "yearly" ? t.zui.yearly : t.zui.monthly} · {formatDate(c.paid_at)}
                        </strong>
                        <small>
                          {t.zui.colPaid}: {money(c.gross_amount, c.currency)}
                        </small>
                      </div>
                      <div className="z-row-end">
                        <div>{money(c.commission, c.currency)}</div>
                        <span className={`z-pill z-pill--${st.cls}`}>{st.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* How it works */}
          <section className="z-panel">
            <div className="z-panel-head"><h2>{t.zui.earnTitle}</h2></div>
            <p className="z-muted" style={{ marginBottom: 8 }}>{t.zui.earnLead}</p>
            <p className="z-muted" style={{ marginBottom: 8 }}>{t.zui.pendingHint}</p>
            <p className="z-muted" style={{ marginBottom: 14 }}>{t.zui.payoutHint}</p>
            <a className="z-btn z-btn--gold" href="/agents/dashboard#qr">{t.zui.shareTitle}</a>
          </section>
        </div>
      </div>
    </main>
  )
}
