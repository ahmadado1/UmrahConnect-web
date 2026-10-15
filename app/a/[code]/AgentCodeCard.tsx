"use client"

import { useEffect, useState } from "react"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import VerifiedCheck from "@/app/agents/VerifiedCheck"

type PublicAgent = {
  business_name: string | null
  country: string | null
  cities: string[] | null
  description: string | null
  agent_code: string | null
  plan: string | null
  verified: boolean | null
}

export default function AgentCodeCard({ code }: { code: string }) {
  const { t } = useT()
  const [agent, setAgent] = useState<PublicAgent | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("active_agents")
        .select("business_name, country, cities, description, agent_code, plan, verified")
        .eq("agent_code", code)
        .limit(1)
      if (cancelled) return
      if (error || !data?.[0]) {
        setMissing(true)
        return
      }
      setAgent(data[0] as PublicAgent)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.code.label}</div>
          {agent ? (
            <>
              <h1>
                {agent.business_name || t.code.fallback}
                {agent.verified ? <VerifiedCheck /> : null}
              </h1>
              <p className="agent-code-display">{agent.agent_code}</p>
              <p className="agent-lead">
                {[agent.country, ...(agent.cities ?? [])].filter(Boolean).join(" · ")}
              </p>
              {agent.description ? <p>{agent.description}</p> : null}
              <p className="agent-lead">{t.code.join}</p>
            </>
          ) : missing ? (
            <>
              <h1>{fill(t.code.missingTitle, { code })}</h1>
              <p className="agent-lead">{t.code.missing}</p>
            </>
          ) : (
            <p className="agent-status-line">{t.common.loading}</p>
          )}
          {agent ? (
            <a className="agent-btn agent-btn--gold" href={`umrahconnect://a/${encodeURIComponent(agent.agent_code || code)}`} style={{ marginInlineEnd: 10 }}>
              {t.code.openApp}
            </a>
          ) : null}
          <a className="agent-btn agent-btn--navy" href="/#download">{t.code.download}</a>
        </div>
      </section>
    </main>
  )
}
