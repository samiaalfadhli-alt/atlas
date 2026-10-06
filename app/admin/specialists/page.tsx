import Link from "next/link"

import { Wrench, ArrowLeft } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin-primitives"
import { CategoryIcon } from "@/components/category-icon"
import { getCollections } from "@/lib/db"
import { toArabicDigits } from "@/lib/format"
import { CATEGORIES, CATEGORY_META } from "@/lib/types"

export default async function SpecialistsPage() {
  const { companies } = await getCollections()
  const rows = await companies
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray()
  const countByCat = new Map(rows.map((r) => [r._id, r.count]))
  const total = rows.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المتخصصون"
        subtitle={`دليل المتخصصين المعتمدين — ${toArabicDigits(total)} متخصص موزّعون على ${toArabicDigits(CATEGORIES.length)} تصنيف.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const count = countByCat.get(cat) ?? 0
          return (
            <Link
              key={cat}
              href={`/companies?category=${cat}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CategoryIcon category={cat} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold">{meta.ar}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{meta.description.ar}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {toArabicDigits(count)} متخصص
                </p>
              </div>
              <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
            </Link>
          )
        })}
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Wrench className="size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            المتخصصون هم الشركات والخبراء المعتمدون في كل تصنيف. لإضافة متخصص جديد استخدم{" "}
            <Link href="/admin/companies/new" className="font-semibold text-primary hover:underline">إضافة شركة</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
