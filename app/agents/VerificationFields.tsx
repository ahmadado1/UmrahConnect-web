"use client"

import { useState } from "react"
import {
  VERIFICATION_DOC_FIELDS,
  type VerificationDocKey,
  type VerificationValues,
} from "@/lib/agentAccount"
import { useT } from "@/lib/i18n/I18nProvider"

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp"

const LICENCE_AUTHORITIES = [
  "NAHCON (Nigeria)",
  "Ministry of Tourism and Antiquities (Egypt)",
  "Ministry of Hajj and Umrah (Saudi Arabia)",
] as const

export default function VerificationFields({
  values,
  stored,
  onChange,
  onFile,
}: {
  values: VerificationValues
  stored: Partial<Record<VerificationDocKey, string | null>>
  onChange: (key: keyof VerificationValues, value: string) => void
  onFile: (key: VerificationDocKey, file: File | null) => void
}) {
  const { t } = useT()
  const knownAuthority = (LICENCE_AUTHORITIES as readonly string[]).includes(values.licenceAuthority)
  const [choseOther, setChoseOther] = useState(false)
  const other = choseOther || (Boolean(values.licenceAuthority) && !knownAuthority)
  const authorityLabels: Record<(typeof LICENCE_AUTHORITIES)[number], string> = {
    "NAHCON (Nigeria)": t.docs.nahcon,
    "Ministry of Tourism and Antiquities (Egypt)": t.docs.egypt,
    "Ministry of Hajj and Umrah (Saudi Arabia)": t.docs.saudi,
  }
  const docLabels: Record<VerificationDocKey, string> = {
    doc_business_reg: t.docs.businessReg,
    doc_licence: t.docs.licence,
    doc_owner_id: t.docs.ownerId,
    doc_office_photo: t.docs.officePhoto,
  }

  return (
    <>
      <h2>{t.docs.title}</h2>
      <label>
        {t.docs.licenceNumber}
        <input value={values.licenceNumber} onChange={(event) => onChange("licenceNumber", event.target.value)} />
      </label>
      <label>
        {t.docs.authority}
        <select
          value={other ? "Other" : values.licenceAuthority}
          onChange={(event) => {
            const next = event.target.value
            if (next === "Other") {
              setChoseOther(true)
              if (knownAuthority) onChange("licenceAuthority", "")
              return
            }
            setChoseOther(false)
            onChange("licenceAuthority", next)
          }}
        >
          <option value="">{t.docs.selectAuthority}</option>
          {LICENCE_AUTHORITIES.map((authority) => (
            <option key={authority} value={authority}>{authorityLabels[authority]}</option>
          ))}
          <option value="Other">{t.docs.other}</option>
        </select>
      </label>
      {other ? (
        <label>
          {t.docs.otherAuthority}
          <input
            value={values.licenceAuthority}
            onChange={(event) => onChange("licenceAuthority", event.target.value)}
          />
        </label>
      ) : null}
      <label>
        {t.docs.regNumber}
        <input value={values.businessRegNumber} onChange={(event) => onChange("businessRegNumber", event.target.value)} />
      </label>
      <label>
        {t.docs.address}
        <textarea value={values.officeAddress} onChange={(event) => onChange("officeAddress", event.target.value)} rows={3} />
      </label>
      <label>
        {t.docs.references}
        <textarea value={values.referencesNote} onChange={(event) => onChange("referencesNote", event.target.value)} rows={3} />
      </label>
      {VERIFICATION_DOC_FIELDS.map((field) => (
        <label key={field.key}>
          {docLabels[field.key]} — {stored[field.key] ? t.common.uploaded : t.common.missing}
          <input
            type="file"
            accept={ACCEPT}
            onChange={(event) => onFile(field.key, event.target.files?.[0] ?? null)}
          />
        </label>
      ))}
    </>
  )
}
