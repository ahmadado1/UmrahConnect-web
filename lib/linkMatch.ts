// Helpers for the "Were you sent by …?" agent match (see app/api/agents/click and /match).
import { createHash } from "crypto"

/** The visitor's internet address, as Vercel passes it. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || ""
  return forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || ""
}

/** One-way scramble of the address: we can compare two visits, but never see the address. */
export function ipHash(ip: string) {
  const salt = process.env.LINK_MATCH_SALT || "umrahconnect-agent-match"
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex")
}

export const MATCH_WINDOW_MS = 24 * 60 * 60 * 1000
