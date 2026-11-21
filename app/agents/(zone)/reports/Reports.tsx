"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseBrowser"
import { ZONE_CSS } from "../zoneUi"
import Downloads from "./Downloads"

/** Shape of public.admin_stats() (see supabase/admin-stats.sql). Missing parts are optional. */
type Stats = {
  generated_at: string
  users: { total: number; new_today: number; new_7d: number; new_30d: number; signed_in_7d: number; signed_in_30d: number; agents: number; pilgrims: number; admins?: number; unfinished?: number }
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
.r-donut { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.r-legend { display: grid; gap: 8px; flex: 1; min-width: 220px; }
.r-legend div { display: grid; grid-template-columns: 12px 1fr auto 44px; gap: 10px; align-items: center; font-size: 14px; color: #1A2332; }
.r-legend i { width: 12px; height: 12px; border-radius: 3px; display: block; }
.r-legend b { color: #1E3A5F; }
.r-legend em { font-style: normal; color: #5C6B7A; text-align: right; font-size: 13px; }
.r-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 14px; }
.r-days div { background: #F5F7FA; border-radius: 10px; padding: 8px 4px; text-align: center; }
.r-days span { display: block; font-size: 11px; color: #5C6B7A; }
.r-days b { font-size: 16px; color: #1E3A5F; }
@media (max-width: 560px) { .r-bar { grid-template-columns: 90px 1fr 40px; } .r-days { grid-template-columns: repeat(4, 1fr); } }
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

const PIE_COLORS = ["#1E3A5F", "#C9A84C", "#2F855A", "#B83280", "#2B6CB0", "#9AA9BA", "#C05621", "#4A5568"]
const pieRows = (rows: { label: string; value: number }[]) =>
  rows.sort((a, b) => b.value - a.value).map((r, i) => ({ ...r, color: PIE_COLORS[i % PIE_COLORS.length] }))

/** Pie (donut) chart with a legend that shows each number and its share. */
function Donut({ rows, total }: { rows: { label: string; value: number; color: string }[]; total?: number }) {
  const sum = Math.max(1, rows.reduce((t, r) => t + r.value, 0))
  const R = 54
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="r-donut">
      <svg viewBox="0 0 140 140" width="150" height="150" role="img">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#EEF2F7" strokeWidth="22" />
        {rows.map((r) => {
          const len = (r.value / sum) * C
          const el = (
            <circle
              key={r.label}
              cx="70" cy="70" r={R} fill="none" stroke={r.color} strokeWidth="22"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          )
          offset += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1E3A5F">{fmt(total ?? sum)}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="10" fill="#5C6B7A">total</text>
      </svg>
      <div className="r-legend">
        {rows.map((r) => (
          <div key={r.label}>
            <i style={{ background: r.color }} />
            <span>{r.label}</span>
            <b>{fmt(r.value)}</b>
            <em>{Math.round((r.value / sum) * 100)}%</em>
          </div>
        ))}
      </div>
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

  // "Finish setting up your account" email to people who never chose Pilgrim / Travel agent
  const [nudging, setNudging] = useState(false)
  const [nudgeMsg, setNudgeMsg] = useState("")
  const emailUnfinished = async () => {
    setNudging(true)
    setNudgeMsg("")
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) throw new Error("Log in again.")
      const res = await fetch("/api/admin/users/finish-setup", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error || "Could not send.")
      setNudgeMsg(body?.message || "Done.")
    } catch (err) {
      setNudgeMsg(err instanceof Error ? err.message : "Could not send.")
    } finally {
      setNudging(false)
    }
  }

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
            {/* ─── 1. The main facts ─────────────────────────────────── */}
            <section className="r-section">
              <h2>At a glance</h2>
              <div className="r-kpis">
                <Kpi navy label="Total accounts" value={s.users.total} sub={`+${fmt(s.users.new_today)} today`} />
                <Kpi label="Pilgrims" value={s.users.pilgrims} />
                <Kpi label="Agency accounts" value={s.users.agents} />
                <Kpi label="Agencies live in the app" value={s.agencies.live} />
                {s.premium ? <Kpi label="Premium now" value={s.premium.active} /> : null}
              </div>
            </section>

            {/* ─── Downloads (typed in from the stores) ─── */}
            <Downloads accounts={s.users.total} />

            {/* ─── 2. Who our users are (pie + numbers that add up) ─── */}
            <section className="r-section z-panel">
              <h2>Who our users are</h2>
              <Donut
                rows={[
                  { label: "Pilgrims", value: s.users.pilgrims, color: "#1E3A5F" },
                  { label: "Agency accounts", value: s.users.agents, color: "#C9A84C" },
                  { label: "Didn't finish sign-up", value: (s.users.unfinished ?? Math.max(0, s.users.total - s.users.pilgrims - s.users.agents - (s.users.admins ?? s.admins))), color: "#9AA9BA" },
                  { label: "Admins (our team)", value: s.users.admins ?? s.admins, color: "#2F855A" },
                ]}
                total={s.users.total}
              />
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "8px 0" }}>
                <button className="z-btn z-btn--gold" type="button" onClick={emailUnfinished} disabled={nudging}>
                  {nudging ? "Sending…" : "Email people who didn't finish sign-up"}
                </button>
                {nudgeMsg ? <span className="r-note">{nudgeMsg}</span> : null}
              </div>
              <p className="r-note" style={{ marginBottom: 0 }}>
                {fmt(s.users.pilgrims)} pilgrims + {fmt(s.users.agents)} agencies + {fmt((s.users.unfinished ?? Math.max(0, s.users.total - s.users.pilgrims - s.users.agents - (s.users.admins ?? s.admins))))} unfinished + {fmt(s.users.admins ?? s.admins)} admins ={" "}
                <b>{fmt(s.users.total)} accounts</b>. &quot;Didn&apos;t finish sign-up&quot; = made an account but closed the app before choosing Pilgrim or Travel agent.
              </p>
            </section>

            {/* ─── 3. Growth ─────────────────────────────────────────── */}
            <section className="r-section">
              <h2>New accounts</h2>
              <div className="r-kpis">
                <Kpi label="Today" value={s.users.new_today} />
                <Kpi label="Last 7 days" value={s.users.new_7d} />
                <Kpi label="Last 30 days" value={s.users.new_30d} />
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
              <div className="r-days">
                {daily.slice(-7).map((d) => (
                  <div key={d.day}>
                    <span>{new Date(d.day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}</span>
                    <b>{fmt(d.count)}</b>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── 4. Activity ───────────────────────────────────────── */}
            <section className="r-section">
              <h2>Active people</h2>
              <div className="r-kpis">
                <Kpi label="Signed in, last 7 days" value={s.users.signed_in_7d} sub="new and returning users" />
                <Kpi label="Signed in, last 30 days" value={s.users.signed_in_30d} />
              </div>
            </section>

            {/* ─── 5. Details ────────────────────────────────────────── */}
            <div className="r-section r-two">
              <section className="z-panel">
                <h2>App language</h2>
                <Donut rows={pieRows(Object.entries(s.languages).map(([k, v]) => ({ label: LANG_NAMES[k] || k, value: v })))} />
              </section>
              <section className="z-panel">
                <h2>Sign-in method</h2>
                <Donut rows={pieRows(Object.entries(s.providers).map(([k, v]) => ({ label: PROVIDER_NAMES[k] || k, value: v })))} />
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
