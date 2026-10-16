"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { VERIFICATION_DOC_FIELDS, verificationGaps, type VerificationDocKey } from "@/lib/agentAccount"
import VerifiedCheck from "@/app/agents/VerifiedCheck"
import { formatDate, planLabel, STATUS_LABEL } from "@/lib/agentFormat"
import { getSupabase } from "@/lib/supabaseBrowser"
import AdminPayments from "./AdminPayments"
import AdminPremiumPayments from "./AdminPremiumPayments"

type AdminAgent = {
  id: string
  business_name: string | null
  agency_name: string | null
  owner_name: string | null
  email: string | null
  country: string | null
  status: string
  plan: string | null
  verified: boolean | null
  paid_until: string | null
  agent_code: string | null
  licence_number: string | null
  licence_authority: string | null
  business_reg_number: string | null
  office_address: string | null
  doc_business_reg: string | null
  doc_licence: string | null
  doc_owner_id: string | null
  doc_office_photo: string | null
  references_note: string | null
  verification_notes: string | null
  info_request: string | null
  info_requested_at: string | null
}

/** Optional free time when verifying. Empty = the agent goes live after they pay. */
function defaultPaidUntil(_current: string | null) {
  return ""
}

const FILTERS = ["all", "pending", "active", "expired", "suspended"] as const

function AdminHeader() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function logOut() {
    await getSupabase().auth.signOut()
    router.replace("/agents/login")
  }

  const tabs = (
    <>
      <a href="/admin/agents" aria-current="page">Agents (admin)</a>
      <a href="/agents/home">Agent Zone</a>
    </>
  )

  return (
    <header className="agent-zone-header">
      <style>{`
        .agent-zone-header { background: #1E3A5F; color: #fff; position: sticky; top: 0; z-index: 50; }
        .agent-zone-header a, .agent-zone-header button { color: #fff; background: transparent; text-decoration: none; }
        .agent-zone-header-inner { width: min(1100px, calc(100% - 32px)); margin: 0 auto; min-height: 64px; display: flex; align-items: center; gap: 20px; }
        .agent-zone-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; font-weight: 700; color: #fff; }
        .agent-zone-brand img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
        .agent-zone-tabs { display: flex; align-items: center; gap: 4px; }
        .agent-zone-tabs a, .agent-zone-menu a { padding: 10px 14px; border-bottom: 2px solid transparent; font-weight: 650; font-size: 15px; color: #fff; }
        .agent-zone-header a[aria-current="page"] { color: #C9A84C; border-bottom-color: #C9A84C; }
        .agent-zone-side { margin-inline-start: auto; display: flex; align-items: center; gap: 16px; }
        .agent-zone-header button { border: 1px solid rgba(255,255,255,0.55); border-radius: 999px; padding: 8px 16px; font: inherit; font-weight: 650; color: #fff; background: transparent; cursor: pointer; }
        .agent-zone-menu-btn, .agent-zone-menu { display: none; }
        @media (max-width: 760px) {
          .agent-zone-tabs, .agent-zone-side { display: none; }
          .agent-zone-menu-btn { display: inline-flex; margin-inline-start: auto; }
          .agent-zone-menu { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 8px 16px 16px; border-top: 1px solid rgba(255,255,255,0.15); }
        }
      `}</style>
      <div className="agent-zone-header-inner">
        <a className="agent-zone-brand" href="/admin/agents">
          <img src="/logo.jpg" alt="" width={36} height={36} />
          <span>Agent Zone</span>
        </a>
        <nav className="agent-zone-tabs" aria-label="Admin">
          {tabs}
        </nav>
        <div className="agent-zone-side">
          <button type="button" onClick={logOut}>Log out</button>
        </div>
        <button
          type="button"
          className="agent-zone-menu-btn"
          aria-expanded={open}
          aria-controls="admin-zone-menu"
          onClick={() => setOpen((current) => !current)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <div id="admin-zone-menu" className="agent-zone-menu">
          {tabs}
          <button type="button" onClick={logOut}>Log out</button>
        </div>
      ) : null}
    </header>
  )
}

