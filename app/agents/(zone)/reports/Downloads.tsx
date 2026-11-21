"use client"
// Reports → Downloads: type in the App Store and Google Play numbers (they are only in those
// consoles), and see them next to the number of accounts. Saved in public.app_downloads.
import { useCallback, useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseBrowser"

type Row = { id: string; recorded_on: string; apple: number; google: number; note: string | null }
const fmt = (n: number) => n.toLocaleString("en-US")
const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

export default function Downloads({ accounts }: { accounts: number }) {
  const [rows, setRows] = useState<Row[]>([])
  const [apple, setApple] = useState("")
  const [google, setGoogle] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [msg, setMsg] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("app_downloads")
      .select("id, recorded_on, apple, google, note")
      .order("recorded_on", { ascending: false })
      .limit(12)
    if (error) setMsg(error.message.includes("app_downloads") ? "Run supabase/app-downloads.sql in Supabase first." : error.message)
    else setRows((data ?? []) as Row[])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const a = Number(apple)
    const g = Number(google)
    if (!Number.isFinite(a) || !Number.isFinite(g) || a < 0 || g < 0 || (!apple && !google)) {
      setMsg("Type the two numbers first.")
      return
    }
    setSaving(true)
    setMsg("")
    const { error } = await getSupabase().from("app_downloads").insert({ recorded_on: date, apple: a, google: g })
    setSaving(false)
    if (error) setMsg(error.message)
    else {
      setApple("")
      setGoogle("")
      setMsg("Saved.")
      void load()
    }
  }

  const latest = rows[0]
  const total = latest ? latest.apple + latest.google : 0
  const rate = total ? Math.round((accounts / total) * 100) : 0
  const prev = rows[1]
  const growth = latest && prev ? total - (prev.apple + prev.google) : null

  return (
    <section className="r-section z-panel">
      <h2>Downloads</h2>
      {latest ? (
        <div className="r-kpis" style={{ marginBottom: 14 }}>
          <div className="z-kpi r-kpi z-kpi--navy">
            <span>Downloads (both stores)</span>
            <strong>{fmt(total)}</strong>
            <small>as of {day(latest.recorded_on)}{growth !== null ? ` · ${growth >= 0 ? "+" : ""}${fmt(growth)} since ${day(prev!.recorded_on)}` : ""}</small>
          </div>
          <div className="z-kpi r-kpi">
            <span>App Store</span>
            <strong>{fmt(latest.apple)}</strong>
          </div>
          <div className="z-kpi r-kpi">
            <span>Google Play</span>
            <strong>{fmt(latest.google)}</strong>
          </div>
          <div className="z-kpi r-kpi">
            <span>Turned into an account</span>
            <strong>{rate}%</strong>
            <small>{fmt(accounts)} accounts ÷ {fmt(total)} downloads</small>
          </div>
        </div>
      ) : (
        <p className="r-note">No download numbers yet. Add them below.</p>
      )}

      <form onSubmit={save} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className="r-note">
          Date<br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </label>
        <label className="r-note">
          App Store: Total downloads<br />
          <input inputMode="numeric" placeholder="e.g. 207" value={apple} onChange={(e) => setApple(e.target.value.replace(/\D/g, ""))} style={inputStyle} />
        </label>
        <label className="r-note">
          Google Play: Installed audience<br />
          <input inputMode="numeric" placeholder="e.g. 261" value={google} onChange={(e) => setGoogle(e.target.value.replace(/\D/g, ""))} style={inputStyle} />
        </label>
        <button className="z-btn z-btn--gold" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        {msg ? <span className="r-note">{msg}</span> : null}
      </form>

      {rows.length > 1 ? (
        <div className="r-bars" style={{ marginTop: 14 }}>
          {rows.map((r) => (
            <p key={r.id} className="r-note" style={{ margin: 0 }}>
              <b>{day(r.recorded_on)}</b>: {fmt(r.apple + r.google)} downloads (App Store {fmt(r.apple)} · Google Play {fmt(r.google)})
            </p>
          ))}
        </div>
      ) : null}
      <p className="r-note" style={{ marginBottom: 0 }}>
        Where to find them: App Store Connect → Analytics → Total Downloads. Google Play Console → Statistics → Installed audience.
      </p>
    </section>
  )
}

const inputStyle: React.CSSProperties = { padding: "8px 10px", borderRadius: 10, border: "1px solid #D6DEE8", fontSize: 15, minWidth: 130 }
