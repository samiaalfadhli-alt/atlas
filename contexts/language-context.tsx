"use client"

import * as React from "react"
import { DirectionProvider } from "@radix-ui/react-direction"

import ar from "@/lib/i18n/locales/ar.json"
import en from "@/lib/i18n/locales/en.json"

type Language = "ar" | "en"
type Direction = "rtl" | "ltr"

const messages: Record<Language, Record<string, string>> = { ar, en }

type TFunction = {
  (key: string): string
  (arabic: string, english: string): string
}

const LanguageContext = React.createContext<{
  lang: Language
  dir: Direction
  isArabic: boolean
  setLanguage: (lang: Language) => void
  t: TFunction
} | null>(null)

export function LanguageProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [lang, setLang] = React.useState<Language>(() => {
    if (typeof window === "undefined") {
      return "ar"
    }

    return window.localStorage.getItem("lang") === "en" ? "en" : "ar"
  })

  const isArabic = lang === "ar"
  const dir: Direction = isArabic ? "rtl" : "ltr"

  React.useEffect(() => {
    document.documentElement.lang = isArabic ? "ar-SA" : "en"
    document.documentElement.dir = dir
  }, [dir, isArabic])

  const setLanguage = React.useCallback((newLang: Language) => {
    window.localStorage.setItem("lang", newLang)
    setLang(newLang)
  }, [])

  const t = React.useCallback(function translate(
    keyOrArabic: string,
    english?: string
  ) {
    const translated = messages[lang][keyOrArabic]

    if (translated !== undefined) {
      return translated
    }

    if (typeof english === "string") {
      return isArabic ? keyOrArabic : english
    }

    return keyOrArabic
  }, [isArabic, lang]) as TFunction

  const value = React.useMemo(
    () => ({ lang, dir, isArabic, setLanguage, t }),
    [dir, isArabic, lang, setLanguage, t]
  )

  return (
    <DirectionProvider dir={dir}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </DirectionProvider>
  )
}

export function useLanguage() {
  const context = React.use(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }

  return context
}
