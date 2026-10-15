import { getSupabase } from "@/lib/supabaseBrowser"
import type { Lang } from "./languages"

export async function persistAgentLanguage(lang: Lang) {
  try {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const id = session.user.id
    await supabase.from("agents").update({ language: lang }).or(`owner_user_id.eq.${id},user_id.eq.${id}`)
  } catch {
    // The language column is added by supabase/agent-language.sql.
  }
}
