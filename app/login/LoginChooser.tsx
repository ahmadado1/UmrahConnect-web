"use client"

import { useT } from "@/lib/i18n/I18nProvider"

/** "Log in" in the menu: pilgrims go to /account, agencies go to Agent Zone. */
export default function LoginChooser() {
  const { t } = useT()
  const a = t.account
  return (
    <main className="agent-page">
      <style>{`
        .login-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 24px; }
        .login-choice { display: block; text-decoration: none; background: #fff; border: 2px solid rgba(30,58,95,0.1); border-radius: 18px; padding: 24px; color: #1e3a5f; box-shadow: 0 10px 28px rgba(30,58,95,0.06); }
        .login-choice:hover { border-color: #c9a84c; }
        .login-choice span { font-size: 32px; }
        .login-choice h2 { margin: 10px 0 6px; color: #1e3a5f; }
        .login-choice p { margin: 0; color: #5c6b7a; line-height: 1.5; }
      `}</style>
      <section className="agent-section">
        <div className="agent-narrow">
          <h1>{a.chooserTitle}</h1>
          <p className="agent-lead">{a.chooserLead}</p>
          <div className="login-choices">
            <a className="login-choice" href="/account/login">
              <span aria-hidden="true">🕋</span>
              <h2>{a.pilgrimTitle}</h2>
              <p>{a.pilgrimBody}</p>
            </a>
            <a className="login-choice" href="/agents/login">
              <span aria-hidden="true">🧳</span>
              <h2>{a.agencyTitle}</h2>
              <p>{a.agencyBody}</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
