"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/agentFormat"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import {
  formatUsd,
  PREMIUM_CUSTOM_PREFIX,
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

  async function logOut() {
    await getSupabase().auth.signOut()
    router.replace("/account/login")
  }

  if (!info && !error) {
    return <main className="agent-page"><p className="agent-status-line">{a.loading}</p></main>
  }

  // ─── Work out the state ───────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const until = info?.premium?.premium_until?.slice(0, 10) || ""
  const isPremium = Boolean(until && until >= today)
  const renewing = info?.premium?.paypal_status === "ACTIVE"
  const planIdReady = Boolean(PREMIUM_PAYPAL_PLAN_IDS[plan])

  const premiumFeatures = [a.featAdhan, a.featFonts, a.featTrip, a.featGuided, a.featAi]

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
                      <td>{formatUsd(Number(payment.amount))}</td>
                      <td>{payment.method === "paypal" ? "PayPal / card" : payment.method}</td>
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
