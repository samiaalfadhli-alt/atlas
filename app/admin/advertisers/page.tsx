import Link from "next/link"

import { Users, Building2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, AdminStat } from "@/components/admin-primitives"
import { getUsersByRole } from "@/lib/platform-queries"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"
import { CATEGORY_META } from "@/lib/types"

export default async function AdvertisersPage() {
  const advertisers = await getUsersByRole("company")
  const { companies, banners, campaigns, changeRequests } = await getCollections()

  // اجمع إحصائيات كل معلن.
  const rows = await Promise.all(
    advertisers.map(async (u) => {
      const company = u.companyId ? await companies.findOne({ _id: u.companyId }) : null
      const [bannersCount, campaignsCount, pendingChanges] = await Promise.all([
        banners.countDocuments({ advertiserId: u._id }),
        campaigns.countDocuments({ advertiserId: u._id }),
        changeRequests.countDocuments({ advertiserId: u._id, status: "pending" }),
      ])
      return {
        user: u,
        company,
        bannersCount,
        campaignsCount,
        pendingChanges,
      }
    }),
  )

  const totalBanners = rows.reduce((s, r) => s + r.bannersCount, 0)
  const totalCampaigns = rows.reduce((s, r) => s + r.campaignsCount, 0)
  const totalPending = rows.reduce((s, r) => s + r.pendingChanges, 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المعلنون"
        subtitle="إدارة حسابات المعلنين وشركاتهم وإعلاناتهم وطلبات التعديل."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat icon={<Users className="size-5" />} label="إجمالي المعلنين" value={advertisers.length} tone="primary" />
        <AdminStat icon={<Building2 className="size-5" />} label="بنرات المعلنين" value={totalBanners} />
        <AdminStat icon={<Building2 className="size-5" />} label="حملات المعلنين" value={totalCampaigns} tone="gold" />
        <AdminStat icon={<Building2 className="size-5" />} label="تعديلات معلّقة" value={totalPending} tone="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المعلنين</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length > 0 ? (
            rows.map(({ user, company, bannersCount, campaignsCount, pendingChanges }) => (
              <div key={user._id} className="flex flex-col gap-3 rounded-xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                    {user.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">{user.email}</p>
                    {company && (
                      <Link href={`/companies/${company.slug}`} className="text-xs text-primary hover:underline">
                        {company.name} — {CATEGORY_META[company.category]?.ar}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                    {company?.status === "approved" ? "معتمدة" : company?.status === "pending" ? "قيد المراجعة" : company?.status === "rejected" ? "مرفوضة" : "لا شركة"}
                  </span>
                  <span className="text-muted-foreground">{toArabicDigits(bannersCount)} بنر</span>
                  <span className="text-muted-foreground">{toArabicDigits(campaignsCount)} حملة</span>
                  {pendingChanges > 0 && (
                    <Link href="/admin/approvals" className="rounded-full bg-gold/15 px-2.5 py-1 font-semibold text-gold-foreground">
                      {toArabicDigits(pendingChanges)} تعديل معلّق
                    </Link>
                  )}
                  <span className="text-muted-foreground/70">{timeAgo(user.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Users className="size-7" />}
              title="لا يوجد معلنون"
              description="ستظهر هنا حسابات الشركات المسجّلة كمعلنين."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
