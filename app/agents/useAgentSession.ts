"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadOwnAgent, type OwnAgent } from "@/lib/agentAccount"
import { getSupabase } from "@/lib/supabaseBrowser"

export function useAgentSession() {
  const router = useRouter()
  const [agent, setAgent] = useState<OwnAgent | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace("/agents/login")
      return null
    }
    setLoginEmail(session.user.email || "")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle()
    const admin = profile?.role === "admin"
    setIsAdmin(admin)
    let row: OwnAgent | null = null
    try {
      row = await loadOwnAgent(supabase)
    } catch (err) {
      if (!admin) throw err
    }
    if (!row) {
      setAgent(null)
      if (!admin) router.replace("/agents/signup")
      return null
    }
    setAgent(row)
    return row
  }, [router])

  useEffect(() => {
    let cancelled = false
    refresh()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your agency.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  return { agent, loginEmail, isAdmin, loading, error, setError, refresh }
}
