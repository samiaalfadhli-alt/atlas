"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Mail, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { EMAIL_SEGMENTS } from "@/lib/types"

export function EmailListForm() {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [name, setName] = React.useState("")
  const [segment, setSegment] = React.useState("customers")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error(t("اكتب اسم القائمة", "Enter a list name"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/email/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), segment }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإنشاء", "Could not create"))
        return
      }
      toast.success(t("تم إنشاء القائمة", "List created"))
      setOpen(false)
      setName("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإنشاء", "Could not create"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          {t("قائمة جديدة", "New list")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("إنشاء قائمة بريدية", "Create a mailing list")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("اسم القائمة", "List name")}>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
          </Field>
          <Field label={t("الشريحة", "Segment")}>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMAIL_SEGMENTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{isArabic ? s.ar : s.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t("إنشاء", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EmailSubscriberAdder({ listId }: { listId: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [city, setCity] = React.useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast.error(t("بريد غير صالح", "Invalid email"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/email/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, email: email.trim(), name: name.trim(), city: city.trim(), segment: "customers" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإضافة", "Could not add"))
        return
      }
      toast.success(data.existed ? t("المشترك موجود مسبقاً", "Already subscribed") : t("تمت الإضافة", "Added"))
      setEmail("")
      setName("")
      setCity("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإضافة", "Could not add"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد" dir="ltr" className="h-9" />
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("الاسم", "Name")} className="h-9" />
      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("المدينة", "City")} className="h-9" />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {t("إضافة", "Add")}
      </Button>
    </form>
  )
}

export function EmailCampaignForm({ listId }: { listId?: string }) {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    subject: "",
    preheader: "",
    body: "",
    segment: "customers",
    scheduledAt: "",
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 3 || form.subject.trim().length < 3 || form.body.trim().length < 10) {
      toast.error(t("أكمل الحقول المطلوبة", "Complete required fields"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, listId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الحفظ", "Could not save"))
        return
      }
      toast.success(data.message || t("تم حفظ الحملة", "Campaign saved"))
      setOpen(false)
      setForm({ name: "", subject: "", preheader: "", body: "", segment: "customers", scheduledAt: "" })
      router.refresh()
    } catch {
      toast.error(t("تعذّر الحفظ", "Could not save"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="size-4" />
          {t("حملة بريدية", "Email campaign")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("إنشاء حملة بريدية", "Create an email campaign")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-foreground">
            {t(
              "الإرسال الفعلي يتطلب ربط مزوّد بريد معتمد عبر التكامل. الحملة تُحفظ الآن.",
              "Actual sending requires connecting an approved email provider. The campaign is saved now.",
            )}
          </p>
          <Field label={t("اسم الحملة", "Campaign name")}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("عنوان الرسالة", "Subject")}>
              <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("الشريحة", "Segment")}>
              <Select value={form.segment} onValueChange={(v) => set("segment", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMAIL_SEGMENTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{isArabic ? s.ar : s.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label={t("الديباجة (Preheader)", "Preheader")}>
            <Input value={form.preheader} onChange={(e) => set("preheader", e.target.value)} className="h-10" />
          </Field>
          <Field label={t("محتوى الرسالة", "Body")}>
            <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={6} />
          </Field>
          <Field label={t("جدولة الإرسال (اختياري)", "Schedule (optional)")}>
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} dir="ltr" className="h-10" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {form.scheduledAt ? t("جدولة", "Schedule") : t("حفظ كمسودة", "Save draft")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  )
}
