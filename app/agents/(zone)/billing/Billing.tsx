"use client"

import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import { formatDate } from "@/lib/agentFormat"
import {
  AGENT_RENEW,
  currencyForCountry,
  formatMoney,
  MANUAL_METHODS,
  agentPayCode,
  manualMethodsFor,
  MONTH_OPTIONS,
  PAYPAL_PLAN_IDS,
  priceFor,
  type Currency,
  type ManualMethod,
  type PlanId,
} from "@/lib/agentPlans"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import ManualPayGuide from "@/app/account/ManualPayGuide"
import { getSupabase } from "@/lib/supabaseBrowser"
import { useAgentSession } from "../../useAgentSession"
import PaypalSubscribeButton from "./PaypalSubscribeButton"
import AgentFaq from "../../AgentFaq"
import PlanCard from "../../PlanCard"

type BillingInfo = {
  agent: {
    id: string
    country: string | null
    status: string | null
    plan: PlanId
    verified: boolean
    paid_until: string | null
    paypal_subscription_id: string | null
    paypal_status: string | null
  }
  payments: {
    id: string
    plan: PlanId
    months: number
    amount: number
    currency: Currency
    method: string
    reference: string | null
    status: "pending" | "confirmed" | "rejected"
    admin_note: string | null
    created_at: string
  }[]
}

const RECEIPT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

/** Paystack (card, transfer, USSD in Naira) is shown when NEXT_PUBLIC_PAYSTACK_LIVE=true in Vercel. */
const PAYSTACK_ON = process.env.NEXT_PUBLIC_PAYSTACK_LIVE === "true"

async function authHeaders() {
  const { data: { session } } = await getSupabase().auth.getSession()
  if (!session) throw new Error("Log in again.")
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
}

