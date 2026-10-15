"use client"

import { HOW_FAQ_CSS } from "./agentStyles"

import { Reveal } from "../component/Reveal"
import { useT } from "@/lib/i18n/I18nProvider"

const ICONS = ["📝", "📄", "✓", "💳", "📲", "🔁"]

/** Six numbered steps that slide in one after another as you scroll. */
export default function AgentHowItWorks({ compact = false, done }: { compact?: boolean; done?: boolean[] }) {
  const { t } = useT()
  const how = t.agentHow
  const current = done ? done.findIndex((value) => !value) : -1
  return (
    <section id="how" className={compact ? "agent-how agent-how--compact" : "agent-section agent-how"}>
      <style>{HOW_FAQ_CSS}</style>
      <div className={compact ? "" : "page-container"}>
        {compact ? <h2>{how.title}</h2> : (
          <Reveal slideFrom="up">
            <h2>{how.title}</h2>
            <p className="agent-lead">{how.lead}</p>
          </Reveal>
        )}
        <ol className="agent-how-steps">
          {how.steps.map((step, index) => (
            <Reveal
              key={step.title}
              as="li"
              slideFrom="up"
              delay={index * 140}
              className={`agent-how-step${done?.[index] ? " agent-how-step--done" : ""}${index === current ? " agent-how-step--current" : ""}`}
            >
              <span className="agent-how-num" aria-hidden="true">
                <span className="agent-how-icon">{done?.[index] ? "✓" : ICONS[index]}</span>
                <span className="agent-how-digit">{index + 1}</span>
              </span>
              <div>
                <h3>
                  {step.title}
                  {done?.[index] ? <span className="agent-how-flag agent-how-flag--done">{how.done}</span> : null}
                  {index === current ? <span className="agent-how-flag agent-how-flag--next">{how.next}</span> : null}
                </h3>
                <p>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
