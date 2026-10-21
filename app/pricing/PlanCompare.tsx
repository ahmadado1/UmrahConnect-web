"use client"

import { useT } from "@/lib/i18n/I18nProvider"

/** Free vs Premium table under the plan cards on /pricing. Keep it in step with what the app really does. */
const CSS = `
.compare-wrap { margin: 36px 0 8px; }
.compare-wrap h2 { color: #1e3a5f; margin: 0 0 6px; }
.compare-wrap > p { color: #5c6b7a; margin: 0 0 16px; }
.compare-scroll { overflow-x: auto; border-radius: 18px; border: 1px solid rgba(30,58,95,0.12); background: #fff; }
.compare-table { width: 100%; border-collapse: collapse; min-width: 520px; font-size: 15px; }
.compare-table th, .compare-table td { padding: 12px 16px; text-align: start; border-bottom: 1px solid rgba(30,58,95,0.08); }
.compare-table thead th { background: #1e3a5f; color: #fff; font-weight: 800; }
.compare-table thead th:last-child { background: #c9a84c; color: #1e3a5f; }
.compare-table td:nth-child(2), .compare-table td:nth-child(3), .compare-table th:nth-child(2), .compare-table th:nth-child(3) { text-align: center; }
.compare-table td:nth-child(3) { background: rgba(201,168,76,0.08); font-weight: 700; color: #1e3a5f; }
.compare-table td:nth-child(2) { color: #5c6b7a; }
.compare-table tr:last-child td { border-bottom: 0; }
.compare-soon { display: inline-block; margin-inline-start: 6px; padding: 1px 8px; border-radius: 999px; background: #f3ead2; color: #8a6d1f; font-size: 11px; font-weight: 700; }
`

export default function PlanCompare() {
  const { t } = useT()
  const a = t.account
  // [feature, free, premium, premium is "coming soon"]
  const rows: [string, string, string, boolean?][] = [
    [a.rPrayer, a.vYes, a.vYes],
    [a.rAdhan, a.v3Voices, a.vMoreVoices],
    [a.rQuran, a.vYes, a.vYes],
    [a.rFonts, a.v2Fonts, a.v6Fonts],
    [a.rVerseAudio, a.vAllReciters, a.vAllReciters],
    [a.rListen, a.vAllReciters, a.vAllReciters],
    [a.rPlayer, a.vBig, a.vBig],
    [a.rResume, a.vNo, a.vYes],
    [a.rKahfMulk, a.vRead, a.vReadListen],
    [a.rReminders, a.vSimple, a.vGuided],
    [a.rSalawat, a.vNo, a.vYes],
    [a.rAi, a.v12Week, a.vUnlimited],
    [a.rTrip, a.vNo, a.vYes],
    [a.rOffline, a.vNo, a.vYes],
    [a.rGuide, a.vYes, a.vYes],
    [a.rDuas, a.vYes, a.vYes],
    [a.rMaps, a.vYes, a.vYes],
    [a.rServices, a.vYes, a.vYes],
  ]
  return (
    <section className="compare-wrap">
      <style>{CSS}</style>
      <h2>{a.compareTitle}</h2>
      <p>{a.compareLead}</p>
      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th>{a.colFeature}</th>
              <th>{a.colFree}</th>
              <th>⭐ {a.colPremium}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, free, premium, soon]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{free}</td>
                <td>
                  {premium}
                  {soon ? <span className="compare-soon">{a.soon}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
