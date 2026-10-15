"use client"

import { HOW_FAQ_CSS } from "./agentStyles"

import { formatMoney, PLAN_PRICES } from "@/lib/agentPlans"
import { fill, useT } from "@/lib/i18n/I18nProvider"

function priceLine(plan: "listed" | "featured") {
  const p = PLAN_PRICES[plan]
  return `${formatMoney(p.USD, "USD")} (${formatMoney(p.NGN, "NGN")} · ${formatMoney(p.XOF, "XOF")})`
}

/** Pricing questions as an accordion. */
export default function AgentFaq({ compact = false }: { compact?: boolean }) {
  const { t } = useT()
  const values = { listed: priceLine("listed"), featured: priceLine("featured") }
  return (
    <section id="faq" className={compact ? "agent-faq agent-faq--compact" : "agent-section agent-faq"}>
      <style>{HOW_FAQ_CSS}</style>
      <div className={compact ? "" : "page-container"}>
        <h2>{t.agentHow.faqTitle}</h2>
        <div className="agent-faq-list">
          {t.agentHow.faq.map((item, index) => (
            <details key={item.q} open={index === 0 && !compact}>
              <summary>{item.q}</summary>
              <p>{fill(item.a, values)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
