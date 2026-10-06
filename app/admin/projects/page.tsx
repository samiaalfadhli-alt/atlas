import Link from "next/link"
import { type Filter } from "mongodb"

import { MapPin, Building2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, StatusBadge } from "@/components/admin-primitives"
import { ProjectForm } from "@/components/project-form"
import { PublishActions } from "@/components/publish-actions"
import { getCollections } from "@/lib/db"
import { toArabicDigits } from "@/lib/format"
import { type PlatformProject, type PublishStatus } from "@/lib/types"

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: "all", label: "الكل" },
  { key: "published", label: "منشورة" },
  { key: "pending-review", label: "قيد المراجعة" },
  { key: "draft", label: "مسودات" },
] as const

const VALID: PublishStatus[] = ["draft", "pending-review", "published", "rejected"]

const STATUS_LABEL: Record<PlatformProject["status"], string> = {
  "off-plan": "على المخطط",
  "under-construction": "قيد الإنشاء",
  ready: "جاهز",
  "sold-out": "مباع بالكامل",
}

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const status = sp.status || "all"
  const { projects } = await getCollections()

  const filter: Filter<PlatformProject> = {}
  if (VALID.includes(status as PublishStatus)) filter.publishStatus = status as PublishStatus

  const [items, counts] = await Promise.all([
    projects.find(filter).sort({ createdAt: -1 }).toArray(),
    Promise.all(
      TABS.map(async (tab) => {
        if (tab.key === "all") return projects.countDocuments()
        return projects.countDocuments({ publishStatus: tab.key as PublishStatus })
      }),
    ),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المشاريع"
        subtitle="إدارة مشاريع المطورين العقاريين والمشاريع المستقلة."
        action={<ProjectForm />}
      />

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {TABS.map((tab, i) => {
          const active = status === tab.key
          const href = tab.key === "all" ? "/admin/projects" : `/admin/projects?status=${tab.key}`
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p._id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} className="size-full object-cover" />
                <span className="absolute end-2 top-2"><StatusBadge status={p.publishStatus} /></span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-heading text-sm font-bold leading-tight">{p.title}</h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.city && <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {p.city}</span>}
                  <span className="inline-flex items-center gap-1"><Building2 className="size-3" /> {STATUS_LABEL[p.status] ?? p.status}</span>
                </div>
                {p.priceFrom ? <span className="text-xs font-semibold text-primary">من {toArabicDigits(p.priceFrom)} ريال</span> : null}
                <div className="mt-auto pt-2">
                  <PublishActions entityType="project" id={p._id} currentStatus={p.publishStatus} onDelete />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="size-8" />}
          title="لا توجد مشاريع"
          description="أضف أول مشروع — سيُنشر مباشرة بصفتك من الطاقم."
        />
      )}
    </div>
  )
}
