export const LANGS = ["en", "fr", "ar", "ur", "tr", "bn"] as const

export type Lang = (typeof LANGS)[number]

export const LANGUAGE_COOKIE = "uc_lang"

export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  ur: "اردو",
  tr: "Türkçe",
  bn: "বাংলা",
}

export function isLang(value: string | null | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value)
}

export function isRtl(lang: Lang) {
  return lang === "ar" || lang === "ur"
}

export function resolveLang(cookieValue: string | undefined, acceptLanguage: string | null) {
  if (isLang(cookieValue)) return cookieValue
  const header = acceptLanguage || ""
  const parts = header.split(",").map((part) => part.split(";")[0]?.trim().toLowerCase() || "")
  for (const part of parts) {
    const base = part.split("-")[0]
    if (isLang(base)) return base
  }
  return "en" as const
}
