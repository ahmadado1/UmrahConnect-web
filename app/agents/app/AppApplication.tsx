"use client"

import { useEffect, useState } from "react"
import { isLang } from "@/lib/i18n/languages"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import SignupForm from "../signup/SignupForm"

/**
 * The agency application inside the app (in-app browser).
 * 1. Logs the person in with the one-time link from the app (#th=…), then removes it from the address.
 * 2. Uses the app's language (#lang=…).
 * 3. Shows only the forms: agency details, then documents (PDF, photos or camera).
 * When they finish (or tap "later"), the form sends them back to the app.
 */
export default function AppApplication() {
  const { t, setLang } = useT()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const lang = params.get("lang")
      if (isLang(lang)) setLang(lang)

      const tokenHash = params.get("th")
      // Remove the one-time link from the address straight away
      window.history.replaceState(null, "", window.location.pathname)

      if (tokenHash) {
        try {
          const { error } = await getSupabase().auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" })
          if (error) console.error("App login link failed", error.message)
        } catch (err) {
          console.error(err)
        }
      }
      if (!cancelled) setReady(true)
    }
    start()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) {
    return (
      <main className="agent-page">
        <p className="agent-status-line">{t.signup.loading}</p>
      </main>
    )
  }
  return <SignupForm inApp />
}
