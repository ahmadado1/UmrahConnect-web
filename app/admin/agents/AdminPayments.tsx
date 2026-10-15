"use client"

import { useCallback, useEffect, useState } from "react"
import { formatDate } from "@/lib/agentFormat"
import { formatMoney, type Currency } from "@/lib/agentPlans"
import { getSupabase } from "@/lib/supabaseBrowser"

type AdminPayment = {
  id: string
  agent_id: string
  plan: string
  months: number
  amount: number
  currency: Currency
  method: string
  reference: string | null
  receipt_path: string | null
  status: "pending" | "confirmed" | "rejected"
  admin_note: string | null
  created_at: string
  agents: { business_name: string | null; agency_name: string | null; email: string | null; country: string | null } | null
}

const METHOD = { paypal: "PayPal (auto)", opay: "OPay", nita: "Nita", other: "Other" } as Record<string, string>

async function headers() {
  const { data: { session } } = await getSupabase().auth.getSession()
  if (!session) throw new Error("Log in again.")
  return { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }
}

/** Payments section on /admin/agents. OPay / Nita need Confirm or Reject; PayPal ones are confirmed automatically. */
export default function AdminPayments({ onChanged }: { onChanged?: () => void }) {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState("")
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)
  const load = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let cancelled = false
    async function fetchPayments() {
      try {
        const response = await fetch("/api/admin/payments", { headers: await headers(), cache: "no-store" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error || "Could not load payments.")
        if (!cancelled) setPayments(payload.payments as AdminPayment[])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load payments.")
      }
    }
    fetchPayments()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  async function openReceipt(id: string) {
    setError("")
    try {
      const response = await fetch("/api/admin/payments/receipt", { method: "POST", headers: await headers(), body: JSON.stringify({ paymentId: id }) })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.url) throw new Error(payload?.error || "Could not open the receipt.")
      window.open(payload.url, "_blank", "noopener")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the receipt.")
    }
  }

  async function act(id: string, action: "confirm" | "reject") {
    if (action === "reject" && !(notes[id] || "").trim()) {
      setError("Write a short note for the agent before rejecting.")
      return
    }
    setBusy(id)
    setError("")
    setMessage("")
    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify({ paymentId: id, action, note: notes[id] || "" }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || "Could not update the payment.")
      setMessage(payload?.message || "Saved.")
      load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the payment.")
    } finally {
      setBusy("")
    }
  }

  const pending = payments.filter((payment) => payment.status === "pending")
  const shown = showAll ? payments : pending

  return (
    <section id="payments" className="agent-card" style={{ margin: "16px 0 24px" }}>
      <h2>Payments · {pending.length} to confirm</h2>
      <p className="agent-lead">
        OPay and Nita payments wait here. Check the money arrived in your account, then Confirm. PayPal payments are confirmed automatically.
      </p>
      {error ? <p className="agent-error">{error}</p> : null}
      {message ? <p className="agent-note">{message}</p> : null}
      <label className="agent-filter">
        <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} /> Show all payments
      </label>
      {shown.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Amount</th>
                <th>Method / reference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((payment) => {
                const name = payment.agents?.business_name || payment.agents?.agency_name || "Unnamed agency"
                return (
                  <tr key={payment.id}>
                    <td>
                      <strong>{name}</strong>
                      <div>{payment.agents?.email || ""}</div>
                      <div>{formatDate(payment.created_at)}</div>
                    </td>
                    <td>
                      {formatMoney(Number(payment.amount), payment.currency)}
                      <div>{payment.plan === "featured" ? "Featured" : "Listed"} · {payment.months} month{payment.months === 1 ? "" : "s"}</div>
                    </td>
                    <td>
                      {METHOD[payment.method] || payment.method}
                      <div style={{ wordBreak: "break-all" }}>{payment.reference || "—"}</div>
                    </td>
                    <td>
                      {payment.status}
                      {payment.admin_note ? <div><small>{payment.admin_note}</small></div> : null}
                    </td>
                    <td>
                      <div className="admin-actions">
                        {payment.receipt_path ? (
                          <button className="agent-btn agent-btn--line" type="button" onClick={() => openReceipt(payment.id)}>View receipt</button>
                        ) : null}
                        {payment.status === "pending" ? (
                          <>
                            <button className="agent-btn agent-btn--navy" type="button" disabled={busy === payment.id} onClick={() => act(payment.id, "confirm")}>
                              Confirm
                            </button>
                            <input
                              placeholder="Note (needed to reject)"
                              value={notes[payment.id] || ""}
                              onChange={(event) => setNotes((current) => ({ ...current, [payment.id]: event.target.value }))}
                            />
                            <button className="agent-btn agent-btn--danger" type="button" disabled={busy === payment.id} onClick={() => act(payment.id, "reject")}>
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="agent-lead">{showAll ? "No payments yet." : "Nothing to confirm."}</p>
      )}
    </section>
  )
}
