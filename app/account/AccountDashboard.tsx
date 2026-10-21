"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/agentFormat"
import { formatMoney, MANUAL_METHODS, type Currency, type ManualMethod } from "@/lib/agentPlans"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import ManualPayGuide from "./ManualPayGuide"
import {
  formatUsd,
  PREMIUM_CUSTOM_PREFIX,
  PREMIUM_LOCAL_PRICES,
  premiumPayCode,
  PREMIUM_PAYPAL_PLAN_IDS,
  PREMIUM_PLANS,
  type PremiumPlanId,
} from "@/lib/premiumPlans"
import { getSupabase, waitForSession } from "@/lib/supabaseBrowser"
import PaypalSubscribeButton from "@/app/agents/(zone)/billing/PaypalSubscribeButton"
import PremiumCard from "./PremiumCard"

type AccountInfo = {
  premium: {
    premium_until: string | null
    plan: PremiumPlanId | null
    paypal_subscription_id: string | null
    paypal_status: string | null
    store_until?: string | null
    store_name?: string | null
  } | null
  payments: { id: string; plan: PremiumPlanId; amount: number; currency: string; method: string; status: string; created_at: string }[]
  isAgent: boolean
}

const CSS = `
.acct-grid { display: grid; gap: 16px; }
.acct-status { border-inline-start: 4px solid #c9a84c; }
.acct-status--on { border-inline-start-color: #2f855a; }
.acct-status h2 { margin: 0 0 6px; color: #1e3a5f; }
.acct-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0; }
.acct-plan { text-align: start; border: 2px solid rgba(30,58,95,0.12); border-radius: 16px; padding: 16px; background: #fff; cursor: pointer; font: inherit; color: #1e3a5f; }
.acct-plan[aria-pressed="true"] { border-color: #c9a84c; box-shadow: 0 0 0 4px rgba(201,168,76,0.2); }
.acct-plan strong { display: block; font-size: 15px; }
.acct-plan b { display: block; font-size: 26px; margin-top: 4px; }
.acct-plan small { font-size: 14px; opacity: 0.7; }
.acct-save { display: inline-block; margin-inline-start: 8px; padding: 1px 8px; border-radius: 999px; background: #c9a84c; color: #1e3a5f; font-size: 11px; font-weight: 800; vertical-align: middle; }
.acct-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.acct-list li { display: flex; gap: 10px; line-height: 1.5; }
.acct-list li::before { content: "✓"; color: #a07f2a; font-weight: 800; }
.acct-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.acct-table td { padding: 8px 4px; border-bottom: 1px solid rgba(30,58,95,0.08); }
.acct-links { display: flex; flex-wrap: wrap; gap: 12px 20px; }
.acct-methods { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 14px; }
.acct-methods button { font: inherit; font-weight: 700; padding: 9px 14px; border-radius: 999px; border: 1.5px solid rgba(30,58,95,0.2); background: #fff; color: #1e3a5f; cursor: pointer; }
.acct-methods button[aria-pressed="true"] { background: #1e3a5f; border-color: #1e3a5f; color: #fff; }
.acct-transfer { display: grid; gap: 10px; }
.acct-details { display: grid; gap: 8px; margin: 0; padding: 14px; border-radius: 14px; background: #faf6ee; border: 1px solid rgba(201,168,76,0.4); }
.acct-details div { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.acct-details dt { color: #6b7280; }
.acct-details dd { margin: 0; font-weight: 700; color: #1e3a5f; display: flex; gap: 8px; align-items: center; }
.acct-details dd button { font: inherit; font-size: 12px; padding: 2px 8px; border-radius: 999px; border: 1px solid #c9a84c; background: #fff; color: #a07f2a; cursor: pointer; }
.acct-code { font-size: 20px; letter-spacing: 1px; color: #a07f2a !important; }
.acct-transfer label { display: grid; gap: 4px; font-weight: 600; color: #1e3a5f; }
.mpg-ref { font-weight: 400; color: #5C6B7A; font-size: 13px; line-height: 1.45; }
.acct-transfer input { font: inherit; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(30,58,95,0.2); }
.acct-pending { padding: 12px 14px; border-radius: 12px; background: #fff7e6; border: 1px solid #f0c36d; color: #7a5300; }
`

