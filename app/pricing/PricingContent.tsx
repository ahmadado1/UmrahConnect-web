"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AGENT_PLANS } from "@/lib/agentPlans"
import { useT } from "@/lib/i18n/I18nProvider"
import PlanCard from "../agents/PlanCard"
import PremiumCard from "../account/PremiumCard"
import AgentFaq from "../agents/AgentFaq"

type Tab = "pilgrims" | "agencies"

const CSS = `
.pricing-tabs { display: inline-flex; gap: 4px; padding: 4px; margin-top: 22px; border-radius: 999px; background: rgba(255, 255, 255, 0.12); }
.pricing-tabs button { border: 0; border-radius: 999px; padding: 10px 22px; font: inherit; font-weight: 700; cursor: pointer; background: transparent; color: #fff; }
.pricing-tabs button[aria-selected="true"] { background: #c9a84c; color: #1e3a5f; }
.pricing-free { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 24px 0; }
.pricing-free .agent-card h2 { color: #1e3a5f; margin-top: 0; }
.pricing-price { font-size: 32px; font-weight: 800; color: #1e3a5f; margin: 0; }
.pricing-price small { font-size: 15px; opacity: 0.7; }
.pricing-alt { margin: 2px 0 14px; color: #5c6b7a; }
.pricing-list { list-style: none; padding: 0; margin: 0 0 18px; display: grid; gap: 8px; }
.pricing-list li::before { content: "✓ "; color: #a07f2a; font-weight: 800; }
.pricing-premium { border: 2px solid #c9a84c; }
.pricing-soon { display: inline-block; margin-inline-start: 8px; padding: 2px 10px; border-radius: 999px; background: #f3ead2; color: #8a6d1f; font-size: 12px; font-weight: 700; vertical-align: middle; }
`

export default function PricingContent() {
  const { t } = useT()
  const [tab, setTab] = useState<Tab>("pilgrims")

  // /pricing#agencies opens the agencies tab directly
  useEffect(() => {
    if (window.location.hash !== "#agencies") return
    const timer = window.setTimeout(() => setTab("agencies"), 0)
    return () => window.clearTimeout(timer)
  }, [])

  function choose(next: Tab) {
    setTab(next)
    window.history.replaceState(null, "", next === "agencies" ? "#agencies" : "#pilgrims")
  }

  return (
    <main className="agent-page">
      <style>{CSS}</style>
      <section className="agent-hero">
        <div className="page-container">
          <h1>{t.pricing.title}</h1>
          <p className="agent-lead">{t.pricing.lead}</p>
          <div className="pricing-tabs" role="tablist">
            <button role="tab" aria-selected={tab === "pilgrims"} onClick={() => choose("pilgrims")}>{t.pricing.tabPilgrims}</button>
            <button role="tab" aria-selected={tab === "agencies"} onClick={() => choose("agencies")}>{t.pricing.tabAgencies}</button>
          </div>
        </div>
      </section>

      <section className="agent-section">
        <div className="page-container">
          {tab === "pilgrims" ? (
            <>
              {/* Free + the two Premium cards, side by side */}
              <div className="plan-cards">
                <article className="plan-card">
                  <p className="plan-card-brand">UmrahConnect</p>
                  <h3 className="plan-card-name">{t.account.freePlan}</h3>
                  <p className="plan-card-for">{t.account.freeBody}</p>
                  <p className="plan-card-price">$0</p>
                  <p className="plan-card-local">{t.account.freeFeatures}</p>
                  <hr />
                  <ul className="plan-card-list">
                    {[t.account.freePrayer, t.account.freeQuran, t.account.freeGuide, t.account.freeDuas, t.account.freeServices].map((item) => (
                      <li key={item}>
                        <span className="plan-card-tick" aria-hidden="true">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link className="plan-card-cta" href="/#download">{t.pricing.getApp}</Link>
                </article>
                <PremiumCard plan="monthly" href="/account" />
                <PremiumCard plan="yearly" href="/account" />
              </div>
            </>
          ) : (
            <>
              <div className="plan-cards">
                {AGENT_PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan.id} href="/agents/signup" />
                ))}
              </div>
              <a className="agent-btn agent-btn--navy" href="/agents/signup">{t.pricing.agencyCta}</a>
              <AgentFaq />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
