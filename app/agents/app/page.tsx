import AppApplication from "./AppApplication"

export const metadata = {
  title: "Agency application | UmrahConnect",
  robots: { index: false, follow: false },
}

/** Opened inside the UmrahConnect app's browser: just the form, no website menu or footer. */
export default function AgentAppPage() {
  return <AppApplication />
}
