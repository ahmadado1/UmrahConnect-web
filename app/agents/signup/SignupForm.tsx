"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  agentWritePayload,
  citiesToText,
  emptyVerification,
  loadOwnAgent,
  uploadAgentDocument,
  uploadAgentLogo,
  verificationFromAgent,
  verificationGaps,
  verificationWritePayload,
  VERIFICATION_DOC_FIELDS,
  type AgentFormValues,
  type OwnAgent,
  type VerificationDocKey,
  type VerificationValues,
} from "@/lib/agentAccount"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase, waitForSession } from "@/lib/supabaseBrowser"
import VerificationFields from "../VerificationFields"
import GoogleButton from "../GoogleButton"
import PhoneLogin from "../PhoneLogin"
import { WIZARD_CSS } from "../agentStyles"

type Step = "account" | "details" | "docs"

const emptyForm: AgentFormValues = {
  businessName: "",
  ownerName: "",
  licenseNumber: "",
  country: "",
  cities: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  description: "",
}

function formFromAgent(agent: OwnAgent): AgentFormValues {
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

export default function SignupForm() {
  const { t, lang } = useT()
  const router = useRouter()
  const [step, setStep] = useState<Step>("account")
  const [fullName, setFullName] = useState("")
  const [accountEmail, setAccountEmail] = useState("")
  const [password, setPassword] = useState("")
  const [form, setForm] = useState<AgentFormValues>(emptyForm)
  const [agent, setAgent] = useState<OwnAgent | null>(null)
  const [verification, setVerification] = useState<VerificationValues>(emptyVerification)
  const [docFiles, setDocFiles] = useState<Partial<Record<VerificationDocKey, File>>>({})
  const [logo, setLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  // Where should this person be? No login → account. Logged in, no agency → details.
  // Agency saved but documents missing → documents. Everything sent → Agent Home.
  useEffect(() => {
    let cancelled = false
    async function resume() {
      try {
        const supabase = getSupabase()
        const { session, error: loginError } = await waitForSession()
        if (cancelled) return
        if (!session) {
          if (loginError) setError(`${t.signup.googleError} (${loginError})`)
          setChecking(false)
          return
        }
        const existing = await loadOwnAgent(supabase)
        if (cancelled) return
        if (existing) {
          if (verificationGaps(existing).length === 0) {
            router.replace("/agents/home")
            return
          }
          setAgent(existing)
          setForm(formFromAgent(existing))
          setVerification(verificationFromAgent(existing))
          setStep("docs")
        } else {
          const meta = session.user.user_metadata || {}
          setForm((current) => ({
            ...current,
            ownerName: current.ownerName || String(meta.full_name || meta.name || ""),
            email: current.email || session.user.email || "",
          }))
          setStep("details")
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t.signup.checkError)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    resume()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  function setField(key: keyof AgentFormValues, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Step 1: account
  async function createAccount(event: FormEvent) {
    event.preventDefault()
    setError("")
    setNotice("")
    if (password.length < 6) {
      setError(t.signup.shortPassword)
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const email = accountEmail.trim().toLowerCase()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/agents/login`,
          data: { full_name: fullName.trim(), user_type: "agent" },
        },
      })
      if (signUpError) {
        setError(signUpError.message.toLowerCase().includes("already") ? t.signup.already : signUpError.message)
        return
      }
      if (!data.session) {
        setNotice(t.signup.confirmEmail)
        return
      }
      setForm((current) => ({ ...current, ownerName: fullName.trim(), email }))
      setStep("details")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: agency details → saves the agency (pending) and sends "application received"
  async function saveDetails(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError(t.signup.loginAgain)
        setStep("account")
        return
      }
      await supabase.auth.updateUser({
        data: { user_type: "agent", full_name: form.ownerName.trim(), agency_name: form.businessName.trim() },
      })

      const logoUrl = logo ? await uploadAgentLogo(supabase, user.id, logo) : null
      const payload = agentWritePayload(form, logoUrl)
      const existing = agent ?? (await loadOwnAgent(supabase))

      if (existing) {
        const { error: updateError } = await supabase.from("agents").update(payload).eq("id", existing.id)
        if (updateError) throw new Error(updateError.message)
      } else {
        const { error: insertError } = await supabase.from("agents").insert({
          ...payload,
          owner_user_id: user.id,
          user_id: user.id,
          status: "pending",
          plan: "basic",
          verified: false,
          paid_until: null,
          language: lang,
        })
        if (insertError) throw new Error(insertError.message)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          fetch("/api/agents/email", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ type: "application_received" }),
          }).catch((emailError) => console.error(emailError))
        }
      }
      const saved = await loadOwnAgent(supabase)
      setAgent(saved)
      if (saved) setVerification(verificationFromAgent(saved))
      setStep("docs")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : t.signup.saveError)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: documents
  async function submitDocs(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (!agent) {
      setStep("details")
      return
    }
    const willHave = {
      licence_number: verification.licenceNumber,
      ...Object.fromEntries(
        VERIFICATION_DOC_FIELDS.map((field) => [field.key, docFiles[field.key] ? "new" : agent[field.key]]),
      ),
    } as Parameters<typeof verificationGaps>[0]
    if (verificationGaps(willHave).length > 0) {
      setError(t.signup.docsNeedAll)
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError(t.signup.loginAgain)
        setStep("account")
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
      router.replace("/agents/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : t.signup.saveError)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <main className="agent-page"><p className="agent-status-line">{t.signup.loading}</p></main>
  }

  const steps: { id: Step; label: string }[] = [
    { id: "account", label: t.signup.stepAccount },
    { id: "details", label: t.signup.stepDetails },
    { id: "docs", label: t.signup.stepDocs },
  ]
  const currentIndex = steps.findIndex((item) => item.id === step)

  return (
    <main className="agent-page">
      <style>{WIZARD_CSS}</style>
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.signup.label}</div>
          <h1>{t.signup.title}</h1>
          {step === "account" ? <p className="agent-lead">{t.signup.lead}</p> : null}

          <ol className="agent-steps">
            {steps.map((item, index) => (
              <li
                key={item.id}
                className={index < currentIndex ? "is-done" : index === currentIndex ? "is-current" : ""}
              >
                <span>{index < currentIndex ? "✓" : index + 1}</span>
                {item.label}
              </li>
            ))}
          </ol>

          {error ? <p className="agent-error">{error}</p> : null}
          {notice ? <p className="agent-note">{notice}</p> : null}

          {step === "account" ? (
            <>
              <GoogleButton onError={setError} />
              <PhoneLogin onError={setError} />
              <div className="agent-or">{t.signup.or}</div>
              <form className="agent-form" onSubmit={createAccount}>
                <label>
                  {t.signup.yourName}
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" />
                </label>
                <label>
                  {t.common.email}
                  <input type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} required autoComplete="email" />
                </label>
                <label>
                  {t.common.password}
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" minLength={6} />
                </label>
                <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                  {loading ? t.signup.creating : t.signup.create}
                </button>
                <p className="agent-switch">
                  {t.signup.haveAccount} <a href="/agents/login">{t.agentsPage.login}</a>
                </p>
              </form>
            </>
          ) : null}

          {step === "details" ? (
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
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} required autoComplete="tel" />
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
                <input value={form.website} onChange={(event) => setField("website", event.target.value)} placeholder="https://" />
              </label>
              <label>
                {t.signup.description}
                <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={4} />
              </label>
              <label>
                {t.signup.logo}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                {loading ? t.common.saving : t.signup.saveContinue}
              </button>
            </form>
          ) : null}

          {step === "docs" ? (
            <form className="agent-form" onSubmit={submitDocs}>
              <p className="agent-lead" style={{ margin: 0 }}>{t.signup.docsLead}</p>
              <VerificationFields
                values={verification}
                stored={agent ?? {}}
                onChange={(key, value) => setVerification((current) => ({ ...current, [key]: value }))}
                onFile={(key, file) => setDocFiles((current) => ({ ...current, [key]: file ?? undefined }))}
              />
              <div className="agent-form-actions">
                <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                  {loading ? t.common.saving : t.signup.submitDocs}
                </button>
                <button className="agent-text-btn" type="button" disabled={loading} onClick={() => router.replace("/agents/home")}>
                  {t.signup.later}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  )
}
