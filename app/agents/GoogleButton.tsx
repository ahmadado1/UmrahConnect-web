"use client"

import { useState } from "react"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import { WIZARD_CSS } from "./agentStyles"

/** "Continue with Google". After Google, the user comes back to /agents/signup,
 * which sends them to the right step (or to Agent Home if everything is done). */
export default function GoogleButton({ onError, next = "/agents/signup" }: { onError: (message: string) => void; next?: string }) {
  const { t } = useT()
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${next}` },
      })
      if (error) {
        onError(t.signup.googleError)
        setBusy(false)
      }
    } catch {
      onError(t.signup.googleError)
      setBusy(false)
    }
  }

  return (
    <>
      <style>{WIZARD_CSS}</style>
      <button className="agent-google-btn" type="button" onClick={go} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.5 5.8c4.4-4 6.8-10 6.8-17.2z" />
          <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6C6.6 42.6 14.6 48 24 48z" />
        </svg>
        {t.signup.google}
      </button>
    </>
  )
}
