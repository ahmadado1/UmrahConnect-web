import type { OwnAgent } from "@/lib/agentAccount"

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  expired: "Expired",
  suspended: "Suspended",
}

export function planLabel(plan: string | null) {
  if (plan === "featured" || plan === "pro") return "Featured"
  return "Listed"
}

export function formatDate(value: string | null) {
  if (!value) return "Not set"
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export function dateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function oneMonthFrom(value?: string | null) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const base = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : today
  const start = !Number.isNaN(base.getTime()) && base > today ? base : today
  const next = new Date(start)
  next.setMonth(next.getMonth() + 1)
  return dateInputValue(next)
}

/** Active listing with a paid-until date. Pending, expired, suspended, and never-paid stay out. */
export function isActiveAgent(agent: Pick<OwnAgent, "status" | "paid_until">) {
  return (agent.status || "").toLowerCase() === "active" && Boolean(agent.paid_until)
}

export function agentHomeMode(agent: Pick<OwnAgent, "status" | "paid_until">) {
  const status = (agent.status || "pending").toLowerCase()
  if (status === "pending") return "pending" as const
  if (status === "suspended") return "suspended" as const
  if (isActiveAgent(agent)) return "active" as const
  return "pay" as const
}
