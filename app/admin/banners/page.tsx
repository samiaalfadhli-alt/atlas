import Link from "next/link"
import { type Filter } from "mongodb"

import { GalleryVerticalEnd, Eye, MousePointerClick } from "lucide-react"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, StatusBadge } from "@/components/admin-primitives"
import { BannerForm } from "@/components/banner-form"
import { PublishActions } from "@/components/publish-actions"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"
import { type Banner, type PublishStatus } from "@/lib/types"

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: "all", label: "الكل" },
  { key: "pending-review", label: "قيد المراجعة" },
  { key: "active", label: "نشطة" },
  { key: "paused", label: "متوقفة" },
  { key: "rejected", label: "مرفوضة" },
  { key: "draft", label: "مسودات" },
] as const

export default async function BannersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const status = sp.status || "all"
  const { banners } = await getCollections()

  const filter: Filter<Banner> = {}
  const validStatuses: PublishStatus[] = [
    "draft",
    "pending-review",
    "approved",
    "active",
    "paused",
    "rejected",
    "expired",
  ]
  if (validStatuses.includes(status as PublishStatus)) {
    filter.status = status as PublishStatus
  }

  const [items, counts] = await Promise.all([
    banners.find(filter).sort({ createdAt: -1 }).toArray(),
    Promise.all(
      TABS.map(async (tab) => {
        if (tab.key === "all") return banners.countDocuments()
        return banners.countDocuments({ status: tab.key as PublishStatus })
      }),
    ),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مدير البنرات"
        subtitle="إدارة بنرات الموقع المتحركة — كل بنر يمر بالموافقة قبل النشر."
        action={<BannerForm />}
      />

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {TABS.map((tab, i) => {
          const active = status === tab.key
          const href = tab.key === "all" ? "/admin/banners" : `/admin/banners?status=${tab.key}`
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
              <span className={cn("rounded-full px-1.5 py-0.5 text-xs tabular-nums", active ? "bg-primary-foreground/20" : "bg-secondary")}>
                {toArabicDigits(counts[i])}
              </span>
            </Link>
          )
        })}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b._id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.desktopImage} alt={b.name} className="hidden size-16 rounded-lg object-cover ring-1 ring-border sm:block" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-bold">{b.name}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {b.title || "—"} • {b.placement}
                    {b.city ? ` • ${b.city}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3" /> {toArabicDigits(b.views)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="size-3" /> {toArabicDigits(b.clicks)}
                    </span>
                    <span>{timeAgo(b.createdAt)}</span>
                    {b.rejectionReason && (
                      <span className="text-destructive">سبب الرفض: {b.rejectionReason}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <PublishActions entityType="banner" id={b._id} currentStatus={b.status} onDelete />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GalleryVerticalEnd className="size-8" />}
          title="لا توجد بنرات"
          description="أنشئ أول بنر — سيُرسل للمراجعة قبل النشر."
        />
      )}
    </div>
  )
}
