"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase, waitForSession } from "@/lib/supabaseBrowser"
import GoogleButton from "@/app/agents/GoogleButton"
import PhoneLogin from "@/app/agents/PhoneLogin"

/** Pilgrim login: same account as the app (Google, phone SMS, or email + password). */
export default function AccountLogin() {
  const { t } = useT()
  const a = t.account
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  // Already logged in? Go to the account page. Came back from Google with an error? Show it.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("error")
    waitForSession().then(({ session, error: loginError }) => {
      if (session) {
        router.replace("/account")
        return
      }
      const message = loginError || fromUrl
      if (message) setError(`${t.signup.googleError} (${message})`)
    })
  }, [router, t.signup.googleError])

  async function submit(event: FormEvent) {
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
      const cleanEmail = email.trim().toLowerCase()
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (signInError) {
          setError(signInError.message)
          return
        }
        router.replace("/account")
        return
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account/login`,
          data: { full_name: name.trim(), user_type: "pilgrim" },
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
      router.replace("/account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <h1>{mode === "login" ? a.loginTitle : a.signupTitle}</h1>
          <p className="agent-lead">{mode === "login" ? a.loginLead : a.signupLead}</p>
          {error ? <p className="agent-error">{error}</p> : null}
          {notice ? <p className="agent-note">{notice}</p> : null}

          <GoogleButton onError={setError} next="/account" />
          <PhoneLogin onError={setError} next="/account" />
          <div className="agent-or">{t.signup.or}</div>

          <form className="agent-form" onSubmit={submit}>
            {mode === "signup" ? (
              <label>
                {a.fullName}
                <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
              </label>
            ) : null}
            <label>
              {t.common.email}
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label>
              {t.common.password}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
            <button className="agent-btn agent-btn--navy" type="submit" disabled={loading}>
              {loading ? t.common.pleaseWait : mode === "login" ? t.common.logIn : t.signup.create}
            </button>
            {mode === "login" ? (
              <button className="agent-text-btn" type="button" onClick={() => router.push("/agents/reset-password")}>
                {t.login.forgot}
              </button>
            ) : null}
            <p className="agent-switch">
              {mode === "login" ? a.noAccount : a.haveAccount}{" "}
              <button className="agent-text-btn" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? a.createOne : t.common.logIn}
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
