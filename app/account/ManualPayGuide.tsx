"use client"

// Step-by-step instructions for an OPay / MyNita transfer, with a big warning to write
// the payment code in the transfer note BEFORE pressing Send. Used on My account (Premium)
// and in Agent Zone → Billing.
import { fill, useT } from "@/lib/i18n/I18nProvider"

export default function ManualPayGuide({ method, code }: { method: string; code: string }) {
  const { t } = useT()
  const p = t.pay
  return (
    <div className="mpg">
      <style>{`
        .mpg { display: grid; gap: 10px; }
        .mpg-warn { margin: 0; padding: 12px 14px; border-radius: 12px; background: #FFF4E5; border: 2px solid #E8A33C; color: #7A4A00; font-weight: 700; line-height: 1.45; }
        .mpg-warn code { font: inherit; font-size: 1.1em; background: #fff; padding: 1px 8px; border-radius: 6px; border: 1px dashed #C9A84C; color: #A07F2A; letter-spacing: 1px; white-space: nowrap; }
        .mpg h3 { margin: 4px 0 0; font-size: 15px; color: #1E3A5F; }
        .mpg ol { margin: 0; padding-inline-start: 22px; display: grid; gap: 6px; color: #1A2332; line-height: 1.45; }
        .mpg li.mpg-key { font-weight: 700; color: #7A4A00; }
      `}</style>
      <p className="mpg-warn" role="note">⚠️ {p.codeWarn.split("{code}").map((part, i) => (i === 0 ? part : <span key={i}><code>{code}</code>{part}</span>))}</p>
      <h3>{p.howTitle}</h3>
      <ol>
        <li>{fill(p.step1, { method })}</li>
        <li>{p.step2}</li>
        <li className="mpg-key">{fill(p.step3, { code })}</li>
        <li>{p.step4}</li>
        <li>{p.step5}</li>
      </ol>
    </div>
  )
}
