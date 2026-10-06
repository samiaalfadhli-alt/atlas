import { Suspense } from "react"
import Link from "next/link"

import { ChevronLeft, ChevronRight, SearchX } from "lucide-react"

import { CompanyCard } from "@/components/company-card"
import { CompanyFilters } from "@/components/company-filters"
import { EmptyState } from "@/components/empty-state"
import { CategoryIcon } from "@/components/category-icon"
import { getCompanies, getDistinctCities } from "@/lib/queries"
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types"
import { toArabicDigits } from "@/lib/format"
import { cn } from "@/lib/utils"

type SearchParams = Promise<{
  category?: string
  city?: string
  q?: string
  service?: string
  sort?: string
  page?: string
}>

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const category =
    sp.category && CATEGORIES.includes(sp.category as Category)
      ? (sp.category as Category)
      : undefined
  const page = Math.max(1, Number(sp.page) || 1)

  const [{ items, total, pages }, cities] = await Promise.all([
    getCompanies({
      category,
      city: sp.city,
      q: sp.q,
      service: sp.service,
      sort: (sp.sort as "featured" | "rating" | "newest") || "featured",
      page,
      limit: 12,
    }),
    getDistinctCities(),
  ])

  const title = category ? CATEGORY_META[category].ar : "كل الشركات"
  const subtitle = category
    ? `شركات ${CATEGORY_META[category].ar} المعتمدة في المملكة`
    : "تصفّح شركات البناء والتصميم والعقارات المعتمدة"

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <span>/</span>
          <span className="text-foreground">الشركات</span>
          {category && (
            <>
              <span>/</span>
              <span className="text-foreground">{CATEGORY_META[category].ar}</span>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {category && (
            <span
              className="flex size-11 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: `var(--${CATEGORY_META[category].colorVar})` }}
            >
              <CategoryIcon category={category} className="size-6" />
            </span>
          )}
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {category && (
        <SubcategoryPills
          category={category}
          currentService={sp.service}
          searchParams={sp}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
            <CompanyFilters cities={cities} />
          </Suspense>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <span className="font-heading font-bold text-foreground">
                {toArabicDigits(total)}
              </span>{" "}
              شركة
            </span>
          </div>

          {items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((company) => (
                  <CompanyCard key={company._id} company={company} />
                ))}
              </div>

              {pages > 1 && (
                <Pagination current={page} pages={pages} searchParams={sp} />
              )}
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="size-7" />}
              title="لا توجد شركات مطابقة"
              description="جرّب توسيع نطاق البحث أو تغيير عوامل التصفية. يمكنك أيضاً إزالة بعض الفلاتر لرؤية نتائج أكثر."
              action={
                <Link
                  href="/companies"
                  className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  عرض كل الشركات
                </Link>
              }
              className="min-h-[320px]"
            />
          )}
        </section>
      </div>
    </main>
  )
}

function SubcategoryPills({
  category,
  currentService,
  searchParams,
}: {
  category: Category
  currentService?: string
  searchParams: Record<string, string | undefined>
}) {
  const subs = CATEGORY_META[category].subcategories

  function buildHref(service: string | "all") {
    const params = new URLSearchParams()
    params.set("category", category)
    if (searchParams.city) params.set("city", searchParams.city)
    if (searchParams.q) params.set("q", searchParams.q)
    if (searchParams.sort) params.set("sort", searchParams.sort)
    if (service !== "all") params.set("service", service)
    return `/companies?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
      <span className="px-1 text-xs font-semibold text-muted-foreground">التخصص الفرعي:</span>
      <Pill href={buildHref("all")} active={!currentService}>
        الكل
      </Pill>
      {subs.map((s) => (
        <Pill key={s} href={buildHref(s)} active={currentService === s}>
          {s}
        </Pill>
      ))}
    </div>
  )
}

function Pill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-muted-foreground hover:border-gold hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}

function Pagination({
  current,
  pages,
  searchParams,
}: {
  current: number
  pages: number
  searchParams: Record<string, string | undefined>
}) {
  const buildHref = (page: number) => {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") sp.set(key, value)
    }
    if (page > 1) sp.set("page", String(page))
    const qs = sp.toString()
    return qs ? `/companies?${qs}` : "/companies"
  }

  const windowSize = 2
  const nums: number[] = []
  for (let p = Math.max(1, current - windowSize); p <= Math.min(pages, current + windowSize); p++) {
    nums.push(p)
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="ترقيم الصفحات">
      {current > 1 && (
        <Link
          href={buildHref(current - 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
      {nums[0] > 1 && (
        <>
          <PageLink href={buildHref(1)} active={current === 1}>1</PageLink>
          {nums[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}
      {nums.map((p) => (
        <PageLink key={p} href={buildHref(p)} active={p === current}>
          {toArabicDigits(p)}
        </PageLink>
      ))}
      {nums[nums.length - 1] < pages && (
        <>
          {nums[nums.length - 1] < pages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <PageLink href={buildHref(pages)} active={current === pages}>
            {toArabicDigits(pages)}
          </PageLink>
        </>
      )}
      {current < pages && (
        <Link
          href={buildHref(current + 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}
    </nav>
  )
}

function PageLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex size-9 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      {children}
    </Link>
  )
}
