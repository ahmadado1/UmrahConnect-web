"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"

export default function DeleteAccount() {
  const { t } = useT()
  const router = useRouter()
  const finished = useRef(false)
  const [phase, setPhase] = useState<"loading" | "login" | "confirm" | "done">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (finished.current) return
      setEmail(session?.user.email || "")
      setPhase(session?.user ? "confirm" : "login")
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }
      setEmail(email.trim().toLowerCase())
      setPhase("confirm")
    } finally {
      setLoading(false)
    }
  }

  async function deleteAccount(event: FormEvent) {
    event.preventDefault()
    setError("")
    if (confirmation !== "DELETE") {
      setError(t.delete.confirmWord)
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setPhase("login")
        setError(t.delete.loginAgain)
        return
      }
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof body.error === "string" ? body.error : t.delete.failed)
        return
      }
      finished.current = true
      await supabase.auth.signOut().catch(() => undefined)
      setPhase("done")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.delete.label}</div>
          <h1>{t.delete.title}</h1>
          {error ? <p className="agent-error">{error}</p> : null}
          {phase === "loading" ? <p className="agent-status-line">{t.common.loading}</p> : null}
          {phase === "login" ? (
            <form className="agent-form" onSubmit={signIn}>
              <p className="agent-lead">{t.delete.loginLead}</p>
              <label>
                {t.common.email}
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
              <label>
                {t.common.password}
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
              </label>
              <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
                {loading ? t.common.pleaseWait : t.common.logIn}
              </button>
              <button className="agent-text-btn" type="button" onClick={() => router.push("/agents/reset-password")}>
                {t.delete.forgot}
              </button>
            </form>
          ) : null}
          {phase === "confirm" ? (
            <form className="agent-form" onSubmit={deleteAccount}>
              <p className="agent-lead">{email}</p>
              <p className="agent-error">{t.delete.warning}</p>
              <label>
                {t.delete.typeDelete}
                <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
              </label>
              <button className="agent-btn agent-btn--danger" type="submit" disabled={loading || confirmation !== "DELETE"}>
                {loading ? t.delete.deleting : t.delete.button}
              </button>
            </form>
          ) : null}
          {phase === "done" ? (
            <>
              <p className="agent-note">{t.delete.done}</p>
              <p className="agent-switch"><a href="/">{t.common.home}</a></p>
            </>
          ) : null}
        </div>
      </section>
    </main>
  )
}