export default function Billing() {
  const { t } = useT()
  const { agent, isAdmin, loading: sessionLoading } = useAgentSession()
  const [info, setInfo] = useState<BillingInfo | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const [plan, setPlan] = useState<PlanId>("listed")
  const [method, setMethod] = useState<"paypal" | "paystack" | ManualMethod>("paypal")
  const [months, setMonths] = useState<number>(1)
  const [reference, setReference] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [copied, setCopied] = useState("")
  const [paypalBroken, setPaypalBroken] = useState(false)
  // Paystack auto-renew: is it on, and which plans can auto-renew.
  const [paystackSub, setPaystackSub] = useState<{ active: { plan: string; nextPayment: string | null } | null; autoRenewPlans: string[] }>({ active: null, autoRenewPlans: [] })

  const [reloadKey, setReloadKey] = useState(0)
  const initialized = useRef(false)
  const load = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!agent) return
    let cancelled = false
    async function fetchBilling() {
      try {
        const response = await fetch("/api/agents/billing", { headers: await authHeaders(), cache: "no-store" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error || "Could not load payments.")
        if (cancelled) return
        const data = payload as BillingInfo
        setInfo(data)
        if (PAYSTACK_ON) {
          const sub = await fetch("/api/paystack/subscription?kind=agent", { headers: await authHeaders(), cache: "no-store" })
          if (sub.ok && !cancelled) setPaystackSub(await sub.json())
        }
        if (!initialized.current) {
          initialized.current = true
          setPlan(data.agent.plan)
          const manual = manualMethodsFor(data.agent.country)
          if (PAYSTACK_ON && currencyForCountry(data.agent.country) === "NGN") setMethod("paystack")
          else if (currencyForCountry(data.agent.country) !== "USD" && manual.length) setMethod(manual[0])
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load payments.")
      }
    }
    fetchBilling()
    return () => {
      cancelled = true
    }
  }, [agent, reloadKey])

  // Back from Paystack (?paystack=<reference>): confirm the payment and refresh.
  const paystackChecked = useRef(false)
  useEffect(() => {
    if (!agent || paystackChecked.current) return
    const reference = new URLSearchParams(window.location.search).get("paystack")
    if (!reference) return
    paystackChecked.current = true
    window.history.replaceState(null, "", window.location.pathname)
    ;(async () => {
      setNotice(t.pay.paystackChecking)
      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: await authHeaders(),
          body: JSON.stringify({ reference }),
        })
        const result = await response.json().catch(() => null)
        if (response.ok && result?.ok) {
          setNotice(fill(t.pay.paystackDone, { date: result.until ? formatDate(String(result.until).slice(0, 10)) : "" }))
          load()
        } else {
          setNotice(t.pay.paystackPending)
        }
      } catch {
        setNotice(t.pay.paystackPending)
      }
    })()
  }, [agent, load, t.pay.paystackChecking, t.pay.paystackDone, t.pay.paystackPending])

  async function payWithPaystack(autoRenew: boolean) {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ kind: "agent", plan, months, autoRenew }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.url) throw new Error(payload?.error || "Could not start the payment.")
      window.location.href = payload.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the payment.")
      setBusy(false)
    }
  }

  async function stopPaystackRenew() {
    if (!window.confirm(t.pay.paystackCancelConfirm)) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/paystack/subscription", { method: "POST", headers: await authHeaders(), body: JSON.stringify({ kind: "agent" }) })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not stop the auto-renew.")
      setNotice(t.pay.paystackStopped)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not stop the auto-renew.")
    } finally {
      setBusy(false)
    }
  }

  async function onApproved(subscriptionId: string) {
    setBusy(true)
    setError("")
    setNotice(t.pay.processing)
    try {
      const response = await fetch("/api/agents/paypal/activate", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ subscriptionId }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not confirm the subscription.")
      setNotice(payload?.credited > 0 ? t.pay.paidThanks : t.pay.paypalPending)
      load()
    } catch (err) {
      setNotice("")
      setError(err instanceof Error ? err.message : "Could not confirm the subscription.")
    } finally {
      setBusy(false)
    }
  }

  async function cancelPaypal() {
    if (!window.confirm(t.pay.cancelConfirm)) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/agents/paypal/cancel", { method: "POST", headers: await authHeaders() })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not cancel.")
      setNotice(t.pay.cancelled)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel.")
    } finally {
      setBusy(false)
    }
  }

  async function submitManual(event: FormEvent) {
    event.preventDefault()
    if (method === "paypal" || method === "paystack") return
    setError("")
    setNotice("")
    if (!receipt) {
      setError(t.pay.needReceipt)
      return
    }
    const ext = receipt.name.split(".").pop()?.toLowerCase() || ""
    const contentType = RECEIPT_TYPES[ext]
    if (!contentType) {
      setError("Upload a PDF, JPEG, PNG, or WebP file.")
      return
    }
    if (receipt.size > 5 * 1024 * 1024) {
      setError("The receipt must be 5 MB or smaller.")
      return
    }
    setBusy(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Log in again.")
      const path = `${session.user.id}/payments/${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`
      const { error: uploadError } = await supabase.storage.from("agent-docs").upload(path, receipt, { upsert: false, contentType })
      if (uploadError) throw new Error(uploadError.message)
      const response = await fetch("/api/agents/payments", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ plan, months, method, reference, receiptPath: path }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not save the payment.")
      setNotice(t.pay.submitted)
      setReference("")
      setReceipt(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the payment.")
    } finally {
      setBusy(false)
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      window.setTimeout(() => setCopied(""), 2000)
    } catch {
      // clipboard blocked; the number is still visible
    }
  }

  if (sessionLoading || (agent && !info && !error)) {
    return <main className="agent-page"><p className="agent-status-line">{t.pay.loading}</p></main>
  }

  if (!agent) {
    return (
      <main className="agent-page">
        <section className="agent-section">
          <div className="page-container agent-dashboard">
            {isAdmin ? (
              <section className="agent-card">
                <h2>{t.home.adminTitle}</h2>
                <a className="agent-btn agent-btn--navy" href="/admin/agents#payments">{t.home.manage}</a>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    )
  }

  const local = currencyForCountry(info?.agent.country ?? agent.country)
  const manual = manualMethodsFor(info?.agent.country ?? agent.country)
  const planNames: Record<PlanId, string> = { listed: t.settings.listed, featured: t.settings.featured }
  const subscriptionActive = info?.agent.paypal_status === "ACTIVE"
  const awaitingVerification = !info?.agent.verified || (info?.agent.status || "pending") === "pending"
  const statusLabel = { pending: t.pay.statusPending, confirmed: t.pay.statusConfirmed, rejected: t.pay.statusRejected }
  // Code the agent writes in the transfer note, so the admin can find the money.
  const payCode = agent ? agentPayCode(agent.id) : ""
  const methodLabel = (key: string) => (key === "paypal" ? "PayPal" : key === "paystack" ? "Paystack" : key in MANUAL_METHODS ? MANUAL_METHODS[key as ManualMethod].label : key)

  return (
    <main className="agent-page">
      <style>{`
        .billing-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 12px 0 8px; }
        .billing-plan { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; text-align: start; border: 2px solid #E2E8F0; border-radius: 14px; padding: 16px; background: #fff; cursor: pointer; font: inherit; color: #1A2332; }
        .billing-plan[aria-pressed="true"] { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.18); }
        .billing-plan strong { display: block; font-size: 17px; color: #1E3A5F; }
        .billing-manage { border-inline-start: 4px solid #C9A84C; }
        .billing-manage-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; }
        .billing-plan .billing-price { display: block; font-size: 22px; font-weight: 800; color: #1E3A5F; margin-top: 6px; }
        .billing-plan small { color: #5C6B7A; }
        .billing-methods { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 16px; }
        .billing-methods button { border: 1px solid #CBD5E1; border-radius: 999px; padding: 8px 16px; background: #fff; font: inherit; font-weight: 650; color: #1E3A5F; cursor: pointer; }
        .billing-methods button[aria-pressed="true"] { background: #1E3A5F; color: #fff; border-color: #1E3A5F; }
        .billing-details { display: grid; gap: 8px; margin: 0 0 16px; padding: 14px 16px; background: #F7F5F0; border: 1px solid #E2E8F0; border-radius: 12px; }
        .billing-details div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; }
        .billing-details dt { color: #5C6B7A; }
        .billing-details dd { margin: 0; font-weight: 700; color: #1E3A5F; display: flex; gap: 8px; align-items: center; }
        .billing-details dd button { border: 1px solid #CBD5E1; border-radius: 8px; padding: 2px 8px; background: #fff; font: inherit; font-size: 12px; cursor: pointer; }
        .billing-code { font-size: 20px; letter-spacing: 1px; color: #A07F2A !important; }
        .billing-ref { font-weight: 400; color: #5C6B7A; font-size: 13px; line-height: 1.45; }
        .billing-paypal { max-width: 420px; margin-top: 8px; }
        .billing-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .billing-table th, .billing-table td { text-align: start; padding: 10px 8px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
        .billing-table-wrap { overflow-x: auto; }
      `}</style>
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <div className="section-label">{t.pay.label}</div>
          <h1>{t.pay.tab}</h1>
          {error ? <p className="agent-error" role="alert">{error}</p> : null}
          {notice ? <p className="agent-note" role="status">{notice}</p> : null}

          <div className="agent-summary">
            <div>
              <span>{t.pay.current}</span>
              <strong>{planNames[info?.agent.plan ?? "listed"]}</strong>
            </div>
            <div>
              <span>{t.pay.paidUntil}</span>
              <strong>{info?.agent.paid_until ? formatDate(info.agent.paid_until) : t.pay.notPaid}</strong>
            </div>
          </div>
          {awaitingVerification ? <p className="agent-note">{t.pay.pendingNote}</p> : null}

          {info?.agent.paypal_subscription_id ? (
            <section className="agent-card billing-manage">
              <h2>{t.pay.manageTitle}</h2>
              {subscriptionActive ? (
                <p className="agent-note">{fill(t.pay.subActive, { plan: planNames[info.agent.plan] })}</p>
              ) : (
                <p className="agent-lead">
                  {fill(t.pay.subCancelled, { date: info.agent.paid_until ? formatDate(info.agent.paid_until) : t.pay.notPaid })}
                </p>
              )}
              <p className="agent-lead">{t.pay.cancelHow}</p>
              <div className="billing-manage-actions">
                {subscriptionActive ? (
                  <button className="agent-btn agent-btn--line" type="button" onClick={cancelPaypal} disabled={busy}>
                    {t.pay.cancel}
                  </button>
                ) : null}
                <a className="agent-text-btn" href="#faq">{t.pay.howLink}</a>
              </div>
            </section>
          ) : (
            <p className="agent-switch"><a href="#faq">{t.pay.howLink}</a></p>
          )}

          <section className="agent-card">
            <h2>{t.pay.choosePlan}</h2>
            <div className="plan-cards">
              {(["listed", "featured"] as PlanId[]).map((id) => (
                <PlanCard key={id} plan={id} localCurrency={local} selected={plan === id} onSelect={() => setPlan(id)} />
              ))}
            </div>
          </section>

          {awaitingVerification ? null : (
          <section className="agent-card">
            <h2>{t.pay.chooseMethod}</h2>
            <div className="billing-methods" role="group">
              {PAYSTACK_ON ? (
                <button type="button" aria-pressed={method === "paystack"} onClick={() => setMethod("paystack")}>{t.pay.paystackTitle}</button>
              ) : null}
              <button type="button" aria-pressed={method === "paypal"} onClick={() => setMethod("paypal")}>{t.pay.cardTitle}</button>
              {manual.map((key) => (
                <button key={key} type="button" aria-pressed={method === key} onClick={() => setMethod(key)}>
                  {fill(t.pay.transferTitle, { method: MANUAL_METHODS[key].label, currency: MANUAL_METHODS[key].currency })}
                </button>
              ))}
            </div>
            {!manual.length ? (
              <p className="agent-lead">{fill(t.pay.noManual, { whatsapp: AGENT_RENEW.whatsappDisplay })}</p>
            ) : null}

            {method === "paystack" ? (
              <div className="agent-form">
                {paystackSub.active ? (
                  <>
                    <p className="agent-note">{t.pay.paystackRenewing}</p>
                    <button className="agent-btn agent-btn--line" type="button" onClick={stopPaystackRenew} disabled={busy}>
                      {t.pay.paystackCancel}
                    </button>
                  </>
                ) : paystackSub.autoRenewPlans.includes(plan) ? (
                  <>
                    <p className="agent-lead">{fill(t.pay.paystackAutoNote, { period: t.pay.paystackMonth })}</p>
                    <button className="agent-btn" type="button" onClick={() => payWithPaystack(true)} disabled={busy}>
                      {fill(t.pay.paystackAuto, { amount: formatMoney(priceFor(plan, "NGN", 1), "NGN"), period: t.pay.paystackMonth })}
                    </button>
                  </>
                ) : null}
                <p className="agent-lead">{t.pay.paystackNote}</p>
                <label>
                  {t.pay.months}
                  <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
                    {MONTH_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <button className="agent-btn agent-btn--line" type="button" onClick={() => payWithPaystack(false)} disabled={busy}>
                  {fill(t.pay.paystackOnce, { amount: formatMoney(priceFor(plan, "NGN", months), "NGN") })}
                </button>
              </div>
            ) : method === "paypal" ? (
              <div>
                {subscriptionActive ? <p className="agent-lead">{t.pay.subChange}</p> : null}
                {!subscriptionActive || plan !== info?.agent.plan ? (
                  <>
                    <p className="agent-lead">{fill(t.pay.cardBody, { price: formatMoney(priceFor(plan, "USD"), "USD") })}</p>
                    <p className="agent-lead" style={{ fontSize: 14 }}>{t.pay.paypalAlt}</p>
                    {paypalBroken ? (
                      <p className="agent-error">{t.pay.paypalUnavailable}</p>
                    ) : busy ? (
                      <p className="agent-status-line">{t.pay.processing}</p>
                    ) : (
                      <PaypalSubscribeButton
                        planId={PAYPAL_PLAN_IDS[plan]}
                        agentId={agent.id}
                        onApproved={onApproved}
                        onError={(message) => {
                          console.error("PayPal:", message)
                          if (message === "missing-client-id" || message === "PayPal did not load.") setPaypalBroken(true)
                          else setError(message)
                        }}
                      />
                    )}
                  </>
                ) : null}
              </div>
            ) : (
              <form className="agent-form" onSubmit={submitManual}>
                <label>
                  {t.pay.months}
                  <select value={months} onChange={(event) => setMonths(Number(event.target.value))}>
                    {MONTH_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <dl className="billing-details">
                  <div>
                    <dt>{t.pay.amount}</dt>
                    <dd>{formatMoney(priceFor(plan, MANUAL_METHODS[method].currency, months), MANUAL_METHODS[method].currency)}</dd>
                  </div>
                  <div>
                    <dt>{t.pay.bank}</dt>
                    <dd>{MANUAL_METHODS[method].bank}</dd>
                  </div>
                  <div>
                    <dt>{t.pay.accountName}</dt>
                    <dd>{MANUAL_METHODS[method].accountName}</dd>
                  </div>
                  <div>
                    <dt>{t.pay.accountNumber}</dt>
                    <dd>
                      {MANUAL_METHODS[method].accountNumber}
                      <button type="button" onClick={() => copy(MANUAL_METHODS[method].accountNumber)}>
                        {copied === MANUAL_METHODS[method].accountNumber ? t.pay.copied : t.pay.copy}
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.pay.payCode}</dt>
                    <dd className="billing-code">
                      {payCode}
                      <button type="button" onClick={() => copy(payCode)}>{copied === payCode ? t.pay.copied : t.pay.copy}</button>
                    </dd>
                  </div>
                </dl>
                <ManualPayGuide method={MANUAL_METHODS[method].label} code={payCode} />
                <label>
                  {t.pay.reference}
                  <input value={reference} onChange={(event) => setReference(event.target.value)} required maxLength={120} />
                  <small className="billing-ref">{fill(t.pay.refWhat, { method: MANUAL_METHODS[method].label })}</small>
                </label>
                <label>
                  {t.pay.receipt}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} required />
                </label>
                <button className="agent-btn agent-btn--navy" type="submit" disabled={busy}>
                  {busy ? t.common.sending : t.pay.submit}
                </button>
              </form>
            )}
          </section>
          )}

          <section className="agent-card">
            <h2>{t.pay.history}</h2>
            {info?.payments.length ? (
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>{t.pay.date}</th>
                      <th>{t.home.plan}</th>
                      <th>{t.pay.amount}</th>
                      <th>{t.pay.method}</th>
                      <th>{t.pay.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.created_at)}</td>
                        <td>{planNames[payment.plan]} · {payment.months}</td>
                        <td>{formatMoney(Number(payment.amount), payment.currency)}</td>
                        <td>{methodLabel(payment.method)}</td>
                        <td>
                          {statusLabel[payment.status]}
                          {payment.status === "rejected" && payment.admin_note ? <div><small>{payment.admin_note}</small></div> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="agent-lead">{t.pay.none}</p>
            )}
          </section>

          <section className="agent-card">
            <AgentFaq compact />
          </section>
        </div>
      </section>
    </main>
  )
}
