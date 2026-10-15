"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { loadOwnAgent } from "@/lib/agentAccount"
import { getSupabase } from "@/lib/supabaseBrowser"

export default function AgentsEntry() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    async function redirectAgent() {
      try {
        const supabase = getSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || cancelled) return
        const agent = await loadOwnAgent(supabase)
        if (!cancelled && agent) router.replace("/agents/home")
      } catch {
        // Stay on the public page when the account check fails.
      }
    }
    redirectAgent()
    return () => {
      cancelled = true
    }
  }, [router])

  return null
}
