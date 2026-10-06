import Link from "next/link"

import {
  ArrowUpRight,
  Briefcase,
  Clock,
  Eye,
  Star,
  XCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { EmptyState } from "@/components/empty-state"
import { SubscriptionCard } from "@/components/subscription-card"
import { getSession } from "@/lib/session"
import { getCompanyByOwner, getReviews } from "@/lib/queries"
import { getChangeRequestsByAdvertiser } from "@/lib/platform-queries"
import { toArabicDigits, formatDate } from "@/lib/format"
import type { Company } from "@/lib/types"

export default async function DashboardOverviewPage() {
  const session = await getSession()
  if (!session) return null
  const company = await getCompanyByOwner(session.id)
  if (!company) {
    return (
      <EmptyState
        icon={<Briefcase className="size-7" />}
        title="لم يتم العثور على ملف شركة"
        description="تواصل مع الدعم إذا واجهت هذه المشكلة."
      />
    )
  }

  const [reviews, changeRequests] = await Promise.all([
    getReviews(company._id),
    getChangeRequestsByAdvertiser(session.id),
  ])
  const pendingChanges = changeRequests.filter((c) => c.status === "pending").length
  const recentReviews = reviews.slice(0, 4)

  return (
    <div className="space-y-6">
      <StatusBanner company={company} />

      {pendingChanges > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
          <p className="text-sm font-medium text-gold-foreground">
            لديك {toArabicDigits(pendingChanges)} تعديل بانتظار اعتماد الإدارة.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/changes">عرض الطلبات</Link>
          </Button>
        </div>
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold">{company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{company.tagline}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Star className="size-5" />}
          label="التقييم"
          value={company.rating > 0 ? company.rating.toFixed(1) : "—"}
          hint={`${toArabicDigits(company.reviewCount)} تقييم`}
        />
        <StatCard
          icon={<Briefcase className="size-5" />}
          label="المشاريع"
          value={toArabicDigits(company.portfolio.length)}
          hint="منشورة"
        />
        <StatCard
          icon={<Eye className="size-5" />}
          label="الخدمات"
          value={toArabicDigits(company.services.length)}
          hint="خدمة معروضة"
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="تاريخ الانضمام"
          value={formatDate(company.createdAt)}
          hint=""
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>أحدث التقييمات</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/reviews">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((r) => (
                <div
                  key={r._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{r.userName}</span>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {r.comment || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                لا توجد تقييمات بعد.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/profile">
                  <Pencil className="size-4" />
                  تعديل ملف الشركة
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/portfolio">
                  <Briefcase className="size-4" />
                  إضافة عمل جديد
                </Link>
              </Button>
              {company.status === "approved" && (
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/companies/${company.slug}`}>
                    <ArrowUpRight className="size-4" />
                    عرض الصفحة العامة
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">حالة الظهور</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {company.status === "approved"
                  ? "شركتك ظاهرة في الدليل العام ويمكن لأصحاب المشاريع التواصل معك."
                  : company.status === "pending"
                    ? "ملف شركتك قيد المراجعة من قبل إدارة أطلس المنزل وسيظهر للعامة بعد الاعتماد."
                    : "ملف شركتك لم يُعتمد. يرجى مراجعة البيانات أو التواصل مع الدعم."}
              </p>
            </CardContent>
          </Card>

          <SubscriptionCard subscription={company.subscription} />
        </div>
      </div>
    </div>
  )
}

function StatusBanner({ company }: { company: Company }) {
  if (company.status === "approved") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <CheckCircle2 className="size-5 text-primary" />
        <p className="text-sm font-medium text-primary">
          شركتك معتمدة ومرئية في الدليل العام.
        </p>
        <Badge variant="secondary" className="ms-auto">معتمدة</Badge>
      </div>
    )
  }
  if (company.status === "pending") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Clock className="size-5 text-amber-600" />
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          ملف شركتك قيد المراجعة. ستظهر للعامة بعد اعتماد الإدارة.
        </p>
        <Badge variant="outline" className="ms-auto border-amber-500/40 text-amber-700 dark:text-amber-400">
          قيد المراجعة
        </Badge>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
      <XCircle className="size-5 text-destructive" />
      <p className="text-sm font-medium text-destructive">
        لم يُعتمد ملف شركتك. يرجى مراجعة البيانات أو التواصل مع الدعم.
      </p>
      <Badge variant="destructive" className="ms-auto">مرفوضة</Badge>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-lg font-bold leading-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
