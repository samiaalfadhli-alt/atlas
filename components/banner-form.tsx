"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

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
import { AD_PLACEMENTS, SAUDI_CITIES } from "@/lib/types"

export function BannerForm({ advertiserMode }: { advertiserMode?: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    title: "",
    description: "",
    desktopImage: "",
    mobileImage: "",
    ctaLabel: "",
    ctaUrl: "",
    placement: "hero" as string,
    category: "",
    city: "",
    startDate: "",
    endDate: "",
    priority: "0",
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 3) {
      toast.error(t("اكتب اسم البنر", "Enter a banner name"))
      return
    }
    if (!form.desktopImage.trim()) {
      toast.error(t("رابط صورة البنر مطلوب", "Banner image URL is required"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإنشاء", "Could not create"))
        return
      }
      toast.success(data.message || t("تم إنشاء البنر", "Banner created"))
      setOpen(false)
      setForm({
        name: "", title: "", description: "", desktopImage: "", mobileImage: "",
        ctaLabel: "", ctaUrl: "", placement: "hero", category: "", city: "",
        startDate: "", endDate: "", priority: "0",
      })
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
        <Button>
          <Plus className="size-4" />
          {advertiserMode ? t("إنشاء بنر", "Create banner") : t("إضافة بنر", "Add banner")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("إنشاء بنر جديد", "Create a new banner")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {advertiserMode && (
            <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-foreground">
              {t(
                "البنر يُرسل للمراجعة ولا يظهر إلا بعد اعتماد الإدارة.",
                "The banner goes to review and appears only after admin approval.",
              )}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("اسم البنر", "Banner name")}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("العنوان", "Title")}>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
            </Field>
          </div>
          <Field label={t("الوصف", "Description")}>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("صورة Desktop (رابط)", "Desktop image URL")}>
              <Input value={form.desktopImage} onChange={(e) => set("desktopImage", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
            <Field label={t("صورة Mobile (رابط - اختياري)", "Mobile image URL")}>
              <Input value={form.mobileImage} onChange={(e) => set("mobileImage", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("نص الزر", "Button label")}>
              <Input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("رابط الزر", "Button URL")}>
              <Input value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("مكان الظهور", "Placement")}>
              <Select value={form.placement} onValueChange={(v) => set("placement", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_PLACEMENTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("المدينة (اختياري)", "City")}>
              <Select value={form.city} onValueChange={(v) => set("city", v === "all" ? "" : v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder={t("الكل", "All")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                  {SAUDI_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("تاريخ البداية", "Start date")}>
              <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("تاريخ النهاية", "End date")}>
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("الأولوية", "Priority")}>
              <Input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} dir="ltr" className="h-10" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {advertiserMode ? t("إرسال للمراجعة", "Submit for review") : t("إنشاء", "Create")}
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
