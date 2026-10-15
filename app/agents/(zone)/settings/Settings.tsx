"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  agentWritePayload,
  citiesToText,
  emptyVerification,
  uploadAgentDocument,
  uploadAgentLogo,
  verificationFromAgent,
  verificationWritePayload,
  VERIFICATION_DOC_FIELDS,
  type AgentFormValues,
  type OwnAgent,
  type VerificationDocKey,
  type VerificationValues,
} from "@/lib/agentAccount"
import { formatDate } from "@/lib/agentFormat"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { useAgentSession } from "../../useAgentSession"
import VerificationFields from "../../VerificationFields"

function AdminHomeCard() {
  const { t } = useT()
  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <section className="agent-card">
            <h2>{t.home.adminTitle}</h2>
            <a className="agent-btn agent-btn--navy" href="/admin/agents">{t.home.manage}</a>
          </section>
        </div>
      </section>
    </main>
  )
}

function translateCaught(err: unknown, fallback: string, t: ReturnType<typeof useT>["t"]) {
  const message = err instanceof Error ? err.message : fallback
  if (message === "Each document must be 5 MB or smaller.") return t.docs.fileTooBig
  if (message === "Upload a PDF, JPEG, PNG, or WebP file.") return t.docs.fileType
  return message
}

function valuesFromAgent(agent: OwnAgent): AgentFormValues {
  return {
    businessName: agent.business_name || "",
    ownerName: agent.owner_name || "",
    licenseNumber: agent.license_number || "",
    country: agent.country || "",
    cities: citiesToText(agent.cities),
    phone: agent.phone || "",
    whatsapp: agent.whatsapp || "",
    email: agent.email || "",
    website: agent.website || "",
    description: agent.description || "",
  }
}