async function authHeaders() {
  const { data: { session } } = await getSupabase().auth.getSession()
  if (!session) throw new Error("login")
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
}

export default function AccountDashboard() {
  const { t } = useT()
  const a = t.account
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [who, setWho] = useState("")
  const [info, setInfo] = useState<AccountInfo | null>(null)
  const [plan, setPlan] = useState<PremiumPlanId>("yearly")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  // How to pay: PayPal / card, or an OPay / MyNita transfer checked by hand.
  const [payMethod, setPayMethod] = useState<"paypal" | ManualMethod>("paypal")
  const [reference, setReference] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [copied, setCopied] = useState("")

  // ─── Load the account (or send to login) ──────────────────────────────────
  const load = useCallback(async () => {
    try {
      const { session, error: loginError } = await waitForSession()
      if (!session) {
        router.replace(loginError ? `/account/login?error=${encodeURIComponent(loginError)}` : "/account/login")
        return
      }
      // Clean the login details out of the address bar.
      if (window.location.hash || window.location.search) window.history.replaceState(null, "", "/account")
      setUserId(session.user.id)
      setWho(session.user.email || session.user.phone || "")
      const response = await fetch("/api/account/premium", { headers: await authHeaders() })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || a.loadError)
      setInfo(payload as AccountInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : a.loadError)
    }
  }, [router, a.loadError])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  // ─── PayPal approved → ask the server to confirm and credit it ────────────
  const onApproved = useCallback(
    async (subscriptionId: string) => {
      setBusy(true)
      setError("")
      setNotice(a.checking)
      try {
        const response = await fetch("/api/account/paypal/activate", {
          method: "POST",
          headers: await authHeaders(),
          body: JSON.stringify({ subscriptionId }),
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error || a.loadError)
        setNotice(a.activated)
        await load()
      } catch (err) {
        setNotice("")
        setError(err instanceof Error ? err.message : a.loadError)
      } finally {
        setBusy(false)
      }
    },
    [a.activated, a.checking, a.loadError, load],
  )

  const onPaypalError = useCallback((message: string) => {
    setError(message === "missing-client-id" ? a.paypalMissing : message)
  }, [a.paypalMissing])

  async function cancelRenew() {
    if (!window.confirm(a.cancelConfirm)) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/account/paypal/cancel", { method: "POST", headers: await authHeaders() })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || a.loadError)
      setNotice(a.cancelled)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : a.loadError)
    } finally {
      setBusy(false)
    }
  }

  // ─── OPay / MyNita: the user tells us they sent the money ─────────────────
  async function submitTransfer(event: FormEvent) {
    event.preventDefault()
    if (payMethod === "paypal") return
    setError("")
    setNotice("")
    if (!reference.trim()) {
      setError(a.needReference)
      return
    }
    setBusy(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error(a.loadError)
      // Optional receipt (helps the admin find it faster; the admin still checks the real account).
      let receiptPath = ""
      if (receipt) {
        const ext = receipt.name.split(".").pop()?.toLowerCase() || ""
        const types: Record<string, string> = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }
        if (!types[ext]) throw new Error(a.receiptType)
        if (receipt.size > 5 * 1024 * 1024) throw new Error(a.receiptSize)
        receiptPath = `${session.user.id}/payments/premium-${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`
        const { error: uploadError } = await supabase.storage.from("agent-docs").upload(receiptPath, receipt, { upsert: false, contentType: types[ext] })
        if (uploadError) throw new Error(uploadError.message)
      }
      const response = await fetch("/api/account/manual-payment", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ plan, method: payMethod, reference, receiptPath }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || a.loadError)
      setNotice(a.transferSent)
      setReference("")
      setReceipt(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : a.loadError)
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
      // clipboard blocked; the value is still on screen
    }
  }

  async function logOut() {
    await getSupabase().auth.signOut()
    router.replace("/account/login")
  }

  if (!info && !error) {
    return <main className="agent-page"><p className="agent-status-line">{a.loading}</p></main>
  }

  // ─── Work out the state ───────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  // Website Premium or Premium bought in the app (App Store / Google Play): the later date counts.
  const webUntil = info?.premium?.premium_until?.slice(0, 10) || ""
  const storeUntil = info?.premium?.store_until?.slice(0, 10) || ""
  const until = webUntil > storeUntil ? webUntil : storeUntil
  const isPremium = Boolean(until && until >= today)
  const renewing = info?.premium?.paypal_status === "ACTIVE"
  const planIdReady = Boolean(PREMIUM_PAYPAL_PLAN_IDS[plan])

  const premiumFeatures = [a.featKahfMulk, a.featTrip, a.featOffline, a.featAi, a.featFonts, a.featGuided, a.featSalawat, a.featAdhan]
  const manualMethods = (Object.keys(MANUAL_METHODS) as ManualMethod[]).filter((key) => MANUAL_METHODS[key].accountNumber.trim())
  const hasPending = Boolean(info?.payments.some((p) => p.status === "pending"))
  const payCode = userId ? premiumPayCode(userId) : ""
  const showAmount = (amount: number, currency: string) => (currency === "USD" ? formatUsd(amount) : formatMoney(amount, currency as Currency))

  return (
    <main className="agent-page">
      <style>{CSS}</style>
      <section className="agent-section">
        <div className="page-container acct-grid" style={{ maxWidth: 900 }}>
          <div>
            <div className="section-label">{a.title.toUpperCase()}</div>
            <h1>{a.title}</h1>
            <p className="agent-lead" style={{ margin: 0 }}>{who}</p>
          </div>

          {error ? <p className="agent-error">{error}</p> : null}
          {notice ? <p className="agent-note">{notice}</p> : null}

          {/* ─── Current plan ─────────────────────────────────────────────── */}
          <section className={`agent-card acct-status${isPremium ? " acct-status--on" : ""}`}>
            <h2>{isPremium ? `⭐ ${a.premiumOn}` : a.freePlan}</h2>
            {isPremium ? (
              <>
                <p>{fill(a.premiumUntil, { date: formatDate(until) })}</p>
                <p>{renewing ? a.renews : fill(a.renewOff, { date: formatDate(until) })}</p>
                <p className="agent-switch" style={{ margin: 0 }}>{a.appNote}</p>
                {renewing ? (
                  <button className="agent-btn agent-btn--line" type="button" onClick={cancelRenew} disabled={busy}>
                    {a.cancel}
                  </button>
                ) : null}
              </>
            ) : (
              <p>{a.freeBody}</p>
            )}
          </section>

          {/* ─── Get Premium (when not renewing) ──────────────────────────── */}
          {!renewing ? (
            <section className="agent-card">
              <h2 style={{ marginTop: 0 }}>{a.getPremium}</h2>
              <div className="plan-cards">
                {PREMIUM_PLANS.map((id) => (
                  <PremiumCard key={id} plan={id} selected={plan === id} onSelect={() => setPlan(id)} />
                ))}
              </div>
              {hasPending ? <p className="acct-pending">{a.pendingNote}</p> : null}

              {/* How to pay */}
              <div className="acct-methods" role="group">
                <button type="button" aria-pressed={payMethod === "paypal"} onClick={() => setPayMethod("paypal")}>{a.payCard}</button>
                {manualMethods.map((key) => (
                  <button key={key} type="button" aria-pressed={payMethod === key} onClick={() => setPayMethod(key)}>
                    {fill(a.payTransfer, { method: MANUAL_METHODS[key].label })}
                  </button>
                ))}
              </div>

              {payMethod === "paypal" ? (
                <>
                  <p className="agent-switch" style={{ marginTop: 0 }}>{a.payNote}</p>
                  {planIdReady && userId ? (
                    <PaypalSubscribeButton
                      key={plan}
                      planId={PREMIUM_PAYPAL_PLAN_IDS[plan]}
                      agentId={`${PREMIUM_CUSTOM_PREFIX}${userId}`}
                      onApproved={onApproved}
                      onError={onPaypalError}
                    />
                  ) : (
                    <p className="agent-note">{a.paypalMissing}</p>
                  )}
                </>
              ) : (
                <form className="acct-transfer" onSubmit={submitTransfer}>
                  <p style={{ margin: 0 }}>{a.transferHow}</p>
                  <ManualPayGuide method={MANUAL_METHODS[payMethod].label} code={payCode} />
                  <dl className="acct-details">
                    <div>
                      <dt>{a.amountLabel}</dt>
                      <dd>{formatMoney(PREMIUM_LOCAL_PRICES[plan][MANUAL_METHODS[payMethod].currency as "NGN" | "XOF"], MANUAL_METHODS[payMethod].currency)}</dd>
                    </div>
                    <div>
                      <dt>{a.sendTo}</dt>
                      <dd>{MANUAL_METHODS[payMethod].bank}</dd>
                    </div>
                    <div>
                      <dt>{a.accountName}</dt>
                      <dd>{MANUAL_METHODS[payMethod].accountName}</dd>
                    </div>
                    <div>
                      <dt>{a.accountNumber}</dt>
                      <dd>
                        {MANUAL_METHODS[payMethod].accountNumber}
                        <button type="button" onClick={() => copy(MANUAL_METHODS[payMethod].accountNumber)}>
                          {copied === MANUAL_METHODS[payMethod].accountNumber ? a.copied : a.copy}
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt>{a.yourCode}</dt>
                      <dd className="acct-code">
                        {payCode}
                        <button type="button" onClick={() => copy(payCode)}>{copied === payCode ? a.copied : a.copy}</button>
                      </dd>
                    </div>
                  </dl>
                  <p className="agent-switch" style={{ margin: 0 }}>{a.codeHint}</p>
                  <label>
                    {a.referenceLabel}
                    <input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} placeholder={a.referenceHint} />
                    <small className="mpg-ref">{fill(t.pay.refWhat, { method: MANUAL_METHODS[payMethod].label })}</small>
                  </label>
                  <label>
                    {a.receiptLabel}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} />
                  </label>
                  <button className="agent-btn agent-btn--navy" type="submit" disabled={busy}>
                    {busy ? a.sending : a.submitTransfer}
                  </button>
                  <p className="agent-switch" style={{ margin: 0 }}>{a.transferWait}</p>
                </form>
              )}
            </section>
          ) : null}

          {/* ─── What Premium includes (shown once they have Premium) ─────── */}
          {renewing ? <section className="agent-card">
            <h2 style={{ marginTop: 0 }}>{a.features}</h2>
            <ul className="acct-list">
              {premiumFeatures.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section> : null}

          {/* ─── Payment history ──────────────────────────────────────────── */}
          <section className="agent-card">
            <h2 style={{ marginTop: 0 }}>{a.history}</h2>
            {info?.payments.length ? (
              <table className="acct-table">
                <tbody>
                  {info.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.created_at.slice(0, 10))}</td>
                      <td>{payment.plan === "yearly" ? a.yearly : a.monthly}</td>
                      <td>{showAmount(Number(payment.amount), payment.currency)}</td>
                      <td>{payment.method === "paypal" ? "PayPal / card" : MANUAL_METHODS[payment.method as ManualMethod]?.label || payment.method}</td>
                      <td>{payment.status === "pending" ? a.statusPending : payment.status === "rejected" ? a.statusRejected : "✓"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>{a.noPayments}</p>
            )}
          </section>

          {/* ─── Links ────────────────────────────────────────────────────── */}
          <div className="acct-links">
            {info?.isAgent ? <a href="/agents/home">{a.agentLink}</a> : null}
            <a href="/account/delete">{a.deleteLink}</a>
            <button className="agent-text-btn" type="button" onClick={logOut}>{a.logout}</button>
          </div>
        </div>
      </section>
    </main>
  )
}
