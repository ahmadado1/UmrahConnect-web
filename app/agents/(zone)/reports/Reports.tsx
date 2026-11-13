"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseBrowser"
import { ZONE_CSS } from "../zoneUi"

/** Shape of public.admin_stats() (see supabase/admin-stats.sql). Missing parts are optional. */
type Stats = {
  generated_at: string
  users: { total: number; new_today: number; new_7d: number; new_30d: number; signed_in_7d: number; signed_in_30d: number; agents: number; pilgrims: number }
  providers: Record<string, number>
  languages: Record<string, number>
  nationalities: { name: string; count: number }[]
  signups_daily: { day: string; count: number }[]
  admins: number
  premium?: { active: number; store: number; website: number; ever: number }
  agencies: { total: number; live: number; verified: number; pending: number; docs_ready: number; suspended: number; new_7d: number; founding_left: number }
  agency_countries: { name: string; count: number; live: number }[]
  pilgrims_linked?: number
  agency_contacts_30d?: number
  agent_link_clicks_30d?: number
  commissions?: Record<string, { count: number; owed: number; paid: number }>
  ai?: { questions_7d: number; questions_30d: number; people_7d: number }
  settings_backups?: number
}

const LANG_NAMES: Record<string, string> = { en: "English", ar: "Arabic", fr: "French", tr: "Turkish", ur: "Urdu", bn: "Bengali" }
const PROVIDER_NAMES: Record<string, string> = { email: "Email", google: "Google", apple: "Apple", phone: "Phone" }

const CSS = `
.r-section { margin-top: 22px; }
.r-section h2 { font-size: 15px; color: #1E3A5F; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .05em; }
.r-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.r-kpi small { display: block; margin-top: 4px; color: #5C6B7A; font-size: 12px; }
.r-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.r-bars { display: grid; gap: 8px; }
.r-bar { display: grid; grid-template-columns: 120px 1fr 48px; gap: 10px; align-items: center; font-size: 14px; color: #1A2332; }
.r-bar-track { height: 10px; background: #EEF2F7; border-radius: 999px; overflow: hidden; }
.r-bar-fill { height: 100%; background: #C9A84C; border-radius: 999px; }
.r-bar b { text-align: right; color: #1E3A5F; }
.r-chart { display: flex; align-items: flex-end; gap: 3px; height: 120px; padding-top: 8px; }
.r-col { flex: 1; background: #1E3A5F; border-radius: 4px 4px 0 0; min-height: 2px; position: relative; }
.r-col:hover { background: #C9A84C; }
.r-axis { display: flex; justify-content: space-between; font-size: 11px; color: #5C6B7A; margin-top: 6px; }
.r-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.r-note { color: #5C6B7A; font-size: 13px; line-height: 1.6; }
@media (max-width: 560px) { .r-bar { grid-template-columns: 90px 1fr 40px; } }
`

const fmt = (n: number | undefined | null) => (typeof n === "number" ? n.toLocaleString("en-US") : "–")

function Kpi({ label, value, sub, navy = false }: { label: string; value: number | string | undefined; sub?: string; navy?: boolean }) {
  return (
    <div className={`z-kpi r-kpi${navy ? " z-kpi--navy" : ""}`}>
      <span>{label}</span>
      <strong>{typeof value === "number" ? fmt(value) : value ?? "–"}</strong>
      {sub ? <small>{sub}</small> : null}
    </div>
  )
}

