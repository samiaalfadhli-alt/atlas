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
import { SAUDI_CITIES } from "@/lib/types"

export function ProjectForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imageUrl: "",
    city: "",
    district: "",
    category: "",
    status: "ready",
    priceFrom: "",
    units: "",
    handoverDate: "",
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 3) {
      toast.error(t("اكتب عنوان المشروع", "Enter a title"))
      return
    }
    if (form.description.trim().length < 20) {
      toast.error(t("اكتب وصفاً للمشروع", "Write a description"))
      return
    }
    if (!form.imageUrl.trim()) {
      toast.error(t("رابط الصورة مطلوب", "Image URL required"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceFrom: Number(form.priceFrom) || 0,
          publishStatus: "published",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر النشر", "Could not publish"))
        return
      }
      toast.success(data.message || t("تم نشر المشروع", "Project published"))
      setOpen(false)
      setForm({ title: "", description: "", imageUrl: "", city: "", district: "", category: "", status: "ready", priceFrom: "", units: "", handoverDate: "" })
      router.refresh()
    } catch {
      toast.error(t("تعذّر النشر", "Could not publish"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("مشروع جديد", "New project")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("إضافة مشروع", "Add a project")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("عنوان المشروع", "Title")}>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
          </Field>
          <Field label={t("الوصف", "Description")}>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
          </Field>
          <Field label={t("رابط الصورة", "Image URL")}>
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("المدينة", "City")}>
              <Select value={form.city} onValueChange={(v) => set("city", v === "all" ? "" : v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue placeholder={t("اختر", "Select")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("—", "—")}</SelectItem>
                  {SAUDI_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("الحي", "District")}>
              <Input value={form.district} onChange={(e) => set("district", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("الحالة", "Status")}>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="off-plan">{t("على المخطط", "Off-plan")}</SelectItem>
                  <SelectItem value="under-construction">{t("قيد الإنشاء", "Under construction")}</SelectItem>
                  <SelectItem value="ready">{t("جاهز", "Ready")}</SelectItem>
                  <SelectItem value="sold-out">{t("مباع بالكامل", "Sold out")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("التصنيف", "Category")}>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-10" placeholder={t("مثال: فلل، شقق", "e.g. Villas")} />
            </Field>
            <Field label={t("السعر من (ريال)", "Price from (SAR)")}>
              <Input type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("الوحدات", "Units")}>
              <Input value={form.units} onChange={(e) => set("units", e.target.value)} className="h-10" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t("نشر", "Publish")}
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
