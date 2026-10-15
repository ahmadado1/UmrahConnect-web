"use client"

import { useT } from "@/lib/i18n/I18nProvider"

/** Terms of Service. Text lives in lib/i18n/<lang>.ts under legalDoc. */
export default function Terms() {
  const { t } = useT()
  const doc = t.legalDoc
  return (
    <div className="legal-page">
      <h1>{t.legal.terms}</h1>
      <p style={{ color: "#999", fontSize: "14px", marginBottom: "12px" }}>{doc.updated}</p>
      <p style={{ color: "#777", fontSize: "13px", marginBottom: "32px" }}>{doc.englishPrevails}</p>
      <p style={{ color: "#444", lineHeight: "1.8", marginBottom: "32px" }}>{doc.termsIntro}</p>
      {doc.terms.map((section) => (
        <div key={section.title} style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#1E3A5F", fontSize: "20px", fontWeight: "500", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ color: "#444", lineHeight: "1.8" }}>{section.body}</p>
        </div>
      ))}
    </div>
  )
}