/** Horizontal bars: label · bar · number */
function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  if (!rows.length) return <p className="r-note">No data yet.</p>
  return (
    <div className="r-bars">
      {rows.map((r) => (
        <div className="r-bar" key={r.label}>
          <span>{r.label}</span>
          <div className="r-bar-track"><div className="r-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <b>{fmt(r.value)}</b>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) throw new Error("Log in again.")
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error || "Could not load the report.")
      setStats(body as Stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the report.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const s = stats
  const daily = s?.signups_daily ?? []
  const maxDay = Math.max(1, ...daily.map((d) => d.count))
  const commissionLines = s?.commissions ? Object.entries(s.commissions) : []

  return (
    <main className="z-page">
      <style>{ZONE_CSS}</style>
      <style>{CSS}</style>
      <div className="z-wrap">
        <div className="r-head">
          <div>
            <h1 className="z-title" style={{ margin: 0 }}>Reports</h1>
            <p className="r-note" style={{ margin: "4px 0 0" }}>
              Live numbers from Supabase{s ? ` · updated ${new Date(s.generated_at).toLocaleString("en-GB")}` : ""}
            </p>
          </div>
          <button className="z-btn z-btn--gold" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {error ? <p className="agent-error" style={{ marginTop: 16 }}>{error}</p> : null}

        {s ? (
          <>
            {/* ─── Users ─────────────────────────────────────────────── */}
            <section className="r-section">
              <h2>Users</h2>
              <div className="r-kpis">
                <Kpi navy label="Accounts" value={s.users.total} sub={`+${fmt(s.users.new_today)} today`} />
                <Kpi label="New, last 7 days" value={s.users.new_7d} sub={`${fmt(s.users.new_30d)} in 30 days`} />
                <Kpi label="Signed in, 7 days" value={s.users.signed_in_7d} sub={`${fmt(s.users.signed_in_30d)} in 30 days`} />
                <Kpi label="Pilgrims" value={s.users.pilgrims} />
                <Kpi label="Agency accounts" value={s.users.agents} />
                <Kpi label="Admins" value={s.admins} />
              </div>
            </section>

            <section className="r-section z-panel">
              <h2>New accounts per day (last 30 days)</h2>
              <div className="r-chart">
                {daily.map((d) => (
                  <div
                    key={d.day}
                    className="r-col"
                    style={{ height: `${(d.count / maxDay) * 100}%` }}
                    title={`${new Date(d.day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${d.count}`}
                  />
                ))}
              </div>
              <div className="r-axis">
                <span>{daily[0] ? new Date(daily[0].day).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
                <span>Today</span>
              </div>
            </section>

            <div className="r-section r-two">
              <section className="z-panel">
                <h2>App language</h2>
                <Bars rows={Object.entries(s.languages).map(([k, v]) => ({ label: LANG_NAMES[k] || k, value: v }))} />
              </section>
              <section className="z-panel">
                <h2>Sign-in method</h2>
                <Bars rows={Object.entries(s.providers).map(([k, v]) => ({ label: PROVIDER_NAMES[k] || k, value: v }))} />
              </section>
              <section className="z-panel">
                <h2>Nationality (top 12)</h2>
                <Bars rows={s.nationalities.map((n) => ({ label: n.name, value: n.count }))} />
              </section>
            </div>

            {/* ─── Premium ───────────────────────────────────────────── */}
            {s.premium ? (
              <section className="r-section">
                <h2>Premium</h2>
                <div className="r-kpis">
                  <Kpi navy label="Premium now" value={s.premium.active} sub={s.users.pilgrims ? `${((s.premium.active / Math.max(1, s.users.pilgrims)) * 100).toFixed(1)}% of pilgrims` : undefined} />
                  <Kpi label="App Store / Google Play" value={s.premium.store} />
                  <Kpi label="Website (card, transfer)" value={s.premium.website} />
                  <Kpi label="Ever had Premium" value={s.premium.ever} />
                </div>
              </section>
            ) : null}

            {/* ─── Agencies ──────────────────────────────────────────── */}
            <section className="r-section">
              <h2>Agencies (test agencies not counted)</h2>
              <div className="r-kpis">
                <Kpi navy label="Live in the app" value={s.agencies.live} />
                <Kpi label="Signed up" value={s.agencies.total} sub={`+${fmt(s.agencies.new_7d)} this week`} />
                <Kpi label="Ready to verify" value={s.agencies.docs_ready} sub="all documents in" />
                <Kpi label="Waiting (pending)" value={s.agencies.pending} />
                <Kpi label="Founding spots left" value={s.agencies.founding_left} sub="of 100 free" />
                <Kpi label="Pilgrims linked" value={s.pilgrims_linked} />
                <Kpi label="Agency contacts, 30 days" value={s.agency_contacts_30d} sub="WhatsApp / call taps" />
                <Kpi label="Agent link opens, 30 days" value={s.agent_link_clicks_30d} />
              </div>
            </section>

            <div className="r-section r-two">
              <section className="z-panel">
                <h2>Agencies by country</h2>
                <Bars rows={s.agency_countries.map((c) => ({ label: `${c.name} (${c.live} live)`, value: c.count }))} />
              </section>
              <section className="z-panel">
                <h2>Agency commissions</h2>
                {commissionLines.length ? (
                  <div className="r-bars">
                    {commissionLines.map(([cur, c]) => (
                      <p key={cur} className="r-note" style={{ margin: 0 }}>
                        <b>{cur}</b>: {fmt(c.count)} payments · {c.owed.toFixed(2)} owed · {c.paid.toFixed(2)} paid out
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="r-note">No commissions yet.</p>
                )}
              </section>
            </div>

            {/* ─── App usage ─────────────────────────────────────────── */}
            <section className="r-section">
              <h2>App usage</h2>
              <div className="r-kpis">
                <Kpi label="AI questions, 7 days" value={s.ai?.questions_7d} sub={`${fmt(s.ai?.people_7d)} people`} />
                <Kpi label="AI questions, 30 days" value={s.ai?.questions_30d} />
                <Kpi label="Settings backed up" value={s.settings_backups} sub="accounts with cloud backup" />
              </div>
            </section>

            <p className="r-note r-section">
              Downloads, uninstalls and crashes are only in App Store Connect and Google Play Console. &quot;Signed in&quot; counts logins,
              not every app open (people stay logged in), so the real number of active users is higher.
            </p>
          </>
        ) : null}
      </div>
    </main>
  )
}
