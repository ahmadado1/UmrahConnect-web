"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"

/**
 * "Continue with phone" — same SMS login as the app (Supabase + Twilio).
 * Step 1: type the number → we send a 6-digit code.  Step 2: type the code → logged in.
 * After that, /agents/signup sends the person to the right place (agency details, documents or Agent Home).
 */
export default function PhoneLogin({ onError, next = "/agents/signup" }: { onError: (message: string) => void; next?: string }) {
  const { t } = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"number" | "code">("number")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)

  // "+234 803-123 4567" → "+2348031234567"
  function cleanPhone(value: string) {
    const digits = value.replace(/[^\d+]/g, "")
    return digits.startsWith("00") ? `+${digits.slice(2)}` : digits
  }

  async function sendCode(event?: FormEvent) {
    event?.preventDefault()
    onError("")
    const number = cleanPhone(phone)
    if (!/^\+\d{8,15}$/.test(number)) {
      onError(t.signup.phoneInvalid)
      return
    }
    setBusy(true)
    try {
      const { error } = await getSupabase().auth.signInWithOtp({ phone: number })
      if (error) {
        onError(error.message)
        return
      }
      setPhone(number)
      setCode("")
      setStep("code")
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    onError("")
    setBusy(true)
    try {
      const { error } = await getSupabase().auth.verifyOtp({ phone, token: code.trim(), type: "sms" })
      if (error) {
        onError(t.signup.codeInvalid)
        return
      }
      router.replace(next)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className="agent-google-btn" type="button" onClick={() => setOpen(true)} style={{ marginTop: 10 }}>
        <span aria-hidden="true">📱</span>
        {t.signup.phoneBtn}
      </button>
    )
  }

  return (
    <div className="agent-card" style={{ marginTop: 10 }}>
      {step === "number" ? (
        <form className="agent-form" onSubmit={sendCode}>
          <label>
            {t.signup.phoneNumber}
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+234…"
              autoComplete="tel"
              required
            />
          </label>
          <p className="agent-switch" style={{ margin: 0 }}>{t.signup.phoneHint}</p>
          <button className="agent-btn agent-btn--navy" type="submit" disabled={busy}>
            {busy ? t.common.pleaseWait : t.signup.sendCode}
          </button>
        </form>
      ) : (
        <form className="agent-form" onSubmit={verifyCode}>
          <p className="agent-note" style={{ margin: 0 }}>{fill(t.signup.codeSent, { phone })}</p>
          <label>
            {t.signup.codeLabel}
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
              minLength={6}
            />
          </label>
          <button className="agent-btn agent-btn--navy" type="submit" disabled={busy || code.length < 6}>
            {busy ? t.common.pleaseWait : t.signup.verifyCode}
          </button>
          <div className="agent-form-actions">
            <button className="agent-text-btn" type="button" disabled={busy} onClick={() => sendCode()}>
              {t.signup.resendCode}
            </button>
            <button className="agent-text-btn" type="button" disabled={busy} onClick={() => setStep("number")}>
              {t.signup.changeNumber}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
