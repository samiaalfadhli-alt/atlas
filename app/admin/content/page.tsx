import Link from "next/link"
import { type Filter } from "mongodb"

import { FileText, Eye } from "lucide-react"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, StatusBadge } from "@/components/admin-primitives"
import { ArticleForm } from "@/components/article-form"
import { PublishActions } from "@/components/publish-actions"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"
import { type Article, type PublishStatus } from "@/lib/types"

type SearchParams = Promise<{ status?: string }>

const TABS = [
  { key: "all", label: "الكل" },
  { key: "published", label: "منشورة" },
  { key: "pending-review", label: "قيد المراجعة" },
  { key: "draft", label: "مسودات" },
  { key: "rejected", label: "مرفوضة" },
] as const

const VALID: PublishStatus[] = ["draft", "pending-review", "published", "rejected", "approved"]

export default async function ContentPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const status = sp.status || "all"
  const { articles } = await getCollections()

  const filter: Filter<Article> = {}
  if (VALID.includes(status as PublishStatus)) filter.status = status as PublishStatus

  const [items, counts] = await Promise.all([
    articles.find(filter).sort({ createdAt: -1 }).toArray(),
    Promise.all(
      TABS.map(async (tab) => {
        if (tab.key === "all") return articles.countDocuments()
        return articles.countDocuments({ status: tab.key as PublishStatus })
      }),
    ),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مركز النشر — المحتوى"
        subtitle="إنشاء وإدارة المقالات والأخبار والمحتوى مع محرر ودعم SEO."
        action={<ArticleForm />}
      />

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {TABS.map((tab, i) => {
          const active = status === tab.key
          const href = tab.key === "all" ? "/admin/content" : `/admin/content?status=${tab.key}`
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
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {a.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverImage} alt={a.title} className="hidden size-14 rounded-lg object-cover ring-1 ring-border sm:block" />
                ) : (
                  <span className="hidden size-14 items-center justify-center rounded-lg bg-secondary text-muted-foreground sm:flex">
                    <FileText className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-bold">{a.title}</p>
                    <StatusBadge status={a.status} />
                    {a.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-foreground">مميّز</span>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {a.excerpt}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {toArabicDigits(a.views)}</span>
                    <span>{a.authorName} • {timeAgo(a.createdAt)}</span>
                    {a.rejectionReason && <span className="text-destructive">سبب الرفض: {a.rejectionReason}</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {a.status === "published" && (
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-xs font-medium text-primary hover:underline"
                    target="_blank"
                  >
                    عرض ↗
                  </Link>
                )}
                <PublishActions entityType="article" id={a._id} currentStatus={a.status} onDelete />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="size-8" />}
          title="لا توجد مقالات"
          description="أنشئ أول مقال أو خبر — سيُنشر مباشرة بصفتك من الطاقم."
        />
      )}
    </div>
  )
}
