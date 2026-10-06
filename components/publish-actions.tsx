"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  Loader2,
  Pause,
  Play,
  Send,
  Trash2,
  Undo2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

type EntityType = "banner" | "campaign" | "article" | "project"

const STATUS_PATH: Record<EntityType, string> = {
  banner: "/api/banners",
  campaign: "/api/campaigns",
  article: "/api/articles",
  project: "/api/projects",
}

const PUBLISHED_STATUS: Record<EntityType, string> = {
  banner: "active",
  campaign: "active",
  article: "published",
  project: "published",
}

function isStaffRole(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

export function PublishActions({
  entityType,
  id,
  currentStatus,
  onDelete,
}: {
  entityType: EntityType
  id: string
  currentStatus: string
  onDelete?: boolean
}) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = React.useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")

  const staff = isStaffRole(user?.role ?? "")
  const isPending = currentStatus === "pending-review" || currentStatus === "draft" || currentStatus === "rejected"
  const isLive = currentStatus === "active" || currentStatus === "published"
  const path = `${STATUS_PATH[entityType]}/${id}/status`

  async function setStatus(status: string, label: string, action: string) {
    setLoading(action)
    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإجراء", "Could not complete"))
        return
      }
      toast.success(label)
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإجراء", "Could not complete"))
    } finally {
      setLoading(null)
    }
  }

  async function submitReject() {
    if (reason.trim().length < 3) {
      toast.error(t("اكتب سبب الرفض", "Enter a reason"))
      return
    }
    setLoading("reject")
    try {
      const res = await fetch(path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الرفض", "Could not reject"))
        return
      }
      toast.success(t("تم الرفض", "Rejected"))
      setRejectOpen(false)
      setReason("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الرفض", "Could not reject"))
    } finally {
      setLoading(null)
    }
  }

  async function remove() {
    setLoading("delete")
    try {
      const res = await fetch(STATUS_PATH[entityType] + "/" + id, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الحذف", "Could not delete"))
        return
      }
      toast.success(t("تم الحذف", "Deleted"))
      router.refresh()
    } catch {
      toast.error(t("تعذّر الحذف", "Could not delete"))
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {staff ? (
          <>
            {isPending && (
              <Button
                size="sm"
                onClick={() => setStatus(PUBLISHED_STATUS[entityType], t("تم الاعتماد والنشر", "Approved & published"), "approve")}
                disabled={loading !== null}
              >
                {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {t("اعتماد ونشر", "Approve")}
              </Button>
            )}
            {isPending && (
              <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)} disabled={loading !== null}>
                {loading === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
                {t("رفض", "Reject")}
              </Button>
            )}
            {isLive && (
              <Button size="sm" variant="outline" onClick={() => setStatus("paused", t("تم الإيقاف", "Paused"), "pause")} disabled={loading !== null}>
                {loading === "pause" ? <Loader2 className="size-3.5 animate-spin" /> : <Pause className="size-3.5" />}
                {t("إيقاف", "Pause")}
              </Button>
            )}
            {currentStatus === "paused" && (
              <Button size="sm" onClick={() => setStatus(PUBLISHED_STATUS[entityType], t("تم التفعيل", "Activated"), "activate")} disabled={loading !== null}>
                {loading === "activate" ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                {t("تفعيل", "Activate")}
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={remove} disabled={loading !== null}>
                {loading === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </Button>
            )}
          </>
        ) : (
          <>
            {currentStatus === "draft" && (
              <Button size="sm" onClick={() => setStatus("pending-review", t("تم الإرسال للمراجعة", "Sent for review"), "submit")} disabled={loading !== null}>
                {loading === "submit" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                {t("إرسال للمراجعة", "Submit for review")}
              </Button>
            )}
            {currentStatus === "pending-review" && (
              <Button size="sm" variant="outline" onClick={() => setStatus("draft", t("تم السحب", "Withdrawn"), "withdraw")} disabled={loading !== null}>
                {loading === "withdraw" ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
                {t("سحب", "Withdraw")}
              </Button>
            )}
            {currentStatus === "rejected" && (
              <Button size="sm" onClick={() => setStatus("draft", t("تمت إعادة المسودة", "Back to draft"), "resubmit")} disabled={loading !== null}>
                {loading === "resubmit" ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
                {t("تعديل وإعادة إرسال", "Edit & resubmit")}
              </Button>
            )}
            {(isLive || currentStatus === "paused") && (
              <span className="text-xs text-muted-foreground">
                {t("بانتظار إدارة المنصة", "Managed by platform admin")}
              </span>
            )}
          </>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("رفض وطلب سبب", "Reject with reason")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={t("اكتب سبب الرفض…", "Write the rejection reason…")}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={submitReject} disabled={loading !== null}>
              {loading === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {t("رفض وإرسال", "Reject & send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
