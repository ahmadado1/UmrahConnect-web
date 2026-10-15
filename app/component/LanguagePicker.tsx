"use client"

import { useEffect, useRef, useState } from "react"
import { GlobeIcon } from "./Icons"
import { useT } from "@/lib/i18n/I18nProvider"
import { LANGS, LANGUAGE_NAMES, type Lang } from "@/lib/i18n/languages"

export default function LanguagePicker() {
  const { lang, setLang, t } = useT()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  return (
    <div className="lang-picker" ref={root}>
      <button
        type="button"
        className="lang-picker-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        onClick={() => setOpen((current) => !current)}
      >
        <GlobeIcon size={18} stroke="currentColor" />
        <span>{LANGUAGE_NAMES[lang]}</span>
      </button>
      {open ? (
        <div className="lang-picker-menu" role="listbox" aria-label={t.nav.language}>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === lang}
              onClick={() => {
                setLang(code as Lang)
                setOpen(false)
              }}
            >
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
