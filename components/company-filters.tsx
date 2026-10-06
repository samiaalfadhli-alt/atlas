"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Filter, RotateCcw, Search } from "lucide-react"

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
import { CATEGORY_META, SERVICE_OPTIONS, type Category } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export function CompanyFilters({ cities }: { cities: string[] }) {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()

  const [q, setQ] = React.useState(params.get("q") || "")
  const category = params.get("category") || "all"
  const city = params.get("city") || "all"
  const service = params.get("service") || "all"
  const sort = params.get("sort") || "featured"

  const services =
    category !== "all" && category in SERVICE_OPTIONS
      ? SERVICE_OPTIONS[category as Category]
      : []

  function update(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") sp.delete(key)
      else sp.set(key, value)
    }
    const qs = sp.toString()
    router.push(qs ? `/companies?${qs}` : "/companies")
  }

  // Debounced search input.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      const current = params.get("q") || ""
      if (current !== q.trim() && (q.trim() || current)) {
        update({ q: q.trim() })
      }
    }, 400)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const hasFilters =
    q.trim() || category !== "all" || city !== "all" || service !== "all" || sort !== "featured"

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-heading text-sm font-bold">
          <Filter className="size-4 text-primary" />
          {t("تصفية النتائج", "Filter results")}
        </span>
        {hasFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setQ("")
              router.push("/companies")
            }}
          >
            <RotateCcw className="size-3.5" />
            {t("إعادة ضبط", "Reset")}
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("بحث بالاسم أو الخدمة…", "Search by name or service…")}
          className="ps-9"
        />
      </div>

      <Field label={t("التخصص", "Specialty")}>
        <Select
          value={category}
          onValueChange={(v) => update({ category: v, service: "all" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
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
      </Field>

      <Field label={t("المدينة", "City")}>
        <Select value={city} onValueChange={(v) => update({ city: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
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
      </Field>

      {services.length > 0 && (
        <Field label={t("الخدمة", "Service")}>
          <Select value={service} onValueChange={(v) => update({ service: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("كل الخدمات", "All services")}</SelectItem>
              {services.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field label={t("ترتيب", "Sort")}>
        <Select value={sort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">{t("المميّزة أولاً", "Featured first")}</SelectItem>
            <SelectItem value="rating">{t("الأعلى تقييماً", "Top rated")}</SelectItem>
            <SelectItem value="newest">{t("الأحدث", "Newest")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
