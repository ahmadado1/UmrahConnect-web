"use client"

import { HOW_FAQ_CSS } from "./agentStyles"

import { useT } from "@/lib/i18n/I18nProvider"

/** Questions for agencies (founding offer, documents, going live) as an accordion. */
export default function AgentFaq({ compact = false }: { compact?: boolean }) {
  const { t } = useT()
  return (
    <section id="faq" className={compact ? "agent-faq agent-faq--compact" : "agent-section agent-faq"}>
      <style>{HOW_FAQ_CSS}</style>
      <div className={compact ? "" : "page-container"}>
        <h2>{t.agentHow.faqTitle}</h2>
        <div className="agent-faq-list">
          {t.agentHow.faq.map((item, index) => (
            <details key={item.q} open={index === 0 && !compact}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
