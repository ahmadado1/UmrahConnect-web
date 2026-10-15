import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export function getSupabase() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local")
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return browserClient
}

/**
 * After Google sends someone back, the login details (or an error) are in the address bar.
 * This waits until Supabase has read them, instead of deciding "not logged in" too early.
 * Returns { session, error }: error is Google's/Supabase's message if the login failed.
 */
export async function waitForSession(timeoutMs = 5000) {
  const supabase = getSupabase()
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const query = new URLSearchParams(window.location.search)
  const urlError = hash.get("error_description") || query.get("error_description") || hash.get("error") || query.get("error")
  if (urlError) {
    let message = urlError.replace(/\+/g, " ")
    try {
      message = decodeURIComponent(message)
    } catch {
      // keep as is
    }
    return { session: null, error: message }
  }

  // Newer login style (?code=...): swap the code for a session ourselves.
  const code = query.get("code")
  if (code) {
    await supabase.auth.exchangeCodeForSession(code).catch(() => undefined)
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session) return { session, error: "" }

  // Only wait when we are coming back from a login.
  const comingBack = Boolean(code) || hash.has("access_token")
  if (!comingBack) return { session: null, error: "" }

  return new Promise<{ session: import("@supabase/supabase-js").Session | null; error: string }>((resolve) => {
    const timer = window.setTimeout(() => {
      subscription.unsubscribe()
      resolve({ session: null, error: "" })
    }, timeoutMs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!next) return
      window.clearTimeout(timer)
      subscription.unsubscribe()
      resolve({ session: next, error: "" })
    })
  })
}
