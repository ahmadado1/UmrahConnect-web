"use client"

import { useEffect, useState } from "react"
import { VERIFICATION_DOC_FIELDS, verificationGaps } from "@/lib/agentAccount"
import VerifiedCheck from "../../VerifiedCheck"
import { AGENT_PLANS, AGENT_RENEW, currencyForCountry } from "@/lib/agentPlans"
import { agentHomeMode, formatDate } from "@/lib/agentFormat"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { useAgentSession } from "../../useAgentSession"
import PlanCard from "../../PlanCard"
import AgentHowItWorks from "../../AgentHowItWorks"
import { WIZARD_CSS } from "../../agentStyles"

type HomeStats = {
  pilgrim_count: number
  leads_this_month: number
}

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

function HowToPay() {
  const { t } = useT()
  const parts = t.home.payBody.split(/\{email\}|\{whatsapp\}/)
  return (
    <section className="agent-renew">
      <h2>{t.home.howToPay}</h2>
      <p>
        {parts[0]}
        <a href={`mailto:${AGENT_RENEW.email}`}>{AGENT_RENEW.email}</a>
        {parts[1]}
        <a href={AGENT_RENEW.whatsappUrl}>{AGENT_RENEW.whatsappDisplay}</a>
        {parts[2]}
      </p>
      <a className="agent-btn agent-btn--gold" href="/agents/billing">{t.pay.tab}</a>
    </section>
  )
}

function DocChecklist({ agent }: { agent: NonNullable<ReturnType<typeof useAgentSession>["agent"]> }) {
  const { t } = useT()
  const labels: Record<(typeof VERIFICATION_DOC_FIELDS)[number]["key"], string> = {
    doc_business_reg: t.docs.businessReg,
    doc_licence: t.docs.licence,
    doc_owner_id: t.docs.ownerId,
    doc_office_photo: t.docs.officePhoto,
  }
  return (
    <ul>
      {VERIFICATION_DOC_FIELDS.map((field) => (
        <li key={field.key}>
          {labels[field.key]}: {agent[field.key] ? t.common.uploaded : t.common.missing}
        </li>
      ))}
    </ul>
  )
}

export default function Home() {
  const { t } = useT()
  const { agent, isAdmin, loading, error } = useAgentSession()
  const [stats, setStats] = useState<HomeStats | null>(null)

  useEffect(() => {
    if (!agent || agentHomeMode(agent) !== "active") return
    let cancelled = false
    async function loadStats() {
      const supabase = getSupabase()
      const { data, error: rpcError } = await supabase.rpc("own_agent_home_stats")
      if (!rpcError && data) {
        const row = (Array.isArray(data) ? data[0] : data) as HomeStats | undefined
        if (!cancelled && row) {
          setStats({
            pilgrim_count: Number(row.pilgrim_count || 0),
            leads_this_month: Number(row.leads_this_month || 0),
          })
          return
        }
      }
      if (!agent) return
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const [leads, pilgrims] = await Promise.all([
        supabase.from("agent_leads").select("id", { count: "exact", head: true }).eq("agent_id", agent.id).gte("created_at", start.toISOString()),
        supabase.from("agent_pilgrims").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
      ])
      if (!cancelled) {
        setStats({
          leads_this_month: leads.count ?? 0,
          pilgrim_count: pilgrims.count ?? 0,
        })
      }
    }
    loadStats().catch(() => {
      if (!cancelled) setStats({ pilgrim_count: 0, leads_this_month: 0 })
    })
    return () => {
      cancelled = true
    }
  }, [agent])

  if (loading) {
    return <main className="agent-page"><p className="agent-status-line">{t.home.loading}</p></main>
  }

  if (!agent) {
    if (isAdmin) return <AdminHomeCard />
    return <main className="agent-page">{error ? <p className="agent-error">{error}</p> : null}</main>
  }

  const mode = agentHomeMode(agent)
  const docsComplete = verificationGaps(agent).length === 0

  return (
    <main className="agent-page">
      <style>{WIZARD_CSS}</style>
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <div className="section-label">{t.home.label}</div>
          <h1>
            {agent.business_name || t.common.yourAgency}
            {agent.verified ? <VerifiedCheck /> : null}
          </h1>
          {error ? <p className="agent-error">{error}</p> : null}

          {mode === "pending" && agent.info_request ? (
            <section className="agent-card agent-info-request">
              <h2>{t.home.infoTitle}</h2>
              <p>{t.home.infoBody}</p>
              <blockquote>{agent.info_request}</blockquote>
              <a className="agent-btn agent-btn--navy" href="/agents/settings">{t.home.infoBtn}</a>
            </section>
          ) : mode === "pending" && docsComplete ? (
            <section className="agent-card agent-processing">
              <h2>{t.home.processingTitle}</h2>
              <p>{t.home.processingBody}</p>
            </section>
          ) : mode === "pending" ? (
            <section className="agent-card">
              <h2>{t.home.completeTitle}</h2>
              <p>{t.home.completeBody}</p>
              <DocChecklist agent={agent} />
              <a className="agent-btn agent-btn--navy" href="/agents/signup">{t.home.completeBtn}</a>
            </section>
          ) : !docsComplete ? (
            <section className="agent-card">
              <h2>{t.home.faster}</h2>
              <DocChecklist agent={agent} />
              <a className="agent-btn agent-btn--navy" href="/agents/settings">{t.home.docsLink}</a>
            </section>
          ) : null}

          {mode === "suspended" ? (
            <>
              <p className="agent-note">{t.home.suspended}</p>
              <HowToPay />
            </>
          ) : null}

          {mode === "pay" ? (
            <>
              <p className="agent-lead">{t.home.payLead}</p>
              <div className="plan-cards">
                {AGENT_PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan.id} localCurrency={currencyForCountry(agent.country)} href="/agents/billing" />
                ))}
              </div>
              <HowToPay />
            </>
          ) : null}

          {mode === "active" ? (
            <>
              <div className="agent-summary">
                <div>
                  <span>{t.home.pilgrims}</span>
                  <strong>{stats ? stats.pilgrim_count : "…"}</strong>
                </div>
                <div>
                  <span>{t.home.contacts}</span>
                  <strong>{stats ? stats.leads_this_month : "…"}</strong>
                </div>
                <div>
                  <span>{t.home.plan}</span>
                  <strong>{agent.plan === "pro" || agent.plan === "featured" ? t.settings.featured : t.settings.listed}</strong>
                </div>
                <div>
                  <span>{t.home.paidUntil}</span>
                  <strong>{agent.paid_until ? formatDate(agent.paid_until) : t.settings.notSet}</strong>
                </div>
              </div>
              <div className="agent-actions">
                <a className="agent-btn agent-btn--gold" href="/agents/dashboard#qr">{t.home.shareQr}</a>
                <a className="agent-btn agent-btn--line" href="/agents/billing">{t.pay.tab}</a>
                <a className="agent-btn agent-btn--navy" href="/agents/dashboard#announcement">{t.home.postAnnouncement}</a>
              </div>
            </>
          ) : null}

          <AgentHowItWorks
            compact
            done={[
              true,
              docsComplete,
              Boolean(agent.verified),
              Boolean(agent.paid_until && agent.paid_until.slice(0, 10) >= new Date().toISOString().slice(0, 10)),
              mode === "active" && Boolean(stats && (stats.leads_this_month > 0 || stats.pilgrim_count > 0)),
              mode === "active",
            ]}
          />
        </div>
      </section>
    </main>
  )
}
