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
import { AD_PLACEMENTS, AD_TYPES, SAUDI_CITIES } from "@/lib/types"

export function CampaignForm({ advertiserMode }: { advertiserMode?: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    type: "image",
    imageUrl: "",
    videoUrl: "",
    copyText: "",
    linkUrl: "",
    ctaLabel: "",
    placement: "hero",
    category: "",
    city: "",
    audience: "",
    devices: "all",
    budget: "",
    startDate: "",
    endDate: "",
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 3) {
      toast.error(t("اكتب اسم الحملة", "Enter a campaign name"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, budget: Number(form.budget) || 0 }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإنشاء", "Could not create"))
        return
      }
      toast.success(data.message || t("تم إنشاء الحملة", "Campaign created"))
      setOpen(false)
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
          {advertiserMode ? t("إنشاء حملة", "Create campaign") : t("إضافة حملة", "Add campaign")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("إنشاء حملة إعلانية", "Create an ad campaign")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {advertiserMode && (
            <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-foreground">
              {t(
                "الحملة تُرسل للمراجعة ولا تظهر إلا بعد اعتماد الإدارة.",
                "The campaign goes to review and appears only after admin approval.",
              )}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("اسم الحملة", "Campaign name")}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("نوع الإعلان", "Ad type")}>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AD_TYPES.map((tp) => (
                    <SelectItem key={tp.value} value={tp.value}>{tp.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label={t("نص الإعلان", "Ad copy")}>
            <Textarea value={form.copyText} onChange={(e) => set("copyText", e.target.value)} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("رابط الصورة", "Image URL")}>
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
            <Field label={t("رابط الفيديو (اختياري)", "Video URL")}>
              <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("نص الزر", "Button label")}>
              <Input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("رابط الوجهة", "Destination URL")}>
              <Input value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
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
            <Field label={t("الأجهزة", "Devices")}>
              <Select value={form.devices} onValueChange={(v) => set("devices", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">{t("جوال", "Mobile")}</SelectItem>
                  <SelectItem value="tablet">{t("لوحي", "Tablet")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("المدينة", "City")}>
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
            <Field label={t("الجمهور (اختياري)", "Audience")}>
              <Input value={form.audience} onChange={(e) => set("audience", e.target.value)} className="h-10" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("الميزانية (ريال)", "Budget (SAR)")}>
              <Input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("تاريخ البداية", "Start date")}>
              <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("تاريخ النهاية", "End date")}>
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} dir="ltr" className="h-10" />
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
