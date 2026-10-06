import Link from "next/link"

import {
  Building2,
  ClipboardCheck,
  FileText,
  GalleryVerticalEnd,
  MapPin,
  Megaphone,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader } from "@/components/admin-primitives"
import { ChangeRequestActions } from "@/components/approval-actions"
import { PublishActions } from "@/components/publish-actions"
import { AdminCompanyRow } from "@/components/admin-company-row"
import { getCollections } from "@/lib/db"
import { timeAgo, toArabicDigits } from "@/lib/format"
import type { ChangeFieldValue } from "@/lib/types"

export default async function ApprovalCenterPage() {
  const { changeRequests, banners, campaigns, articles, projects, companies } =
    await getCollections()

  const [changes, pendingBanners, pendingCampaigns, pendingArticles, pendingProjects, pendingCompanies] =
    await Promise.all([
      changeRequests.find({ status: "pending" }).sort({ createdAt: -1 }).toArray(),
      banners.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      campaigns.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      articles.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      projects.find({ publishStatus: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      companies.find({ status: "pending" }).sort({ createdAt: -1 }).toArray(),
    ])

  const total =
    changes.length +
    pendingBanners.length +
    pendingCampaigns.length +
    pendingArticles.length +
    pendingProjects.length +
    pendingCompanies.length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مركز الموافقات"
        subtitle={
          total > 0
            ? `${toArabicDigits(total)} طلب بانتظار مراجعتك واعتمادك.`
            : "كل الطلبات تمت مراجعتها — لا توجد عناصر معلّقة."
        }
      />

      {total === 0 && (
        <EmptyState
          icon={<ClipboardCheck className="size-8" />}
          title="لا توجد طلبات بانتظار الاعتماد"
          description="ستظهر هنا: الشركات الجديدة، تعديلات المعلنين، البنرات، الإعلانات، المقالات والمشاريع الجديدة."
        />
      )}

      {/* تعديلات المعلنين */}
      {changes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-primary" />
              تعديلات بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(changes.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {changes.map((req) => (
              <div key={req._id} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-heading text-sm font-bold">{req.entityName}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.advertiserName} • {timeAgo(req.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                    {entityTypeLabel(req.entityType)}
                  </span>
                </div>

                {req.changes.length > 0 && (
                  <div className="mb-3 space-y-2 rounded-lg bg-secondary/40 p-3">
                    {req.changes.map((c) => (
                      <div key={c.field} className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-[140px_1fr_1fr]">
                        <span className="font-semibold text-foreground">{c.fieldLabel}</span>
                        <span className="text-muted-foreground line-through">
                          {formatValue(c.oldValue)}
                        </span>
                        <span className="font-medium text-primary">
                          {formatValue(c.newValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {req.entityType === "company-project" && req.payload?.project ? (
                  <div className="mb-3 rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">
                    مشروع جديد:{" "}
                    <span className="font-semibold text-foreground">
                      {String((req.payload.project as Record<string, unknown>).title ?? "")}
                    </span>
                  </div>
                ) : null}

                <ChangeRequestActions id={req._id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* شركات جديدة */}
      {pendingCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              شركات جديدة بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(pendingCompanies.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingCompanies.map((c) => (
              <AdminCompanyRow
                key={c._id}
                company={{ ...c, portfolio: c.portfolio ?? [], services: c.services ?? [] }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* بنرات */}
      {pendingBanners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GalleryVerticalEnd className="size-5 text-primary" />
              بنرات بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(pendingBanners.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBanners.map((b) => (
              <div key={b._id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.desktopImage} alt={b.name} className="size-14 rounded-lg object-cover" />
                  <div>
                    <p className="font-heading text-sm font-bold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.title} • {b.placement} • {timeAgo(b.createdAt)}
                    </p>
                  </div>
                </div>
                <PublishActions entityType="banner" id={b._id} currentStatus={b.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* حملات */}
      {pendingCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              حملات إعلانية بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(pendingCampaigns.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingCampaigns.map((c) => (
              <div key={c._id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.type} • {c.placement} • {timeAgo(c.createdAt)}
                  </p>
                </div>
                <PublishActions entityType="campaign" id={c._id} currentStatus={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* مقالات */}
      {pendingArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              مقالات بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(pendingArticles.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingArticles.map((a) => (
              <div key={a._id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-sm font-bold">{a.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {a.excerpt} • {timeAgo(a.createdAt)}
                  </p>
                </div>
                <PublishActions entityType="article" id={a._id} currentStatus={a.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* مشاريع */}
      {pendingProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              مشاريع بانتظار الاعتماد
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
                {toArabicDigits(pendingProjects.length)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingProjects.map((p) => (
              <div key={p._id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.title} className="size-14 rounded-lg object-cover" />
                  <div>
                    <p className="font-heading text-sm font-bold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.city ?? "—"} • {timeAgo(p.createdAt)}
                    </p>
                  </div>
                </div>
                <PublishActions entityType="project" id={p._id} currentStatus={p.publishStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">العودة إلى نظرة عامة</Link>
      </p>
    </div>
  )
}

function entityTypeLabel(type: string): string {
  switch (type) {
    case "company":
      return "تعديل بيانات شركة"
    case "company-project":
      return "مشروع / عمل"
    case "banner":
      return "بنر"
    case "campaign":
      return "حملة"
    case "article":
      return "مقال"
    case "media":
      return "وسائط"
    default:
      return type
  }
}

function formatValue(value: ChangeFieldValue): string {
  if (value === null || value === "") return "—"
  if (Array.isArray(value)) return value.length ? value.join("، ") : "—"
  return String(value)
}
