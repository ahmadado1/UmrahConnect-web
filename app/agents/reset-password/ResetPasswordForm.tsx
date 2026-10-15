"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"

export default function ResetPasswordForm() {
  const { t } = useT()
  const router = useRouter()
  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [updated, setUpdated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (!updated) return
    const timer = window.setTimeout(() => router.replace("/agents/login"), 1200)
    return () => window.clearTimeout(timer)
  }, [updated, router])

  async function sendCode(event?: FormEvent) {
    event?.preventDefault()
    setError("")
    const cleanEmail = email.trim().toLowerCase()
    console.log(cleanEmail)
    setLoading(true)
    try {
      const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(cleanEmail)
      if (resetError) {
        setError(resetError.message)
        return
      }
      setEmail(cleanEmail)
      setStep("code")
      setCooldown(60)
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "recovery",
      })
      if (verifyError) {
        setError(verifyError.message)
        return
      }
      setStep("password")
    } finally {
      setLoading(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (password.length < 6) {
      setError(t.reset.shortPassword)
      return
    }
    if (password !== confirm) {
      setError(t.reset.mismatch)
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setUpdated(true)
    } finally {
      setLoading(false)
    }
  }

  const title = step === "password" ? t.reset.choose : step === "code" ? t.reset.enterCode : t.reset.reset

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.reset.label}</div>
          <h1>{title}</h1>
          {error ? <p className="agent-error">{error}</p> : null}
          {updated ? (
            <p className="agent-note">{t.reset.updated}</p>
          ) : step === "email" ? (
            <form className="agent-form" onSubmit={sendCode}>
              <p className="agent-lead">{t.reset.emailLead}</p>
              <label>
                {t.common.email}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                {loading ? t.common.sending : t.reset.sendCode}
              </button>
            </form>
          ) : step === "code" ? (
            <form className="agent-form" onSubmit={verifyCode}>
              <p className="agent-lead">{fill(t.reset.codeLead, { email })}</p>
              <label>
                {t.reset.code}
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                {loading ? t.reset.verifying : t.reset.verify}
              </button>
              <button className="agent-text-btn" type="button" onClick={() => sendCode()} disabled={loading || cooldown > 0}>
                {cooldown > 0 ? fill(t.reset.resendIn, { seconds: cooldown }) : t.reset.resend}
              </button>
            </form>
          ) : (
            <form className="agent-form" onSubmit={savePassword}>
              <label>
                {t.reset.newPassword}
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete="new-password" />
              </label>
              <label>
                {t.reset.confirmPassword}
                <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={6} autoComplete="new-password" />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                {loading ? t.common.saving : t.reset.savePassword}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
