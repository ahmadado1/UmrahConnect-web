"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { loadOwnAgent } from "@/lib/agentAccount"
import { useT } from "@/lib/i18n/I18nProvider"
import { getSupabase } from "@/lib/supabaseBrowser"
import LanguagePicker from "../../component/LanguagePicker"
import VerifiedCheck from "../VerifiedCheck"

export default function AgentZoneShell({ children }: { children: React.ReactNode }) {
  const { t } = useT()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [verified, setVerified] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    let cancelled = false
    async function loadName() {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || cancelled) return
        if (!cancelled) setEmail(session.user.email || "")
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle()
        if (!cancelled) setIsAdmin(profile?.role === "admin")
        const agent = await loadOwnAgent(supabase)
        if (!cancelled) {
          setBusinessName(agent?.business_name || "")
          setVerified(Boolean(agent?.verified))
        }
      } catch {
        if (!cancelled) {
          setBusinessName("")
          setVerified(false)
        }
      }
    }
    loadName()
    return () => {
      cancelled = true
    }
  }, [pathname])

  async function logOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.replace("/agents/login")
  }

  const links = [
    { href: "/agents/home", label: t.zone.home },
    { href: "/agents/dashboard", label: t.zone.dashboard },
    { href: "/agents/billing", label: t.pay.tab },
    { href: "/agents/settings", label: t.zone.settings },
    ...(isAdmin ? [{ href: "/admin/agents", label: t.zone.admin }] : []),
  ]
  const displayName = businessName || email

  const tabs = (
    <>
      {links.map((link) => (
        <a key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </a>
      ))}
    </>
  )

  const identity = displayName || isAdmin ? (
    <span className="agent-zone-identity">
      {displayName ? <span className="agent-zone-name">{displayName}</span> : null}
      {verified && businessName ? <VerifiedCheck /> : null}
      {isAdmin ? <span className="agent-zone-badge">Admin</span> : null}
    </span>
  ) : null

  return (
    <div className="agent-zone">
      <style>{`
        .agent-zone-header { background: #1E3A5F; color: #fff; position: sticky; top: 0; z-index: 50; }
        .agent-zone-header a, .agent-zone-header button { color: #fff; background: transparent; text-decoration: none; }
        .agent-zone-header-inner { width: min(1100px, calc(100% - 32px)); margin: 0 auto; min-height: 64px; display: flex; align-items: center; gap: 20px; }
        .agent-zone-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; font-weight: 700; color: #fff; }
        .agent-zone-brand img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
        .agent-zone-tabs { display: flex; align-items: center; gap: 4px; }
        .agent-zone-tabs a, .agent-zone-menu a { padding: 10px 14px; border-bottom: 2px solid transparent; font-weight: 650; font-size: 15px; color: #fff; }
        .agent-zone-header a[aria-current="page"] { color: #C9A84C; border-bottom-color: #C9A84C; }
        .agent-zone-side { margin-inline-start: auto; display: flex; align-items: center; gap: 16px; }
        .agent-zone-name { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: #fff; }
        .agent-zone-identity { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .agent-zone-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; background: #C9A84C; color: #1E3A5F; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; line-height: 1.4; }
        .agent-zone-header button { border: 1px solid rgba(255,255,255,0.55); border-radius: 999px; padding: 8px 16px; font: inherit; font-weight: 650; color: #fff; background: transparent; cursor: pointer; }
        .agent-zone-menu-btn, .agent-zone-menu { display: none; }
        @media (max-width: 760px) {
          .agent-zone-tabs, .agent-zone-side { display: none; }
          .agent-zone-menu-btn { display: inline-flex; margin-inline-start: auto; }
          .agent-zone-menu { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 8px 16px 16px; border-top: 1px solid rgba(255,255,255,0.15); }
        }
      `}</style>
      <header className="agent-zone-header">
        <div className="agent-zone-header-inner">
          <a className="agent-zone-brand" href="/agents/home">
            <img src="/logo.jpg" alt="" width={36} height={36} />
            <span>{t.zone.brand}</span>
          </a>
          <nav className="agent-zone-tabs" aria-label={t.zone.navLabel}>
            {tabs}
          </nav>
          <div className="agent-zone-side">
            {identity}
            <LanguagePicker />
            <button type="button" onClick={logOut}>{t.zone.logOut}</button>
          </div>
          <button
            type="button"
            className="agent-zone-menu-btn"
            aria-expanded={open}
            aria-controls="agent-zone-menu"
            onClick={() => setOpen((current) => !current)}
          >
          {t.zone.menu}
        </button>
      </div>
      {open ? (
        <div id="agent-zone-menu" className="agent-zone-menu">
          {tabs}
          {identity}
          <LanguagePicker />
          <button type="button" onClick={logOut}>{t.zone.logOut}</button>
          </div>
        ) : null}
      </header>
      {children}
    </div>
  )
}
