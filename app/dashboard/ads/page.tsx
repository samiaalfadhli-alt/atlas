import { redirect } from "next/navigation"

import { Megaphone, Eye, MousePointerClick } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/admin-primitives"
import { CampaignForm } from "@/components/campaign-form"
import { PublishActions } from "@/components/publish-actions"
import { getSession } from "@/lib/session"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"

export default async function MyAdsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/ads")

  const { campaigns } = await getCollections()
  const items = await campaigns
    .find({
      $or: [{ advertiserId: session.id }, ...(session.companyId ? [{ companyId: session.companyId }] : [])],
    })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">إعلاناتي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ حملات إعلانية — كل حملة تُرسل للمراجعة ولا تظهر إلا بعد اعتماد الإدارة.
          </p>
        </div>
        <CampaignForm advertiserMode />
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c._id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="hidden size-14 rounded-lg object-cover ring-1 ring-border sm:block" />
                ) : (
                  <span className="hidden size-14 items-center justify-center rounded-lg bg-secondary text-muted-foreground sm:flex">
                    <Megaphone className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-bold">{c.name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {c.type} • {c.placement} • {timeAgo(c.createdAt)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {toArabicDigits(c.impressions)}</span>
                    <span className="inline-flex items-center gap-1"><MousePointerClick className="size-3" /> {toArabicDigits(c.clicks)}</span>
                    {c.rejectionReason && <span className="text-destructive">سبب الرفض: {c.rejectionReason}</span>}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <PublishActions entityType="campaign" id={c._id} currentStatus={c.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Megaphone className="size-8" />}
          title="لا توجد حملات"
          description="أنشئ أول حملة إعلانية لشركتك."
        />
      )}
    </div>
  )
}
