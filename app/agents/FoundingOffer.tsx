"use client"

import { PLAN_CARD_CSS } from "./agentStyles"

import { useT } from "@/lib/i18n/I18nProvider"

/**
 * Launch offer: agencies join free (first 100). Replaces the paid Listed / Featured plan cards
 * on the public pages and in Agent Zone. Verified agencies go live without paying.
 */
export default function FoundingOffer({ href = "/agents/signup", showCta = true }: { href?: string; showCta?: boolean }) {
  const { t } = useT()
  const f = t.founding
  const a = t.agentsPage
  const features = [a.listed1, a.listed2, a.listed3, a.listed4, a.listed5]

  return (
    <article className="plan-card plan-card--featured" style={{ maxWidth: 460, marginInline: "auto" }}>
      <style>{PLAN_CARD_CSS}</style>
      <span className="plan-card-tab">{f.spots}</span>
      <p className="plan-card-brand">{f.label}</p>
      <h3 className="plan-card-name">{f.title}</h3>
      <p className="plan-card-for">{f.lead}</p>
      <p className="plan-card-price">{f.price}</p>
      <p className="plan-card-local">{f.priceNote}</p>
      <hr />
      <ul className="plan-card-list">
        {features.map((feature) => (
          <li key={feature}>
            <span className="plan-card-tick" aria-hidden="true">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {showCta ? <a className="plan-card-cta" href={href}>{f.cta}</a> : null}
    </article>
  )
}
