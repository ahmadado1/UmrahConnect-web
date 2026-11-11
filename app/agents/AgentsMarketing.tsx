"use client"

import { useT } from "@/lib/i18n/I18nProvider"
import AgentFaq from "./AgentFaq"
import FoundingOffer from "./FoundingOffer"
import AgentHowItWorks from "./AgentHowItWorks"

export default function AgentsMarketing() {
  const { t } = useT()
  const b = t.benefits
  const benefits = [
    { icon: "📣", title: b.exposureTitle, body: b.exposureBody, soon: false },
    { icon: "⭐", title: b.reviewsTitle, body: b.reviewsBody, soon: true },
    { icon: "🕋", title: b.toolsTitle, body: b.toolsBody, soon: true },
  ]

  return (
    <main className="agent-page">
      <section className="agent-hero">
        <div className="agent-hero-inner">
          <div className="section-label">{t.agentsPage.label}</div>
          <h1>{t.agentsPage.title}</h1>
          <p>{t.agentsPage.lead}</p>
          {/* Launch offer badge */}
          <p style={{ display: "inline-block", margin: "4px 0 14px", padding: "6px 14px", borderRadius: 999, background: "#c9a84c", color: "#1e3a5f", fontWeight: 700, fontSize: 15 }}>
            🎁 {t.founding.title} · {t.founding.priceNote}
          </p>
          <div className="agent-hero-actions">
            <a className="agent-btn agent-btn--gold" href="/agents/signup">{t.agentsPage.become}</a>
            <a className="agent-btn agent-btn--ghost" href="/agents/login">{t.agentsPage.login}</a>
          </div>
          <nav className="agent-subnav" aria-label={t.agentHow.title}>
            <a href="#how">{t.agentHow.howLink}</a>
            <a href="#pricing">{t.agentHow.pricingLink}</a>
            <a href="#faq">{t.agentHow.faqLink}</a>
          </nav>
        </div>
      </section>

      <section className="agent-section">
        <div className="page-container">
          <h2>{t.agentsPage.why}</h2>
          <div className="agent-reasons">
            <article>
              <h3>{t.agentsPage.codeTitle}</h3>
              <p>{t.agentsPage.codeBody}</p>
            </article>
            <article>
              <h3>{t.agentsPage.posterTitle}</h3>
              <p>{t.agentsPage.posterBody}</p>
            </article>
            <article>
              <h3>{t.agentsPage.sameTitle}</h3>
              <p>{t.agentsPage.sameBody}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="agent-section">
        <div className="page-container">
          <h2>{b.title}</h2>
          <p className="agent-lead">{b.lead}</p>
          <div className="agent-reasons">
            {benefits.map((item) => (
              <article key={item.title}>
                <h3>
                  <span aria-hidden="true">{item.icon}</span> {item.title}
                  {item.soon ? <span className="agent-soon">{t.agentsPage.soon}</span> : null}
                </h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="agent-loop">
            <h3>{b.loopTitle}</h3>
            <p>{b.loop}</p>
            <p className="agent-loop-note">{b.whatsapp}</p>
          </div>
        </div>
      </section>

      <AgentHowItWorks />

      <section id="pricing" className="agent-section agent-section--plans">
        <div className="page-container">
          {/* Launch offer: the first 100 agencies join free */}
          <h2>{t.founding.title}</h2>
          <p className="agent-lead">{t.founding.lead}</p>
          <FoundingOffer />
          <div className="agent-hero-actions">
            <a className="agent-btn agent-btn--line" href="/agents/login">{t.agentsPage.login}</a>
          </div>
        </div>
      </section>

      <AgentFaq />
    </main>
  )
}
