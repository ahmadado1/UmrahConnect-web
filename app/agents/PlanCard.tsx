"use client"

import { PLAN_CARD_CSS } from "./agentStyles"

import { formatMoney, priceFor, type Currency, type PlanId } from "@/lib/agentPlans"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { planCopy } from "./planCopy"

/**
 * One plan, with everything it includes.
 * Pass `href` for a link button (public pages) or `onSelect` for a choose button (Pay / Renew).
 */
export default function PlanCard({
  plan,
  localCurrency,
  href,
  onSelect,
  selected = false,
}: {
  plan: PlanId
  localCurrency?: Currency
  href?: string
  onSelect?: () => void
  selected?: boolean
}) {
  const { t } = useT()
  const copy = planCopy(t)[plan]
  const featured = plan === "featured"
  const usd = formatMoney(priceFor(plan, "USD"), "USD")
  const local = localCurrency && localCurrency !== "USD"
    ? formatMoney(priceFor(plan, localCurrency), localCurrency)
    : `${formatMoney(priceFor(plan, "NGN"), "NGN")} · ${formatMoney(priceFor(plan, "XOF"), "XOF")}`
  const label = selected ? `✓ ${t.agentsPage.selected}` : fill(t.agentsPage.choose, { plan: copy.name })

  return (
    <article className={`plan-card${featured ? " plan-card--featured" : ""}${selected ? " plan-card--selected" : ""}`}>
      <style>{PLAN_CARD_CSS}</style>
      {featured ? <span className="plan-card-tab">{t.agentsPage.popular}</span> : null}
      <p className="plan-card-brand">UmrahConnect</p>
      <h3 className="plan-card-name">{copy.name}</h3>
      <p className="plan-card-for">{copy.forWho}</p>
      <p className="plan-card-price">
        {usd} <span>{t.agentsPage.perMonth}</span>
      </p>
      <p className="plan-card-local">{local}</p>
      <hr />
      <ul className="plan-card-list">
        {copy.features.map((feature) => (
          <li key={feature.text}>
            <span className="plan-card-tick" aria-hidden="true">✓</span>
            <span>
              {feature.text}
              {feature.soon ? <span className="agent-soon">{t.agentsPage.soon}</span> : null}
            </span>
          </li>
        ))}
        <li>
          <span className="plan-card-tick" aria-hidden="true">✓</span>
          <span>{t.agentsPage.cancelAnytime}</span>
        </li>
        <li>
          <span className="plan-card-tick" aria-hidden="true">✓</span>
          <span>{t.agentsPage.payWays}</span>
        </li>
      </ul>
      {href ? (
        <a className="plan-card-cta" href={href}>{label}</a>
      ) : onSelect ? (
        <button className="plan-card-cta" type="button" aria-pressed={selected} onClick={onSelect}>{label}</button>
      ) : null}
      <p className="plan-card-fine">{t.agentsPage.finePrint}</p>
    </article>
  )
}
