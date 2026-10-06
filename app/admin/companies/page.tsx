import Link from "next/link"
import { type Filter } from "mongodb"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { AdminCompanyRow } from "@/components/admin-company-row"
import { ensureReady } from "@/lib/queries"
import { getCollections } from "@/lib/db"
import { toArabicDigits } from "@/lib/format"
import { type Company } from "@/lib/types"
import { Building2, Plus } from "lucide-react"

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "approved", label: "معتمدة" },
  { key: "rejected", label: "مرفوضة" },
] as const

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await ensureReady()
  const sp = await searchParams
  const status = sp.status || "all"
  const { companies } = await getCollections()

  const filter: Filter<Company> = {}
  if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status as Company["status"]
  }

  const [items, counts] = await Promise.all([
    companies.find(filter).sort({ createdAt: -1 }).toArray(),
    Promise.all(
      TABS.map(async (tab) => {
        if (tab.key === "all") return companies.countDocuments()
        return companies.countDocuments({ status: tab.key })
      }),
    ),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">إدارة الشركات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            راجع واعتمد أو ارفض الشركات المسجّلة في المنصة.
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          إضافة شركة
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {TABS.map((tab, i) => {
          const active = status === tab.key
          const href = tab.key === "all" ? "/admin/companies" : `/admin/companies?status=${tab.key}`
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  active ? "bg-primary-foreground/20" : "bg-secondary",
                )}
              >
                {toArabicDigits(counts[i])}
              </span>
            </Link>
          )
        })}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((c) => (
            <AdminCompanyRow
              key={c._id}
              company={{ ...c, portfolio: c.portfolio ?? [], services: c.services ?? [] }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="size-7" />}
          title="لا توجد شركات"
          description="لا توجد شركات بهذه الحالة حالياً."
        />
      )}
    </div>
  )
}
