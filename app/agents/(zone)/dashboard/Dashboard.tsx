"use client"

import { FormEvent, useEffect, useState } from "react"
import { agentJoinUrl } from "@/lib/agentPlans"
import { citiesToText } from "@/lib/agentAccount"
import { isActiveAgent } from "@/lib/agentFormat"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { downloadAgentPoster, useAgentQr } from "../../poster"
import { useAgentSession } from "../../useAgentSession"
import VerifiedCheck from "../../VerifiedCheck"

function AdminHomeCard() {
  const { t } = useT()
  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <section className="agent-card">
            <h2>{t.home.adminTitle}</h2>
            <a className="agent-btn agent-btn--navy" href="/admin/agents">{t.home.manage}</a>
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
  const qrUrl = useAgentQr(agent?.agent_code ?? null)
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
    return <main className="agent-page"><p className="agent-status-line">{t.dash.loading}</p></main>
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

  const joinUrl = agent.agent_code ? agentJoinUrl(agent.agent_code) : ""

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <div className="section-label">{t.dash.label}</div>
          <h1>{agent.business_name || t.common.yourAgency}</h1>
          {error ? <p className="agent-error">{error}</p> : null}

          <section className="agent-card">
            <h2>{t.dash.pilgrims}</h2>
            <p className="agent-lead">{t.dash.pilgrimsLead}</p>
            {pilgrims.length === 0 ? <p className="agent-lead">{t.dash.noPilgrims}</p> : null}
            <div className="agent-people">
              {pilgrims.map((pilgrim) => (
                <article key={pilgrim.pilgrim_id} className="agent-person">
                  <strong>{pilgrim.pilgrim_name || t.dash.pilgrim}</strong>
                  {pilgrim.pilgrim_nationality ? <p>{pilgrim.pilgrim_nationality}</p> : null}
                  {pilgrim.pilgrim_phone ? <p>{pilgrim.pilgrim_phone}</p> : null}
                  {pilgrim.pilgrim_email ? <p>{pilgrim.pilgrim_email}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="agent-card" id="announcement">
            <h2>{t.dash.announcements}</h2>
            {posted ? <p className="agent-note">{t.dash.posted}</p> : null}
            <form className="agent-form" onSubmit={postAnnouncement}>
              <label>
                {t.dash.title}
                <input value={title} onChange={(event) => setTitle(event.target.value)} required />
              </label>
              <label>
                {t.dash.message}
                <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} required />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={posting}>
                {posting ? t.dash.posting : t.dash.post}
              </button>
            </form>
            <div className="agent-people">
              {announcements.map((item) => (
                <article key={item.id} className="agent-person">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          {agent.agent_code ? (
            <section className="agent-card" id="qr">
              <h2>{t.dash.qr}</h2>
              <p className="agent-lead">{joinUrl}</p>
              {qrUrl ? <img className="agent-qr" src={qrUrl} alt={fill(t.dash.qrAlt, { code: agent.agent_code })} /> : null}
              <button
                className="agent-btn agent-btn--gold"
                type="button"
                disabled={!qrUrl}
                onClick={() => downloadAgentPoster(agent.agent_code!, agent.business_name, qrUrl)}
              >
                {t.dash.downloadPoster}
              </button>
            </section>
          ) : null}

          <section className="agent-card">
            <h2>{t.dash.appear}</h2>
            <div className="agent-preview">
              {agent.logo_url ? <img className="agent-logo" src={agent.logo_url} alt="" /> : null}
              <h3>
                {agent.business_name || t.common.agency}
                {agent.verified ? <VerifiedCheck /> : null}
              </h3>
              {agent.owner_name ? <p>{agent.owner_name}</p> : null}
              <p>
                {agent.verified ? `${t.dash.verified} · ` : ""}
                {agent.plan === "pro" || agent.plan === "featured" ? t.settings.featured : t.settings.listed}
                {agent.country ? ` · ${agent.country}` : ""}
              </p>
              {agent.cities?.length ? <p>{citiesToText(agent.cities)}</p> : null}
              {agent.description ? <p>{agent.description}</p> : null}
              {agent.phone ? <p>{fill(t.dash.call, { phone: agent.phone })}</p> : null}
              {agent.whatsapp ? <p>{fill(t.dash.whatsapp, { phone: agent.whatsapp })}</p> : null}
              {agent.email ? <p>{fill(t.dash.email, { email: agent.email })}</p> : null}
              {agent.website ? <p>{fill(t.dash.website, { url: agent.website })}</p> : null}
              {agent.agent_code ? <p className="agent-code-display">{agent.agent_code}</p> : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
