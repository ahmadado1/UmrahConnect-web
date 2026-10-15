"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { loadOwnAgent } from "@/lib/agentAccount"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import GoogleButton from "../GoogleButton"
import PhoneLogin from "../PhoneLogin"

export default function LoginForm() {
  const { t } = useT()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (signInError) {
        setError(signInError.message)
        return
      }
      let agent = null
      let loadError: unknown = null
      try {
        agent = await loadOwnAgent(supabase)
      } catch (err) {
        loadError = err
      }
      if (agent) {
        router.replace("/agents/home")
        return
      }
      const userId = data.user?.id
      const { data: profile } = userId
        ? await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
        : { data: null }
      if (profile?.role === "admin") {
        router.replace("/agents/home")
        return
      }
      if (loadError) {
        setError(loadError instanceof Error ? loadError.message : t.login.loadError)
        return
      }
      router.replace("/agents/signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.login.label}</div>
          <h1>{t.login.title}</h1>
          <p className="agent-lead">{t.login.lead}</p>
          {error ? <p className="agent-error">{error}</p> : null}
          <GoogleButton onError={setError} />
              <PhoneLogin onError={setError} />
              <div className="agent-or">{t.signup.or}</div>
          <form className="agent-form" onSubmit={signIn}>
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
              {t.login.forgot}
            </button>
            <p className="agent-switch">
              {t.login.newAgency} <a href="/agents/signup">{t.agentsPage.become}</a>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
