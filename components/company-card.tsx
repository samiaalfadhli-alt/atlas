import Link from "next/link"

import { MapPin, ShieldCheck, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import { CATEGORY_META, type Company } from "@/lib/types"
import { formatRating, toArabicDigits } from "@/lib/format"

export function CompanyCard({ company }: { company: Company }) {
  const meta = CATEGORY_META[company.category]
  const colorVar = meta.colorVar
  const cover = company.coverUrl
  const initials = company.name.slice(0, 2)

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group/card-link flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20"
    >
      <div className="relative aspect-[16/8] w-full overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={company.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover/card-link:scale-105"
          />
        ) : (
          <div className="blueprint-fine flex size-full items-center justify-center bg-primary/10 text-primary">
            <CategoryIcon
              category={company.category}
              className="size-12 opacity-60"
            />
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute end-3 top-3 flex items-center gap-1.5">
          {company.verified && (
            <span className="flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[0.65rem] font-semibold text-primary shadow-sm backdrop-blur">
              <ShieldCheck className="size-3" />
              موثّقة
            </span>
          )}
        </span>
        <span
          className={cn(
            "absolute bottom-3 start-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-white shadow-sm backdrop-blur-sm",
          )}
          style={{ backgroundColor: `color-mix(in oklch, var(--${colorVar}) 75%, transparent)` }}
        >
          <CategoryIcon category={company.category} className="size-3.5" />
          {meta.ar}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold text-white ring-1 ring-white/20"
            style={{ backgroundColor: `var(--${colorVar})` }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-bold leading-tight">
              {company.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {company.tagline}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {company.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {company.rating > 0 ? formatRating(company.rating) : "جديد"}
            {company.reviewCount > 0 && (
              <span className="text-muted-foreground/70">
                ({toArabicDigits(company.reviewCount)})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1">
            {toArabicDigits(company.portfolio.length || company.projectCount)} مشروع
          </span>
        </div>

        {company.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {company.services.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="font-normal">
                {s}
              </Badge>
            ))}
            {company.services.length > 3 && (
              <span className="inline-flex h-5 items-center rounded-full px-2 text-xs text-muted-foreground">
                +{toArabicDigits(company.services.length - 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
