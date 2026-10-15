"use client"

import { PLAN_CARD_CSS } from "@/app/agents/agentStyles"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { formatUsd, PREMIUM_PRICES, yearlySavingPercent, type PremiumPlanId } from "@/lib/premiumPlans"

/**
 * One Premium plan card, same look as the agency plan cards (Spotify style).
 * Yearly is the dark "Best value" card. Pass `href` (public pages) or `onSelect` (My account).
 */
export default function PremiumCard({
  plan,
  href,
  onSelect,
  selected = false,
}: {
  plan: PremiumPlanId
  href?: string
  onSelect?: () => void
  selected?: boolean
}) {
  const { t } = useT()
  const a = t.account
  const yearly = plan === "yearly"
  const name = yearly ? a.yearly : a.monthly
  const saving = yearlySavingPercent()
  const perMonth = formatUsd(PREMIUM_PRICES.yearly / 12)
  const label = selected ? `✓ ${t.agentsPage.selected}` : fill(t.agentsPage.choose, { plan: `Premium ${name}` })

  // Everything Premium adds, then the "how it works" lines.
  const features = [a.featAdhan, a.featFonts, a.featGuided, a.featAi, a.featTrip, a.freeEverything]

  return (
    <article className={`plan-card${yearly ? " plan-card--featured" : ""}${selected ? " plan-card--selected" : ""}`}>
      <style>{PLAN_CARD_CSS}</style>
      {yearly ? <span className="plan-card-tab">{a.bestValue}{saving > 0 ? ` · ${fill(a.save, { pct: saving })}` : ""}</span> : null}
      <p className="plan-card-brand">UmrahConnect Premium</p>
      <h3 className="plan-card-name">{name}</h3>
      <p className="plan-card-for">{yearly ? a.yearlyFor : a.monthlyFor}</p>
      <p className="plan-card-price">
        {formatUsd(PREMIUM_PRICES[plan])} <span>{yearly ? a.perYear : a.perMonth}</span>
      </p>
      <p className="plan-card-local">{yearly ? fill(a.yearlyPerMonth, { price: perMonth }) : a.monthlyNote}</p>
      <hr />
      <ul className="plan-card-list">
        {features.map((feature) => (
          <li key={feature}>
            <span className="plan-card-tick" aria-hidden="true">✓</span>
            <span>{feature}</span>
          </li>
        ))}
        <li>
          <span className="plan-card-tick" aria-hidden="true">✓</span>
          <span>{t.agentsPage.cancelAnytime}</span>
        </li>
      </ul>
      {href ? (
        <a className="plan-card-cta" href={href}>{label}</a>
      ) : onSelect ? (
        <button className="plan-card-cta" type="button" aria-pressed={selected} onClick={onSelect}>{label}</button>
      ) : null}
      <p className="plan-card-fine">{a.finePrint}</p>
    </article>
  )
}
