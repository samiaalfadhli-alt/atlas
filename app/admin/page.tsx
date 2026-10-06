import Link from "next/link"

import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Eye,
  FileText,
  GalleryVerticalEnd,
  MapPin,
  Megaphone,
  MousePointerClick,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import {
  AdminPageHeader,
  AdminStat,
  StatusBadge,
} from "@/components/admin-primitives"
import { AdminCompanyRow } from "@/components/admin-company-row"
import {
  getOwnerOverviewStats,
  getPendingChangeRequests,
  countPendingApprovals,
} from "@/lib/platform-queries"
import { ensureReady } from "@/lib/queries"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"

export default async function OwnerOverviewPage() {
  await ensureReady()
  const [stats, pendingChanges, pendingApprovals] = await Promise.all([
    getOwnerOverviewStats(),
    getPendingChangeRequests(),
    countPendingApprovals(),
  ])

  const { companies, banners, campaigns } = await getCollections()
  const [pendingCompanies, pendingBanners, pendingCampaigns] = await Promise.all([
    companies.find({ status: "pending" }).sort({ createdAt: -1 }).limit(5).toArray(),
    banners.find({ status: "pending-review" }).sort({ createdAt: -1 }).limit(5).toArray(),
    campaigns.find({ status: "pending-review" }).sort({ createdAt: -1 }).limit(5).toArray(),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="نظرة عامة على المنصة"
        subtitle="مركز التحكم الكامل بأطلس المنزل — الإحصائيات والاعتمادات والإعلانات والمحتوى."
        action={
          pendingApprovals.total > 0 ? (
            <Button asChild>
              <Link href="/admin/approvals">
                <ClipboardCheck className="size-4" />
                {toArabicDigits(pendingApprovals.total)} بانتظار الاعتماد
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* النشاط الأساسي */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">
          النشاط الأساسي
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <AdminStat icon={<Building2 className="size-5" />} label="إجمالي الشركات" value={stats.companies} />
          <AdminStat icon={<Users className="size-5" />} label="المعلنون" value={stats.advertisers} tone="primary" />
          <AdminStat icon={<Megaphone className="size-5" />} label="الحملات الإعلانية" value={stats.campaigns} />
          <AdminStat icon={<GalleryVerticalEnd className="size-5" />} label="بنرات نشطة" value={stats.activeBanners} tone="gold" />
          <AdminStat icon={<FileText className="size-5" />} label="المقالات" value={stats.articles} />
          <AdminStat icon={<MapPin className="size-5" />} label="المشاريع" value={stats.projects} />
        </div>
      </div>

      {/* الاعتمادات والمراجعة */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">
          قائمة الاعتمادات
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStat icon={<ClipboardCheck className="size-5" />} label="تعديلات بانتظار المراجعة" value={pendingApprovals.changes} tone="amber" />
          <AdminStat icon={<Building2 className="size-5" />} label="شركات قيد المراجعة" value={pendingApprovals.companies} tone="amber" />
          <AdminStat icon={<GalleryVerticalEnd className="size-5" />} label="بنرات قيد المراجعة" value={pendingApprovals.banners} tone="amber" />
          <AdminStat icon={<Megaphone className="size-5" />} label="إعلانات قيد المراجعة" value={pendingApprovals.campaigns} tone="amber" />
        </div>
      </div>

      {/* أداء الإعلانات */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">
          أداء الإعلانات والبنرات
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStat icon={<Eye className="size-5" />} label="مشاهدات الحملات" value={stats.totalImpressions} />
          <AdminStat icon={<MousePointerClick className="size-5" />} label="نقرات الحملات" value={stats.totalClicks} tone="primary" />
          <AdminStat icon={<Eye className="size-5" />} label="مشاهدات البنرات" value={stats.totalBannerViews} />
          <AdminStat icon={<MousePointerClick className="size-5" />} label="نقرات البنرات" value={stats.totalBannerClicks} tone="primary" />
        </div>
      </div>

      {/* تكاملات خارجية — حالة الاتصال */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>حالة التكاملات الخارجية</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/reports">مركز التحليلات</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <IntegrationStatusTile name="Google Analytics" href="/admin/analytics" />
            <IntegrationStatusTile name="Google Ads" href="/admin/google-ads" />
            <IntegrationStatusTile name="Google AdSense" href="/admin/adsense" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            تُعرض بيانات حقيقية فقط بعد ربط كل خدمة عبر تكاملها الرسمي. حتى الربط، الحالة «غير متصل».
          </p>
        </CardContent>
      </Card>

      {/* قوائم الاعتماد */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>شركات قيد المراجعة</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/companies?status=pending">الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingCompanies.length > 0 ? (
              pendingCompanies.map((c) => (
                <AdminCompanyRow
                  key={c._id}
                  company={{ ...c, portfolio: c.portfolio ?? [], services: c.services ?? [] }}
                />
              ))
            ) : (
              <EmptyState
                icon={<Building2 className="size-7" />}
                title="لا توجد شركات معلّقة"
                description="كل الشركات المُسجّلة تمت مراجعتها."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>بنرات وإعلانات قيد المراجعة</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/approvals">مركز الموافقات</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBanners.length === 0 && pendingCampaigns.length === 0 && pendingChanges.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="size-7" />}
                title="لا توجد طلبات معلّقة"
                description="كل البنرات والإعلانات وتعديلات المعلنين تمت مراجعتها."
              />
            ) : (
              <>
                {pendingBanners.slice(0, 3).map((b) => (
                  <PendingRow
                    key={b._id}
                    title={b.name}
                    subtitle={`بنر — ${b.placement}`}
                    createdAt={b.createdAt}
                  />
                ))}
                {pendingCampaigns.slice(0, 3).map((c) => (
                  <PendingRow
                    key={c._id}
                    title={c.name}
                    subtitle={`حملة — ${c.type}`}
                    createdAt={c.createdAt}
                  />
                ))}
                {pendingChanges.slice(0, 3).map((c) => (
                  <PendingRow
                    key={c._id}
                    title={c.entityName}
                    subtitle={`تعديل من ${c.advertiserName}`}
                    createdAt={c.createdAt}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function IntegrationStatusTile({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border">
          <BarChart3 className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">غير متصل</p>
        </div>
      </div>
      <span className="size-2.5 rounded-full bg-muted-foreground/40" />
    </Link>
  )
}

function PendingRow({
  title,
  subtitle,
  createdAt,
}: {
  title: string
  subtitle: string
  createdAt: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status="pending-review" />
        <span className="text-xs text-muted-foreground">{timeAgo(createdAt)}</span>
      </div>
    </div>
  )
}
