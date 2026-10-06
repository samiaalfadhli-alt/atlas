"use client"

import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage()
  const next = lang === "ar" ? "en" : "ar"
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(next)}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages className="size-4" />
      <span className="font-medium">{lang === "ar" ? "EN" : "ع"}</span>
    </Button>
  )
}
