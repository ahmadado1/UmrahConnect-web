import type { Dictionary } from "@/lib/i18n/types"
import type { PlanId } from "@/lib/agentPlans"

export type PlanFeature = { text: string; soon?: boolean }

/** Name, summary and feature list for each plan, in the current language. */
export function planCopy(t: Dictionary): Record<PlanId, { name: string; summary: string; forWho: string; features: PlanFeature[] }> {
  const a = t.agentsPage
  return {
    listed: {
      name: a.listed,
      summary: a.listedSummary,
      forWho: a.listedFor,
      features: [
        { text: a.listed1 },
        { text: a.listed2 },
        { text: a.listed3 },
        { text: a.listed4 },
        { text: a.listed5 },
      ],
    },
    featured: {
      name: a.featured,
      summary: a.featuredSummary,
      forWho: a.featuredFor,
      features: [
        { text: a.featured1 },
        { text: a.featured2 },
        { text: a.featured3 },
        { text: a.featured5, soon: true },
      ],
    },
  }
}
