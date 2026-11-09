"use client"

// Page behind every agent link and agent QR code: https://myumrahconnect.com/a/AGT-XXXXXX
//
// What happens when a pilgrim scans an agent's QR:
//  - App already installed  -> the phone opens the app directly (thanks to the files in /public/.well-known),
//                              so this page never even loads.
//  - Android, no app        -> we send them to Google Play with the agent code hidden in the link.
//                              Google hands that code to the app after install, so the agent is linked automatically.
//  - iPhone, no app         -> Apple can't carry the code through the App Store, so we show the code big,
//                              copy it for them, then open the App Store. They paste it when signing up.
//  - Computer               -> agency details and both store buttons.

import { useEffect, useState } from "react"
import { fill, useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import VerifiedCheck from "@/app/agents/VerifiedCheck"

const APP_STORE = "https://apps.apple.com/app/id6778753426"
const PLAY_PACKAGE = "com.myumrahconnect.app"

/** Google Play link that carries the agent code into the app after install. */
function playStoreLink(code: string) {
  const referrer = encodeURIComponent(`agent_code=${code}`)
  return `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&referrer=${referrer}`
}

type Device = "ios" | "android" | "desktop" | null

/** Works out which kind of phone (or computer) opened the page. */
function detectDevice(): Device {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return "android"
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  // New iPads say "Macintosh" but have a touch screen
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios"
  return "desktop"
}

type PublicAgent = {
  business_name: string | null
  country: string | null
  cities: string[] | null
  description: string | null
  agent_code: string | null
  plan: string | null
  verified: boolean | null
}

export default function AgentCodeCard({ code }: { code: string }) {
  const { t } = useT()
  const [agent, setAgent] = useState<PublicAgent | null>(null)
  const [missing, setMissing] = useState(false)
  const [device, setDevice] = useState<Device>(null)
  const [copied, setCopied] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const agentCode = agent?.agent_code || code

  // 1. Which device is this?
  useEffect(() => {
    setDevice(detectDevice())
  }, [])

  // 2. Load the agency's public details
  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("active_agents")
        .select("business_name, country, cities, description, agent_code, plan, verified")
        .eq("agent_code", code)
        .limit(1)
      if (cancelled) return
      if (error || !data?.[0]) {
        setMissing(true)
        return
      }
      setAgent(data[0] as PublicAgent)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [code])

  // 2b. On a phone: remember this visit for 24 h, so after installing from the App Store the app
  //     can ask "Were you sent by <agency>?" (iPhone can't pass the code through the store).
  useEffect(() => {
    if (!agent || (device !== "ios" && device !== "android")) return
    void fetch("/api/agents/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: agent.agent_code || code }),
      keepalive: true,
    }).catch(() => {})
  }, [agent, device, code])

  // 3. Android: once we know the agency, go straight to Google Play with the code attached
  useEffect(() => {
    if (device !== "android" || !agent) return
    setRedirecting(true)
    const timer = setTimeout(() => {
      window.location.href = playStoreLink(agentCode)
    }, 1200) // short pause so they see which agency they are joining
    return () => clearTimeout(timer)
  }, [device, agent, agentCode])

  /** iPhone: copy the code, then open the App Store. */
  async function copyAndDownload() {
    try {
      await navigator.clipboard.writeText(agentCode)
      setCopied(true)
    } catch {
      // Copy can fail in some browsers; the code is still shown big on the page.
    }
    setTimeout(() => {
      window.location.href = APP_STORE
    }, 700)
  }

  return (
    <main className="agent-page">
      <section className="agent-section">
        <div className="agent-narrow">
          <div className="section-label">{t.code.label}</div>

          {/* Agency details */}
          {agent ? (
            <>
              <h1>
                {agent.business_name || t.code.fallback}
                {agent.verified ? <VerifiedCheck /> : null}
              </h1>
              <p className="agent-code-display">{agentCode}</p>
              <p className="agent-lead">
                {[agent.country, ...(agent.cities ?? [])].filter(Boolean).join(" · ")}
              </p>
              {agent.description ? <p>{agent.description}</p> : null}
              <p className="agent-lead">
                {device === "ios" ? fill(t.code.afterInstall, { code: agentCode }) : t.code.join}
              </p>
            </>
          ) : missing ? (
            <>
              <h1>{fill(t.code.missingTitle, { code })}</h1>
              <p className="agent-lead">{t.code.missing}</p>
            </>
          ) : (
            <p className="agent-status-line">{t.common.loading}</p>
          )}

          {/* Buttons, depending on the device */}
          {agent && device === "android" ? (
            <>
              {redirecting ? <p className="agent-status-line">{t.code.redirecting}</p> : null}
              <a className="agent-btn agent-btn--gold" href={playStoreLink(agentCode)} style={{ marginInlineEnd: 10 }}>
                {t.code.download}
              </a>
              <a className="agent-btn agent-btn--navy" href={`umrahconnect://a/${encodeURIComponent(agentCode)}`}>
                {t.code.openApp}
              </a>
            </>
          ) : null}

          {agent && device === "ios" ? (
            <>
              {copied ? <p className="agent-status-line">{t.code.copied}</p> : null}
              <button type="button" className="agent-btn agent-btn--gold" onClick={copyAndDownload} style={{ marginInlineEnd: 10 }}>
                {t.code.copyDownload}
              </button>
              <a className="agent-btn agent-btn--navy" href={`umrahconnect://a/${encodeURIComponent(agentCode)}`}>
                {t.code.openApp}
              </a>
            </>
          ) : null}

          {agent && device === "desktop" ? (
            <>
              <a className="agent-btn agent-btn--gold" href={APP_STORE} style={{ marginInlineEnd: 10 }}>
                App Store
              </a>
              <a className="agent-btn agent-btn--navy" href={playStoreLink(agentCode)}>
                Google Play
              </a>
            </>
          ) : null}

          {/* Unknown code: still let them get the app */}
          {missing ? (
            <a
              className="agent-btn agent-btn--navy"
              href={device === "android" ? playStoreLink(code) : device === "ios" ? APP_STORE : "/#download"}
            >
              {t.code.download}
            </a>
          ) : null}
        </div>
      </section>
    </main>
  )
}