/** If the admin asked for more info, this clears the message and emails the admin. */
async function notifyInfoUpdated() {
  try {
    const { data: { session } } = await getSupabase().auth.getSession()
    if (!session) return
    await fetch("/api/agents/info-updated", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
  } catch (err) {
    console.error(err)
  }
}

export default function Settings() {
  const { t } = useT()
  const router = useRouter()
  const { agent, loginEmail, isAdmin, loading, error, setError, refresh } = useAgentSession()
  const [form, setForm] = useState<AgentFormValues | null>(null)
  const [verification, setVerification] = useState<VerificationValues>(emptyVerification)
  const [docFiles, setDocFiles] = useState<Partial<Record<VerificationDocKey, File>>>({})
  const [logo, setLogo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingDocs, setSavingDocs] = useState(false)
  const [saved, setSaved] = useState(false)
  const [docsSaved, setDocsSaved] = useState(false)
  const [docFormKey, setDocFormKey] = useState(0)
  const [editingDetails, setEditingDetails] = useState(false)
  const [panel, setPanel] = useState<"email" | "code" | "password" | null>(null)
  const [nextEmail, setNextEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [accountNotice, setAccountNotice] = useState("")
  const [accountLoading, setAccountLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (agent) {
      setForm(valuesFromAgent(agent))
      setVerification(verificationFromAgent(agent))
    }
  }, [agent])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  function setField(key: keyof AgentFormValues, value: string) {
    setForm((current) => (current ? { ...current, [key]: value } : current))
  }

  async function saveDetails(event: FormEvent) {
    event.preventDefault()
    if (!agent || !form) return
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/agents/login")
        return
      }
      let logoUrl: string | null = null
      if (logo) logoUrl = await uploadAgentLogo(supabase, user.id, logo)
      const { error: updateError } = await supabase.from("agents").update(agentWritePayload(form, logoUrl)).eq("id", agent.id)
      if (updateError) throw new Error(updateError.message)
      if (agent.info_request) await notifyInfoUpdated()
      await refresh()
      setLogo(null)
      setSaved(true)
      setEditingDetails(false)
    } catch (err) {
      setError(translateCaught(err, t.settings.saveError, t))
    } finally {
      setSaving(false)
    }
  }

  async function saveVerification(event: FormEvent) {
    event.preventDefault()
    if (!agent) return
    setSavingDocs(true)
    setError("")
    setDocsSaved(false)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/agents/login")
        return
      }
      const uploaded: Partial<Record<VerificationDocKey, string>> = {}
      for (const field of VERIFICATION_DOC_FIELDS) {
        const file = docFiles[field.key]
        if (file) uploaded[field.key] = await uploadAgentDocument(supabase, user.id, field.key, file)
      }
      const { error: updateError } = await supabase
        .from("agents")
        .update(verificationWritePayload(verification, uploaded))
        .eq("id", agent.id)
      if (updateError) throw new Error(updateError.message)
      if (agent.info_request) await notifyInfoUpdated()
      await refresh()
      setDocFiles({})
      setDocFormKey((key) => key + 1)
      setDocsSaved(true)
    } catch (err) {
      setError(translateCaught(err, t.settings.docsError, t))
    } finally {
      setSavingDocs(false)
    }
  }

  async function changeEmail(event: FormEvent) {
    event.preventDefault()
    setError("")
    setAccountNotice("")
    const email = nextEmail.trim().toLowerCase()
    if (!email.includes("@")) {
      setError(t.settings.invalidEmail)
      return
    }
    if (!currentPassword) {
      setError(t.settings.needPassword)
      return
    }
    setAccountLoading(true)
    try {
      const supabase = getSupabase()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: currentPassword,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }
      const { error: updateError } = await supabase.auth.updateUser({ email })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setNextEmail("")
      setCurrentPassword("")
      setPanel(null)
      setAccountNotice(t.settings.emailNotice)
    } finally {
      setAccountLoading(false)
    }
  }

  async function sendPasswordCode() {
    if (cooldown > 0) {
      setError("")
      setPanel("code")
      return
    }
    setError("")
    setAccountNotice("")
    const cleanEmail = loginEmail.trim().toLowerCase()
    if (!cleanEmail) {
      setError(t.settings.noEmail)
      return
    }
    setSendingCode(true)
    try {
      const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(cleanEmail)
      if (resetError) {
        setError(resetError.message)
        return
      }
      setPanel("code")
      setCooldown(60)
    } finally {
      setSendingCode(false)
    }
  }

  async function verifyPasswordCode(event: FormEvent) {
    event.preventDefault()
    setError("")
    setAccountNotice("")
    setAccountLoading(true)
    try {
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email: loginEmail.trim().toLowerCase(),
        token: code.trim(),
        type: "recovery",
      })
      if (verifyError) {
        setError(verifyError.message)
        return
      }
      setPanel("password")
    } finally {
      setAccountLoading(false)
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    setError("")
    setAccountNotice("")
    if (password.length < 6) {
      setError(t.settings.shortPassword)
      return
    }
    if (password !== confirm) {
      setError(t.reset.mismatch)
      return
    }
    setAccountLoading(true)
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setCode("")
      setPassword("")
      setConfirm("")
      setPanel(null)
      setAccountNotice(t.settings.passwordNotice)
    } finally {
      setAccountLoading(false)
    }
  }

  if (loading) {
    return <main className="agent-page"><p className="agent-status-line">{t.settings.loading}</p></main>
  }

  if (!agent || !form) {
    if (isAdmin) return <AdminHomeCard />
    return <main className="agent-page">{error ? <p className="agent-error">{error}</p> : null}</main>
  }

  const status = (agent.status || "pending").toLowerCase()
  const statusLabel = status === "active" ? t.settings.active
    : status === "expired" ? t.settings.expired
    : status === "suspended" ? t.settings.suspended
    : t.settings.pending

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="page-container agent-dashboard">
          <div className="section-label">{t.settings.label}</div>
          <h1>{t.settings.title}</h1>

          {error ? <p className="agent-error">{error}</p> : null}
          {accountNotice ? <p className="agent-note">{accountNotice}</p> : null}

          <div className="agent-summary">
            <div>
              <span>{t.settings.status}</span>
              <strong className={`agent-badge agent-badge--${status}`}>{statusLabel}</strong>
            </div>
            <div>
              <span>{t.settings.plan}</span>
              <strong>{agent.plan === "pro" || agent.plan === "featured" ? t.settings.featured : t.settings.listed}</strong>
            </div>
            <div>
              <span>{t.settings.verified}</span>
              <strong>{agent.verified ? t.common.yes : t.common.no}</strong>
            </div>
            <div>
              <span>{t.settings.paidUntil}</span>
              <strong>{agent.paid_until ? formatDate(agent.paid_until) : t.settings.notSet}</strong>
            </div>
          </div>
          <p className="agent-lead">{t.settings.locked}</p>

          <section className="agent-card">
            {saved ? <p className="agent-note">{t.settings.saved}</p> : null}
            {editingDetails ? (
            <form className="agent-form" onSubmit={saveDetails}>
              <label>
                {t.signup.businessName}
                <input value={form.businessName} onChange={(event) => setField("businessName", event.target.value)} required />
              </label>
              <label>
                {t.signup.owner}
                <input value={form.ownerName} onChange={(event) => setField("ownerName", event.target.value)} required />
              </label>
              <label>
                {t.signup.license}
                <input value={form.licenseNumber} onChange={(event) => setField("licenseNumber", event.target.value)} />
              </label>
              <label>
                {t.signup.country}
                <input value={form.country} onChange={(event) => setField("country", event.target.value)} required />
              </label>
              <label>
                {t.signup.cities}
                <input value={form.cities} onChange={(event) => setField("cities", event.target.value)} placeholder="Makkah, Madinah" />
              </label>
              <label>
                {t.signup.phone}
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} required />
              </label>
              <label>
                {t.signup.whatsapp}
                <input value={form.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} />
              </label>
              <label>
                {t.common.email}
                <input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required />
              </label>
              <label>
                {t.signup.website}
                <input value={form.website} onChange={(event) => setField("website", event.target.value)} />
              </label>
              <label>
                {t.signup.description}
                <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} />
              </label>
              <label>
                {t.signup.logo}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} />
              </label>
              {agent.logo_url ? <img className="agent-logo" src={agent.logo_url} alt="" /> : null}
              <button className="agent-btn agent-btn--navy" type="submit" disabled={saving}>
                {saving ? t.common.saving : t.settings.saveDetails}
              </button>
            </form>
            ) : (
              <button className="agent-btn agent-btn--line" type="button" onClick={() => setEditingDetails(true)}>
                {t.settings.edit}
              </button>
            )}
          </section>

          <section className="agent-card">
            {docsSaved ? <p className="agent-note">{t.settings.docsSaved}</p> : null}
            <form className="agent-form" onSubmit={saveVerification}>
              <VerificationFields
                key={docFormKey}
                values={verification}
                stored={{
                  doc_business_reg: agent.doc_business_reg,
                  doc_licence: agent.doc_licence,
                  doc_owner_id: agent.doc_owner_id,
                  doc_office_photo: agent.doc_office_photo,
                }}
                onChange={(key, value) => setVerification((current) => ({ ...current, [key]: value }))}
                onFile={(key, file) => setDocFiles((current) => ({ ...current, [key]: file ?? undefined }))}
              />
              <button className="agent-btn agent-btn--navy" type="submit" disabled={savingDocs}>
                {savingDocs ? t.common.saving : t.settings.saveDocs}
              </button>
            </form>
          </section>

          <section className="agent-card">
            <h2>{t.settings.login}</h2>
            <p className="agent-lead">{fill(t.settings.loginAs, { email: loginEmail })}</p>
            <div className="agent-form">
              <button className="agent-btn agent-btn--line" type="button" onClick={() => { setError(""); setPanel("email") }}>
                {t.settings.changeEmail}
              </button>
              <button className="agent-btn agent-btn--line" type="button" onClick={sendPasswordCode} disabled={sendingCode}>
                {sendingCode ? t.common.sending : t.settings.changePassword}
              </button>
            </div>

            {panel === "email" ? (
              <form className="agent-form" onSubmit={changeEmail} style={{ marginTop: 16 }}>
                <label>
                  {t.settings.newEmail}
                  <input type="email" value={nextEmail} onChange={(event) => setNextEmail(event.target.value)} required autoComplete="email" />
                </label>
                <label>
                  {t.settings.currentPassword}
                  <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
                </label>
                <button className="agent-btn agent-btn--navy" type="submit" disabled={accountLoading}>
                  {accountLoading ? t.common.saving : t.settings.saveEmail}
                </button>
              </form>
            ) : null}

            {panel === "code" ? (
              <form className="agent-form" onSubmit={verifyPasswordCode} style={{ marginTop: 16 }}>
                <p className="agent-lead">{fill(t.settings.codeLead, { email: loginEmail })}</p>
                <label>
                  {t.reset.code}
                  <input value={code} onChange={(event) => setCode(event.target.value)} required inputMode="numeric" autoComplete="one-time-code" />
                </label>
                <button className="agent-btn agent-btn--navy" type="submit" disabled={accountLoading}>
                  {accountLoading ? t.reset.verifying : t.reset.verify}
                </button>
                <button className="agent-text-btn" type="button" onClick={sendPasswordCode} disabled={sendingCode || cooldown > 0}>
                  {cooldown > 0 ? fill(t.reset.resendIn, { seconds: cooldown }) : t.reset.resend}
                </button>
              </form>
            ) : null}

            {panel === "password" ? (
              <form className="agent-form" onSubmit={changePassword} style={{ marginTop: 16 }}>
                <label>
                  {t.reset.newPassword}
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete="new-password" />
                </label>
                <label>
                  {t.reset.confirmPassword}
                  <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={6} autoComplete="new-password" />
                </label>
                <button className="agent-btn agent-btn--navy" type="submit" disabled={accountLoading}>
                  {accountLoading ? t.common.saving : t.reset.savePassword}
                </button>
            </form>
          ) : null}
          </section>

          <p className="agent-switch" style={{ marginTop: 28 }}>
            <a href="/account/delete">{t.settings.delete}</a>
          </p>
        </div>
      </section>
    </main>
  )
}
