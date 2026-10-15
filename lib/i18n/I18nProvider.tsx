"use client"

import { createContext, useContext, useMemo, useState } from "react"
import ar from "./ar"
import bn from "./bn"
import en from "./en"
import fr from "./fr"
import tr from "./tr"
import ur from "./ur"
import { isRtl, LANGUAGE_COOKIE, type Lang } from "./languages"
import { persistAgentLanguage } from "./persist"
import type { Dictionary } from "./types"

const dictionaries: Record<Lang, Dictionary> = { en, fr, ar, ur, tr, bn }

type I18nValue = {
  lang: Lang
  t: Dictionary
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const value = useMemo<I18nValue>(() => ({
    lang,
    t: dictionaries[lang],
    setLang(next) {
      document.cookie = `${LANGUAGE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`
      document.documentElement.lang = next
      document.documentElement.dir = isRtl(next) ? "rtl" : "ltr"
      setLangState(next)
      void persistAgentLanguage(next)
    },
  }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT() {
  const value = useContext(I18nContext)
  if (!value) return { lang: "en" as Lang, t: en, setLang: (_lang: Lang) => undefined }
  return value
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""))
}
