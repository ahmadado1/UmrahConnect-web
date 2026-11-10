"use client"
// Admin dashboard (for UmrahConnect admins, not agencies): the state of the whole agency
// programme at a glance — live agencies, ones waiting for review, plans ending soon,
// pilgrims brought by agencies, and commissions to pay out. Admins don't see agency tools
// (pilgrims list, QR, earnings, billing).
import { useEffect, useState } from "react"
import { formatDate } from "@/lib/agentFormat"
import { getSupabase } from "@/lib/supabaseBrowser"
import { ZONE_CSS } from "../zoneUi"
import { daysLeft, money } from "../ZoneBits"

type AgentRow = {
  id: string
  business_name: string | null
  agency_name: string | null
  country: string | null
  status: string | null
  plan: string | null
  verified: boolean | null
  paid_until: string | null
  hidden: boolean | null
  created_at: string
}
type CommissionRow = { agent_id: string; user_id: string | null; commission: number; currency: string; status: string; available_at: string }

export default function AdminHome({ email }: { email: string }) {
  const [agents, setAgents] = useState<AgentRow[] | null>(null)
  const [commissions, setCommissions] = useState<CommissionRow[]>([])
  const [referred, setReferred] = useState<number | null>(null)
  const [error, setError] = useState("")

  // Admins can read every agency, referral and commission (database rules allow is_admin()).
  useEffect(() => {
    const supabase = getSupabase()
    Promise.all([
      supabase
        .from("agents")
        .select("id, business_name, agency_name, country, status, plan, verified, paid_until, hidden, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("agent_commissions").select("agent_id, user_id, commission, currency, status, available_at"),
      supabase.from("pilgrim_referrals").select("user_id", { count: "exact", head: true }),
    ])
      .then(([a, c, r]) => {
        if (a.error) setError(a.error.message)
        setAgents((a.data ?? []) as AgentRow[])
        setCommissions(((c.data ?? []) as CommissionRow[]).map((x) => ({ ...x, commission: Number(x.commission) || 0 })))
        setReferred(r.count ?? 0)
      })
      .catch((e) => setError(String(e)))
  }, [])

  const real = (agents ?? []).filter((a) => !a.hidden) // test/admin agencies left out of the numbers
  const name = (a: AgentRow) => a.business_name || a.agency_name || "Agency"
  const left = (a: AgentRow) => daysLeft(a.paid_until)
  const isLive = (a: AgentRow) => a.status === "active" && (left(a) ?? -1) >= 0
  const live = real.filter(isLive)
  const pending = real.filter((a) => a.status === "pending")
  const lapsed = real.filter((a) => a.status === "expired" || (a.status === "active" && (left(a) ?? -1) < 0))
  const endingSoon = live.filter((a) => (left(a) ?? 99) <= 14)

  // Commissions ready to pay (refund period over), grouped by agency and currency.
  const now = Date.now()
  const readyByAgent = new Map<string, Map<string, number>>()
  let pendingUsd = 0
  for (const c of commissions) {
    if (c.status !== "earned") continue
    if (new Date(c.available_at).getTime() > now) {
      if (c.currency === "USD") pendingUsd += c.commission
      continue
    }
    const byCur = readyByAgent.get(c.agent_id) ?? new Map<string, number>()
    byCur.set(c.currency, (byCur.get(c.currency) ?? 0) + c.commission)
    readyByAgent.set(c.agent_id, byCur)
  }
  const premiumViaAgents = new Set(commissions.filter((c) => c.status !== "reversed" && c.user_id).map((c) => c.user_id)).size
  const agentName = (id: string) => {
    const a = (agents ?? []).find((x) => x.id === id)
    return a ? name(a) : "Agency"
  }

  return (
    <main className="z-page">
      <style>{ZONE_CSS}</style>
      <style>{`
        .z-admin-head { background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); color: #fff; border-radius: 20px; padding: 22px 24px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .z-admin-head h1 { margin: 0; font-size: 24px; color: #fff; }
        .z-admin-head p { margin: 4px 0 0; color: rgba(255,255,255,.75); font-size: 14px; }
        .z-admin-badge { display: inline-block; background: #C9A84C; color: #1E3A5F; font-weight: 800; font-size: 12px; letter-spacing: .06em; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
      `}</style>
      <div className="z-wrap">
        {/* Header: clearly an admin, not an agency */}
        <div className="z-admin-head">
          <div>
            <span className="z-admin-badge">ADMIN</span>
            <h1>UmrahConnect admin</h1>
            <p>{email}</p>
          </div>
          <a className="z-btn z-btn--gold" href="/agents/admin">Manage agencies →</a>
        </div>
        {error ? <p className="agent-error">{error}</p> : null}

        {/* Programme numbers */}
        <div className="z-kpis">
          <div className="z-kpi z-kpi--navy"><span>Live agencies</span><strong>{agents ? live.length : "…"}</strong></div>
          <div className="z-kpi"><span>Waiting for review</span><strong>{agents ? pending.length : "…"}</strong></div>
          <div className="z-kpi"><span>Pilgrims via agencies</span><strong>{referred ?? "…"}</strong></div>
          <div className="z-kpi"><span>Premium via agencies</span><strong>{premiumViaAgents}</strong></div>
        </div>

        <div className="z-grid">
          <div className="z-col">
            {/* To do: verify new agencies */}
            <section className="z-panel">
              <div className="z-panel-head">
                <h2>Waiting for review</h2>
                <a className="z-link" href="/agents/admin">Review →</a>
              </div>
              {pending.length === 0 ? (
                <div className="z-empty">No agencies waiting. 🎉</div>
              ) : (
                <div className="z-list">
                  {pending.slice(0, 8).map((a) => (
                    <div className="z-row" key={a.id}>
                      <div className="z-avatar">{name(a).charAt(0).toUpperCase()}</div>
                      <div className="z-row-main">
                        <strong>{name(a)}</strong>
                        <small>{[a.country, `signed up ${formatDate(a.created_at)}`].filter(Boolean).join(" · ")}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Plans ending or ended */}
            <section className="z-panel">
              <div className="z-panel-head"><h2>Plans ending soon / ended</h2></div>
              {endingSoon.length + lapsed.length === 0 ? (
                <div className="z-empty">All live plans have more than 14 days left.</div>
              ) : (
                <div className="z-list">
                  {[...endingSoon, ...lapsed].slice(0, 10).map((a) => {
                    const d = left(a)
                    return (
                      <div className="z-row" key={a.id}>
                        <div className="z-row-main">
                          <strong>{name(a)}</strong>
                          <small>{a.country || ""}</small>
                        </div>
                        <span className={`z-pill ${d !== null && d >= 0 ? "z-pill--pending" : "z-pill--reversed"}`}>
                          {d === null ? "No date" : d >= 0 ? `${d} days left` : `Ended ${formatDate(a.paid_until)}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="z-col">
            {/* Money owed to agencies */}
            <section className="z-panel">
              <div className="z-panel-head"><h2>Commissions to pay</h2></div>
              <p className="z-muted" style={{ marginBottom: 8 }}>
                Ready after the 30-day refund period. Pay by bank or Paystack transfer (minimum $10), then mark paid.
              </p>
              {readyByAgent.size === 0 ? (
                <div className="z-empty">Nothing ready to pay yet.</div>
              ) : (
                <div className="z-list">
                  {[...readyByAgent.entries()].map(([id, byCur]) => (
                    <div className="z-row" key={id}>
                      <div className="z-row-main"><strong>{agentName(id)}</strong></div>
                      <div className="z-row-end">
                        {[...byCur.entries()].map(([cur, amt]) => money(amt, cur)).join(" + ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="z-muted" style={{ marginTop: 10 }}>Still in refund period: {money(pendingUsd, "USD")}</p>
            </section>

            {/* Shortcuts */}
            <section className="z-panel">
              <div className="z-panel-head"><h2>Shortcuts</h2></div>
              <div className="z-actions">
                <a className="z-action" href="/agents/admin">
                  <strong>Agencies</strong>
                  <small>Verify, plans, extend, suspend</small>
                </a>
                <a className="z-action" href="/agents/admin#payments">
                  <strong>Payments</strong>
                  <small>Confirm manual transfers</small>
                </a>
                <a className="z-action" href="/agents/settings">
                  <strong>My profile</strong>
                  <small>Name and details</small>
                </a>
                <a className="z-action" href="/agents/admin#announce">
                  <strong>Announcements</strong>
                  <small>Message all agencies</small>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
