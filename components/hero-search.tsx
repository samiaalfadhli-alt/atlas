"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORY_META, type Category } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export function HeroSearch({ cities }: { cities: string[] }) {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")
  const [city, setCity] = React.useState<string>("all")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (category !== "all") params.set("category", category)
    if (city !== "all") params.set("city", city)
    router.push(`/companies?${params.toString()}`)
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2.5 rounded-2xl bg-card/90 p-2.5 shadow-xl ring-1 ring-foreground/10 backdrop-blur sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("ابحث عن شركة، خدمة، أو تخصص…", "Search a company, service, or specialty…")}
          className="h-11 border-0 bg-transparent ps-9 text-base shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11 w-full border-border/60 bg-background sm:w-36" size="default">
            <SelectValue placeholder={t("التخصص", "Specialty")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("كل التخصصات", "All specialties")}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {isArabic ? CATEGORY_META[cat].ar : CATEGORY_META[cat].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-11 w-full border-border/60 bg-background sm:w-32" size="default">
            <SelectValue placeholder={t("المدينة", "City")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("كل المدن", "All cities")}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" size="lg" className="h-11 sm:px-5">
          <Sparkles className="size-4" />
          {t("ابحث الآن", "Search")}
        </Button>
      </div>
    </form>
  )
}
