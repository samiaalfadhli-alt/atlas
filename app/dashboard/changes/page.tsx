import { redirect } from "next/navigation"

import { ClipboardList, CheckCircle2, XCircle, Clock, MessageSquarePlus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader } from "@/components/admin-primitives"
import { getSession } from "@/lib/session"
import { getChangeRequestsByAdvertiser } from "@/lib/platform-queries"
import { toArabicDigits, timeAgo } from "@/lib/format"
import type { ChangeFieldValue } from "@/lib/types"

const STATUS_META: Record<string, { ar: string; tone: string; icon: React.ReactNode }> = {
  pending: { ar: "قيد المراجعة", tone: "text-gold-foreground", icon: <Clock className="size-3.5" /> },
  approved: { ar: "معتمد ومنشور", tone: "text-primary", icon: <CheckCircle2 className="size-3.5" /> },
  rejected: { ar: "مرفوض", tone: "text-destructive", icon: <XCircle className="size-3.5" /> },
  "changes-requested": { ar: "طلبت تعديلات", tone: "text-amber-600", icon: <MessageSquarePlus className="size-3.5" /> },
}

export default async function MyChangesPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/changes")

  const items = await getChangeRequestsByAdvertiser(session.id)
  const pending = items.filter((i) => i.status === "pending").length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="طلبات التعديل"
        subtitle={
          pending > 0
            ? `لديك ${toArabicDigits(pending)} تعديل بانتظار مراجعة الإدارة.`
            : "كل تعديلاتك تمت مراجعتها — لا توجد طلبات معلّقة."
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
        <span className="mt-0.5 size-2 shrink-0 rounded-full bg-gold" />
        <p className="text-sm leading-relaxed text-gold-foreground">
          كل تعديلاتك على بيانات الشركة والأعمال والصور تُرسل للمراجعة ولا تُنشر مباشرة. تظهر على الموقع بعد اعتماد الإدارة فقط.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((req) => {
            const meta = STATUS_META[req.status] ?? STATUS_META.pending
            return (
              <Card key={req._id}>
                <CardHeader className="flex-row items-center justify-between gap-2">
                  <CardTitle className="text-sm">{req.entityName}</CardTitle>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${meta.tone}`}>
                    {meta.icon}
                    {meta.ar}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {entityTypeLabel(req.entityType)} • {timeAgo(req.createdAt)}
                  </p>
                  {req.changes.length > 0 && (
                    <div className="space-y-1.5 rounded-lg bg-secondary/40 p-3">
                      {req.changes.map((c) => (
                        <div key={c.field} className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-[120px_1fr_1fr]">
                          <span className="font-semibold">{c.fieldLabel}</span>
                          <span className="text-muted-foreground line-through">{formatValue(c.oldValue)}</span>
                          <span className="font-medium text-primary">{formatValue(c.newValue)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {req.rejectionReason && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {req.status === "rejected" ? "سبب الرفض" : "ملاحظات الإدارة"}: {req.rejectionReason}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardList className="size-8" />}
          title="لا توجد طلبات تعديل"
          description="عند تعديل بيانات شركتك أو إضافة أعمال، ستظهر طلباتك هنا مع حالة المراجعة."
        />
      )}
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
    default:
      return type
  }
}

function formatValue(value: ChangeFieldValue): string {
  if (value === null || value === "") return "—"
  if (Array.isArray(value)) return value.length ? value.join("، ") : "—"
  return String(value)
}
