import { redirect } from "next/navigation"

import { GalleryVerticalEnd } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/admin-primitives"
import { BannerForm } from "@/components/banner-form"
import { PublishActions } from "@/components/publish-actions"
import { getSession } from "@/lib/session"
import { getCollections } from "@/lib/db"
import { timeAgo } from "@/lib/format"

export default async function MyBannersPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/banners")

  const { banners } = await getCollections()
  const items = await banners
    .find({
      $or: [{ advertiserId: session.id }, ...(session.companyId ? [{ companyId: session.companyId }] : [])],
    })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">بنراتي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ بنرات لشركتك — كل بنر يُرسل للمراجعة ولا يظهر إلا بعد اعتماد الإدارة.
          </p>
        </div>
        <BannerForm advertiserMode />
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b._id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.desktopImage} alt={b.name} className="hidden size-14 rounded-lg object-cover ring-1 ring-border sm:block" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-bold">{b.name}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {b.title || "—"} • {b.placement} • {timeAgo(b.createdAt)}
                  </p>
                  {b.rejectionReason && (
                    <p className="mt-1 text-xs text-destructive">سبب الرفض: {b.rejectionReason}</p>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <PublishActions entityType="banner" id={b._id} currentStatus={b.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GalleryVerticalEnd className="size-8" />}
          title="لا توجد بنرات"
          description="أنشئ أول بنر لشركتك — مثلاً بنر لمشروع جديد أو عرض موسمي."
        />
      )}
    </div>
  )
}
