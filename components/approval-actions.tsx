"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Loader2, X, MessageSquarePlus } from "lucide-react"

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

type Action = "approve" | "reject" | "request-changes"

export function ChangeRequestActions({ id }: { id: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = React.useState<null | Action>(null)
  const [dialogAction, setDialogAction] = React.useState<null | "reject" | "request-changes">(null)
  const [reason, setReason] = React.useState("")

  async function approve() {
    setLoading("approve")
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الاعتماد", "Could not approve"))
        return
      }
      toast.success(t("تم الاعتماد والنشر", "Approved & published"))
      router.refresh()
    } catch {
      toast.error(t("تعذّر الاعتماد", "Could not approve"))
    } finally {
      setLoading(null)
    }
  }

  async function submitWithReason() {
    if (!dialogAction) return
    if (reason.trim().length < 3) {
      toast.error(t("اكتب السبب/الملاحظات", "Enter a reason"))
      return
    }
    setLoading(dialogAction)
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: dialogAction, reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإجراء", "Could not complete"))
        return
      }
      toast.success(
        dialogAction === "reject"
          ? t("تم الرفض وإرسال السبب", "Rejected & reason sent")
          : t("تم طلب التعديل", "Changes requested"),
      )
      setDialogAction(null)
      setReason("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإجراء", "Could not complete"))
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={approve} disabled={loading !== null}>
          {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {t("اعتماد ونشر", "Approve & publish")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDialogAction("request-changes")} disabled={loading !== null}>
          <MessageSquarePlus className="size-3.5" />
          {t("طلب تعديل", "Request changes")}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setDialogAction("reject")} disabled={loading !== null}>
          {loading === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
          {t("رفض", "Reject")}
        </Button>
      </div>

      <Dialog open={dialogAction !== null} onOpenChange={(o) => !o && setDialogAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "reject"
                ? t("رفض التعديل", "Reject change")
                : t("طلب تعديل", "Request changes")}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={
              dialogAction === "reject"
                ? t("اكتب سبب الرفض…", "Write the rejection reason…")
                : t("اكتب الملاحظات المطلوبة…", "Write the requested changes…")
            }
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogAction(null)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button onClick={submitWithReason} disabled={loading !== null}>
              {loading !== null ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {dialogAction === "reject" ? t("رفض وإرسال", "Reject & send") : t("إرسال", "Send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
