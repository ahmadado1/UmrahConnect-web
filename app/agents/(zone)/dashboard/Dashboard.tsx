"use client"

import { FormEvent, useEffect, useState } from "react"
import { isActiveAgent } from "@/lib/agentFormat"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { useAgentSession } from "../../useAgentSession"
import { formatDate } from "@/lib/agentFormat"
import { ZONE_CSS } from "../zoneUi"
import { QrPanel, RenewAlert, ZoneHead, ZoneSkeleton } from "../ZoneBits"

function AdminHomeCard() {
  const { t } = useT()
  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <section className="agent-card">
            <h2>{t.home.adminTitle}</h2>
            <a className="agent-btn agent-btn--navy" href="/agents/admin">{t.home.manage}</a>
          </section>
        </div>
      </section>
    </main>
  )
}

type Pilgrim = {
  pilgrim_id: string
  pilgrim_name: string | null
  pilgrim_nationality: string | null
  pilgrim_phone: string | null
  pilgrim_email: string | null
  created_at: string
}

type Announcement = {
  id: string
  title: string
  body: string
  created_at: string
}

export default function Dashboard() {
  const { t } = useT()
  const { agent, isAdmin, loading, error, setError } = useAgentSession()
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  useEffect(() => {
    if (!agent || !isActiveAgent(agent)) return
    let cancelled = false
    async function loadLists() {
      const supabase = getSupabase()
      const [pilgrimResult, announcementResult] = await Promise.all([
        supabase
          .from("agent_pilgrims_view")
          .select("pilgrim_id, pilgrim_name, pilgrim_nationality, pilgrim_phone, pilgrim_email, created_at")
          .eq("agent_id", agent!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_announcements")
          .select("id, title, body, created_at")
          .eq("agent_id", agent!.id)
          .order("created_at", { ascending: false }),
      ])
      if (cancelled) return
      if (pilgrimResult.error) setError(pilgrimResult.error.message)
      if (announcementResult.error) setError(announcementResult.error.message)
      setPilgrims((pilgrimResult.data ?? []) as Pilgrim[])
      setAnnouncements((announcementResult.data ?? []) as Announcement[])
    }
    loadLists()
    return () => {
      cancelled = true
    }
  }, [agent, setError])

  async function postAnnouncement(event: FormEvent) {
    event.preventDefault()
    if (!agent) return
    setPosting(true)
    setPosted(false)
    setError("")
    try {
      const supabase = getSupabase()
      const { data, error: insertError } = await supabase
        .from("agent_announcements")
        .insert({ agent_id: agent.id, title: title.trim(), body: body.trim() })
        .select("id, title, body, created_at")
        .single()
      if (insertError) throw new Error(insertError.message)
      setAnnouncements((current) => [data as Announcement, ...current])
      setTitle("")
      setBody("")
      setPosted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.dash.postError)
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return <ZoneSkeleton />
  }

  if (!agent) {
    if (isAdmin) return <AdminHomeCard />
    return <main className="agent-page">{error ? <p className="agent-error">{error}</p> : null}</main>
  }

  if (!isActiveAgent(agent)) {
    return (
      <main className="agent-page">
        <section className="agent-section">
          <div className="page-container agent-dashboard">
            <div className="section-label">{t.dash.label}</div>
            <h1>{t.dash.lockedTitle}</h1>
            <p className="agent-lead">{t.dash.lockedBody}</p>
            <a className="agent-btn agent-btn--navy" href="/agents/home">{t.dash.goHome}</a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="z-page">
      <style>{ZONE_CSS}</style>
      <div className="z-wrap">
        <ZoneHead agent={agent} />
        {error ? <p className="agent-error">{error}</p> : null}
        <RenewAlert agent={agent} />

        <div className="z-grid">
          {/* ─── Pilgrims who joined this agency ─── */}
          <div className="z-col">
            <section className="z-panel">
              <div className="z-panel-head">
                <h2>{t.zui.pilgrimsTitle}</h2>
                <span className="z-chip">{pilgrims.length}</span>
              </div>
              <p className="z-muted" style={{ marginBottom: 8 }}>{t.zui.pilgrimsLead}</p>
              {pilgrims.length === 0 ? (
                <div className="z-empty">{t.zui.noPilgrims}</div>
              ) : (
                <div className="z-list">
                  {pilgrims.map((pilgrim) => {
                    const name = pilgrim.pilgrim_name || t.dash.pilgrim
                    const contact = [pilgrim.pilgrim_phone, pilgrim.pilgrim_email].filter(Boolean).join(" · ")
                    return (
                      <div className="z-row" key={pilgrim.pilgrim_id}>
                        <div className="z-avatar">{name.trim().charAt(0).toUpperCase()}</div>
                        <div className="z-row-main">
                          <strong>{name}</strong>
                          <small>{[pilgrim.pilgrim_nationality, contact].filter(Boolean).join(" · ")}</small>
                        </div>
                        <div className="z-row-end">
                          <small style={{ fontWeight: 500, color: "#5C6B7A" }}>
                            {fill(t.zui.joined, { date: formatDate(pilgrim.created_at) })}
                          </small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ─── Updates to pilgrims + QR ─── */}
          <div className="z-col">
            <section className="z-panel" id="updates">
              <div className="z-panel-head"><h2>{t.zui.updatesTitle}</h2></div>
              <p className="z-muted" style={{ marginBottom: 10 }}>{t.zui.updatesLead}</p>
              {posted ? <p className="agent-note">{t.dash.posted}</p> : null}
              <form className="z-form" onSubmit={postAnnouncement}>
                <input placeholder={t.dash.title} value={title} onChange={(event) => setTitle(event.target.value)} required />
                <textarea placeholder={t.dash.message} value={body} onChange={(event) => setBody(event.target.value)} rows={4} required />
                <button className="z-btn z-btn--navy" type="submit" disabled={posting}>
                  {posting ? t.dash.posting : t.dash.post}
                </button>
              </form>
              {announcements.length === 0 ? (
                <div className="z-empty">{t.zui.noUpdates}</div>
              ) : (
                <div className="z-list">
                  {announcements.map((item) => (
                    <div className="z-row" key={item.id} style={{ alignItems: "flex-start" }}>
                      <div className="z-row-main">
                        <strong>{item.title}</strong>
                        <small style={{ whiteSpace: "normal" }}>{item.body}</small>
                        <small>{formatDate(item.created_at)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <QrPanel agent={agent} />
          </div>
        </div>
      </div>
    </main>
  )
}