export default function AdminAgents() {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all")
  const [paidUntil, setPaidUntil] = useState<Record<string, string>>({})
  const [plans, setPlans] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [toast, setToast] = useState<{ id: number; ok: boolean; message: string } | null>(null)
  const [busy, setBusy] = useState("")
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [infoText, setInfoText] = useState<Record<string, string>>({})

  async function loadAgents() {
    const supabase = getSupabase()
    const { data, error: listError } = await supabase
      .from("agents")
      .select("id, business_name, agency_name, owner_name, email, country, status, plan, verified, paid_until, agent_code, created_at, licence_number, licence_authority, business_reg_number, office_address, doc_business_reg, doc_licence, doc_owner_id, doc_office_photo, references_note, verification_notes, info_request, info_requested_at")
      .order("created_at", { ascending: false })
    if (listError) throw new Error(listError.message)
    const rows = (data ?? []) as AdminAgent[]
    setAgents(rows)
    setPaidUntil((current) => {
      const next = { ...current }
      for (const row of rows) {
        if (!next[row.id]) next[row.id] = defaultPaidUntil(row.paid_until)
      }
      return next
    })
    setPlans((current) => {
      const next = { ...current }
      for (const row of rows) {
        if (!next[row.id]) next[row.id] = row.plan === "pro" || row.plan === "featured" ? "featured" : "listed"
      }
      return next
    })
    setNotes((current) => {
      const next = { ...current }
      for (const row of rows) {
        if (next[row.id] === undefined) next[row.id] = row.verification_notes || ""
      }
      return next
    })
  }

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          if (!cancelled) setReady(true)
          return
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle()
        if (profileError) throw new Error(profileError.message)
        if (profile?.role !== "admin") {
          if (!cancelled) setReady(true)
          return
        }
        await loadAgents()
        if (!cancelled) setAllowed(true)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load agents.")
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    start()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function updateAgent(id: string, action: string, extra?: Record<string, unknown>) {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Log in again.")
    const response = await fetch("/api/admin/agents/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentId: id, action, ...extra }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new Error(payload?.error || "Could not update this agent.")
    return typeof payload?.message === "string" ? payload.message : "Saved."
  }

  async function run(id: string, action: string, work: () => Promise<string>) {
    setBusy(`${id}:${action}`)
    setToast(null)
    try {
      const message = await work()
      setToast({ id: Date.now(), ok: true, message })
    } catch (err) {
      setToast({
        id: Date.now(),
        ok: false,
        message: err instanceof Error ? err.message : "Could not update this agent.",
      })
    } finally {
      setBusy("")
      try {
        await loadAgents()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load agents.")
      }
    }
  }

  async function viewDocument(agentId: string, field: VerificationDocKey) {
    const tab = window.open("about:blank", "_blank", "noopener,noreferrer")
    setBusy(`${agentId}:doc`)
    setToast(null)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Log in again.")
      const response = await fetch("/api/admin/agents/document", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId, field }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || typeof payload?.url !== "string") {
        throw new Error(payload?.error || "Could not open this document.")
      }
      if (tab) tab.location.href = payload.url
      else window.location.href = payload.url
    } catch (err) {
      tab?.close()
      setToast({
        id: Date.now(),
        ok: false,
        message: err instanceof Error ? err.message : "Could not open this document.",
      })
    } finally {
      setBusy("")
    }
  }

  function onVerify(event: FormEvent, agent: AdminAgent) {
    event.preventDefault()
    const date = paidUntil[agent.id] || defaultPaidUntil(agent.paid_until)
    // Documents missing? Ask before verifying anyway.
    const missing = verificationGaps(agent)
    if (missing.length && !window.confirm(`${agent.business_name || "This agency"} is missing: ${missing.join(", ")}.\n\nVerify anyway?`)) {
      return
    }
    run(agent.id, "verify", () =>
      updateAgent(agent.id, "verify", { ...(date ? { paidUntil: date } : {}), ...(missing.length ? { force: true } : {}) }),
    )
  }

  function onRequestInfo(event: FormEvent, agent: AdminAgent) {
    event.preventDefault()
    const message = (infoText[agent.id] ?? "").trim()
    run(agent.id, "info", async () => {
      const result = await updateAgent(agent.id, "request_info", { message })
      setInfoText((current) => ({ ...current, [agent.id]: "" }))
      await loadAgents()
      return result
    })
  }

  const pendingCount = agents.filter((agent) => agent.status === "pending").length
  const filtered = filter === "all" ? agents : agents.filter((agent) => agent.status === filter)
  const shown = [...filtered].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"))

  if (!ready) {
    return <main className="agent-page"><p className="agent-status-line">Loading agents…</p></main>
  }

  if (!allowed) {
    return (
      <main className="agent-page">
        <section className="agent-section">
          <div className="page-container">
            <h1>Agent admin</h1>
            <p className="agent-lead">This page is only for users with the admin role.</p>
            <a className="agent-btn agent-btn--navy" href="/agents/login">Agent login</a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="agent-zone">
      <AdminHeader />
      <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <div className="section-label">ADMIN</div>
          <h1>Agents · {pendingCount} pending</h1>
          {error ? <p className="agent-error">{error}</p> : null}
          {toast ? (
            <p className={`admin-toast ${toast.ok ? "agent-note" : "agent-error"}`} role="status">
              {toast.message}
            </p>
          ) : null}
          <AdminPayments onChanged={() => { loadAgents().catch(() => undefined) }} />
          <AdminPremiumPayments />
          <label className="agent-filter">
            Status
            <select value={filter} onChange={(event) => setFilter(event.target.value as (typeof FILTERS)[number])}>
              {FILTERS.map((item) => (
                <option key={item} value={item}>{item === "all" ? "All" : STATUS_LABEL[item]}</option>
              ))}
            </select>
          </label>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Agency</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Paid until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((agent) => {
                  const name = agent.business_name || agent.agency_name || "Unnamed agency"
                  const status = (agent.status || "").toLowerCase()
                  const missing = verificationGaps(agent)
                  const canVerify = status === "pending" || status === "expired"
                  return (
                    <tr key={agent.id}>
                      <td>
                        <strong>
                          {name}
                          {agent.verified ? <VerifiedCheck /> : null}
                        </strong>
                        <p>{agent.owner_name || "No owner"} · {agent.email || "No email"}</p>
                        <p>{agent.country || "No country"} · {agent.agent_code || "No code"} · {agent.verified ? "Verified" : "Not verified"}</p>
                        <p>Licence: {agent.licence_number || "—"} · {agent.licence_authority || "—"}</p>
                        <p>Registration: {agent.business_reg_number || "—"}</p>
                        <p>Address: {agent.office_address || "—"}</p>
                        {agent.references_note ? <p>References: {agent.references_note}</p> : null}
                        <p className={missing.length ? "agent-error" : "agent-note"} style={{ margin: "6px 0" }}>
                          {missing.length ? `Incomplete: ${missing.length} missing (${missing.join(", ")})` : "All documents received ✓"}
                        </p>
                        <div className="admin-actions">
                          {VERIFICATION_DOC_FIELDS.map((field) => (
                            agent[field.key] ? (
                              <button
                                key={field.key}
                                className="agent-text-btn"
                                type="button"
                                disabled={busy === `${agent.id}:doc`}
                                onClick={() => viewDocument(agent.id, field.key)}
                              >
                                View {field.label}
                              </button>
                            ) : (
                              <span key={field.key}>{field.label}: Missing</span>
                            )
                          ))}
                        </div>
                        <form
                          className="agent-form"
                          onSubmit={(event) => {
                            event.preventDefault()
                            const verificationNotes = notes[agent.id] ?? ""
                            run(agent.id, "notes", () => updateAgent(agent.id, "notes", { verificationNotes }))
                          }}
                        >
                          <textarea
                            value={notes[agent.id] ?? ""}
                            onChange={(event) => setNotes((current) => ({ ...current, [agent.id]: event.target.value }))}
                            rows={3}
                            aria-label={`Verification notes for ${name}`}
                            placeholder="Verification notes"
                          />
                          <button className="agent-btn agent-btn--line" type="submit" disabled={busy === `${agent.id}:notes`}>
                            Save notes
                          </button>
                        </form>
                      </td>
                      <td>{status === "pending" && agent.info_request ? "Needs info" : STATUS_LABEL[agent.status] || agent.status}</td>
                      <td>{planLabel(agent.plan)}</td>
                      <td>{formatDate(agent.paid_until)}</td>
                      <td>
                        <div className="admin-actions">
                          {canVerify ? (
                            <form className="admin-approve" onSubmit={(event) => onVerify(event, agent)}>
                              <input
                                type="date"
                                value={paidUntil[agent.id] || defaultPaidUntil(agent.paid_until)}
                                onChange={(event) => setPaidUntil((current) => ({ ...current, [agent.id]: event.target.value }))}
                                aria-label={`Free until (optional) for ${name}`}
                                title="Optional: give free time. Leave empty so the agent goes live after paying."
                              />
                              <button className="agent-btn agent-btn--gold" type="submit" disabled={busy === `${agent.id}:verify`}>
                                {missing.length ? "Verify anyway" : "Verify"}
                              </button>
                              <span>{agent.paid_until ? `Paid until ${formatDate(agent.paid_until)}` : "Not paid yet: goes live after paying (date = optional free time)"}</span>
                              {missing.length ? <span>Missing: {missing.join(", ")}</span> : null}
                            </form>
                          ) : null}
                          {canVerify ? (
                            <form className="agent-form admin-info-form" onSubmit={(event) => onRequestInfo(event, agent)}>
                              {agent.info_request ? (
                                <p className="agent-note">
                                  Asked {agent.info_requested_at ? formatDate(agent.info_requested_at) : ""}: {agent.info_request}
                                </p>
                              ) : null}
                              <textarea
                                value={infoText[agent.id] ?? ""}
                                onChange={(event) => setInfoText((current) => ({ ...current, [agent.id]: event.target.value }))}
                                rows={3}
                                aria-label={`Message to ${name}`}
                                placeholder={missing.length ? `e.g. Please upload: ${missing.join(", ")}` : "e.g. The licence photo is blurry, please upload a clear copy."}
                              />
                              <button className="agent-btn agent-btn--line" type="submit" disabled={busy === `${agent.id}:info`}>
                                Ask for more info (sends email)
                              </button>
                            </form>
                          ) : null}
                          {status === "active" || status === "suspended" ? (
                            <>
                              <select
                                value={plans[agent.id] || "listed"}
                                onChange={(event) => setPlans((current) => ({ ...current, [agent.id]: event.target.value }))}
                                aria-label={`Plan for ${name}`}
                              >
                                <option value="listed">Listed</option>
                                <option value="featured">Featured</option>
                              </select>
                              <button
                                className="agent-btn agent-btn--line"
                                type="button"
                                disabled={busy === `${agent.id}:plan`}
                                onClick={() => run(agent.id, "plan", () => updateAgent(agent.id, "set_plan", { plan: plans[agent.id] || "listed" }))}
                              >
                                Set plan
                              </button>
                              {status === "active" ? (
                                <button
                                  className="agent-btn agent-btn--line"
                                  type="button"
                                  disabled={busy === `${agent.id}:suspend`}
                                  onClick={() => run(agent.id, "suspend", () => updateAgent(agent.id, "suspend"))}
                                >
                                  Suspend
                                </button>
                              ) : null}
                              <button
                                className="agent-btn agent-btn--line"
                                type="button"
                                disabled={busy === `${agent.id}:extend`}
                                onClick={() => run(agent.id, "extend", () => updateAgent(agent.id, "extend"))}
                              >
                                Extend 1 month
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
          {shown.length === 0 ? <p className="agent-lead">No agents in this filter.</p> : null}
        </div>
      </section>
      </main>
    </div>
  )
}
