"use client"

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseBrowser"

async function headers() {
  const { data: { session } } = await getSupabase().auth.getSession()
  if (!session) throw new Error("Log in again.")
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
}

/**
 * "New way to pay" announcement on /admin/agents.
 * Locked until Paystack is live (PAYSTACK_LIVE=true in Vercel). One press emails every Premium user and agency once.
 */
export default function AdminAnnounce() {
  const [status, setStatus] = useState<{ live: boolean; total: number; sent: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function refresh() {
    try {
      const response = await fetch("/api/admin/announce", { headers: await headers(), cache: "no-store" })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not load.")
      setStatus(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load.")
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function send() {
    if (!status) return
    const left = status.total - status.sent
    if (!window.confirm(`Email ${left} people about the new way to pay? This cannot be undone.`)) return
    setBusy(true)
    setError("")
    try {
      // Send in small batches until everyone has it.
      for (let round = 0; round < 200; round++) {
        const response = await fetch("/api/admin/announce", { method: "POST", headers: await headers() })
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error || "Could not send.")
        setMessage(`Sending… ${payload.left} left`)
        if (!payload.left || !payload.sent) break
      }
      setMessage("Done. Everyone has been emailed.")
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="agent-card" style={{ margin: "16px 0 24px" }}>
      <h2>Announcement: new way to pay</h2>
      <p className="agent-lead">
        Emails every Premium user and agency once: &quot;You can now pay by card, bank transfer, USSD or OPay&quot;.
        It unlocks when Paystack is live.
      </p>
      {error ? <p className="agent-error">{error}</p> : null}
      {message ? <p className="agent-note">{message}</p> : null}
      {status ? (
        <>
          <p>{status.sent} of {status.total} emailed.</p>
          {!status.live ? (
            <p className="agent-note">Locked: add PAYSTACK_LIVE = true in Vercel when Paystack is working, then redeploy.</p>
          ) : status.sent >= status.total ? (
            <p className="agent-note">Everyone has it.</p>
          ) : (
            <button className="agent-btn agent-btn--navy" type="button" onClick={send} disabled={busy}>
              {busy ? "Sending…" : `Send to ${status.total - status.sent} people`}
            </button>
          )}
        </>
      ) : (
        <p className="agent-status-line">Loading…</p>
      )}
    </section>
  )
}
