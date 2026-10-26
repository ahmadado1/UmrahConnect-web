"use client"

// "Which option should I use?" box shown above the payment choices.
// Each row matches a card or payment method to the button that works for it,
// and tapping a row picks that method for the user.
import { useT } from "@/lib/i18n/I18nProvider"

type Method = "paystack" | "paypal"

type Props = {
  paystack: boolean
  paypal: boolean
  onPick: (method: Method) => void
}

export default function PayGuide({ paystack, paypal, onPick }: Props) {
  const { t } = useT()
  const g = t.payGuide

  // Only show rows whose payment method is switched on.
  const rows: { icon: string; who: string; use: string; method: Method }[] = []
  if (paystack) rows.push({ icon: "🇳🇬", who: g.ngWho, use: g.ngUse, method: "paystack" })
  if (paystack) rows.push({ icon: "💳", who: g.mcWho, use: paypal ? g.mcUseBoth : g.mcUse, method: "paystack" })
  if (paypal) rows.push({ icon: "🌍", who: g.visaWho, use: g.visaUse, method: "paypal" })
  if (paypal) rows.push({ icon: "🅿️", who: g.ppWho, use: g.ppUse, method: "paypal" })
  if (rows.length < 2) return null

  return (
    <div className="pay-guide">
      <p className="pay-guide-title">{g.title}</p>
      <ul>
        {rows.map((row) => (
          <li key={row.who}>
            <button type="button" onClick={() => onPick(row.method)}>
              <span className="pay-guide-icon" aria-hidden="true">{row.icon}</span>
              <span className="pay-guide-who">{row.who}</span>
              <span className="pay-guide-use">{row.use} →</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="pay-guide-foot">{g.foot}</p>
    </div>
  )
}
