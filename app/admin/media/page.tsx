import Link from "next/link"
import { type Filter } from "mongodb"

import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader } from "@/components/admin-primitives"
import { MediaUploader, MediaDeleteButton } from "@/components/media-uploader"
import { getCollections } from "@/lib/db"
import { toArabicDigits } from "@/lib/format"
import { type MediaContext, type MediaItem } from "@/lib/types"

type SearchParams = Promise<{ context?: string }>

const CONTEXTS: { value: MediaContext | "all"; ar: string }[] = [
  { value: "all", ar: "الكل" },
  { value: "hero", ar: "الهيرو" },
  { value: "section", ar: "الأقسام" },
  { value: "company", ar: "الشركات" },
  { value: "project", ar: "المشاريع" },
  { value: "category", ar: "التصنيفات" },
  { value: "article", ar: "المقالات" },
  { value: "banner", ar: "البنرات" },
  { value: "general", ar: "عام" },
]

export default async function MediaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const context = sp.context || "all"
  const { media } = await getCollections()

  const filter: Filter<MediaItem> = {}
  const ctx = CONTEXTS.find((c) => c.value === context)
  if (ctx && ctx.value !== "all") filter.context = ctx.value as MediaContext

  const [items, counts] = await Promise.all([
    media.find(filter).sort({ createdAt: -1 }).toArray(),
    Promise.all(
      CONTEXTS.map(async (c) => {
        if (c.value === "all") return media.countDocuments()
        return media.countDocuments({ context: c.value as MediaContext })
      }),
    ),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مكتبة الصور والوسائط"
        subtitle="إدارة مركزية لكل صور الموقع: الهيرو، الأقسام، الشركات، المشاريع، التصنيفات، المقالات والبنرات."
        action={<MediaUploader />}
      />

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
        {CONTEXTS.map((c, i) => {
          const active = context === c.value
          const href = c.value === "all" ? "/admin/media" : `/admin/media?context=${c.value}`
          return (
            <Link
              key={c.value}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {c.ar}
              <span className={cn("rounded-full px-1.5 py-0.5 text-xs tabular-nums", active ? "bg-primary-foreground/20" : "bg-secondary")}>
                {toArabicDigits(counts[i])}
              </span>
            </Link>
          )
        })}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m._id} className="group/media relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? m.name} loading="lazy" className="size-full object-cover" />
                <div className="absolute end-2 top-2">
                  <MediaDeleteButton id={m._id} />
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {CONTEXTS.find((c) => c.value === m.context)?.ar ?? m.context}
                </p>
                {m.desktopUrl && m.mobileUrl && (
                  <p className="mt-1 text-xs text-gold-foreground">Desktop + Mobile</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ImageIcon className="size-8" />}
          title="لا توجد وسائط"
          description="أضف أول صورة إلى المكتبة — استخدمها لاحقاً في الهيرو والأقسام والشركات."
        />
      )}
    </div>
  )
}
