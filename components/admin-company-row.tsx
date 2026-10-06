"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Clock, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/components/category-icon"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORY_META, type Company } from "@/lib/types"
import { formatDate, toArabicDigits } from "@/lib/format"

const STATUS_STYLE: Record<string, string> = {
  approved: "border-primary/30 bg-primary/10 text-primary",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
}

const STATUS_LABEL: Record<string, string> = {
  approved: "معتمدة",
  pending: "قيد المراجعة",
  rejected: "مرفوضة",
}

export function AdminCompanyRow({ company }: { company: Company }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)
  const meta = CATEGORY_META[company.category]

  async function setStatus(status: "approved" | "rejected") {
    setBusy(status)
    try {
      const res = await fetch(`/api/admin/companies/${company._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر التحديث", "Could not update"))
        return
      }
      toast.success(
        status === "approved" ? t("تم اعتماد الشركة", "Company approved") : t("تم رفض الشركة", "Company rejected"),
      )
      router.refresh()
    } catch {
      toast.error(t("تعذّر التحديث", "Could not update"))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold text-white"
          style={{ backgroundColor: `var(--${meta.colorVar})` }}
        >
          {company.name.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/companies/${company.slug}`}
              className="font-heading text-sm font-bold hover:text-primary"
            >
              {company.name}
            </Link>
            <Badge variant="outline" className={cn("h-5", STATUS_STYLE[company.status])}>
              {STATUS_LABEL[company.status]}
            </Badge>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CategoryIcon category={company.category} className="size-3" />
              {meta.ar}
            </span>
            <span>{company.city}</span>
            <span>{formatDate(company.createdAt)}</span>
            <span>{toArabicDigits(company.portfolio.length)} مشروع</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {company.status !== "approved" && (
          <Button
            size="sm"
            onClick={() => void setStatus("approved")}
            disabled={busy !== null}
          >
            {busy === "approved" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            اعتماد
          </Button>
        )}
        {company.status !== "rejected" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => void setStatus("rejected")}
            disabled={busy !== null}
          >
            {busy === "rejected" ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            رفض
          </Button>
        )}
        {company.status === "pending" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void setStatus("approved")}
            disabled={busy !== null}
          >
            <Clock className="size-4" />
            مراجعة
          </Button>
        )}
      </div>
    </div>
  )
}
