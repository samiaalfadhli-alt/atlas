"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CATEGORIES,
  CATEGORY_META,
  SAUDI_CITIES,
  SERVICE_OPTIONS,
  type Category,
} from "@/lib/types"

export function AddCompanyForm() {
  const router = useRouter()
  const [saving, setSaving] = React.useState<"draft" | "review" | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    nameEn: "",
    category: "" as Category | "",
    tagline: "",
    description: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    coverUrl: "",
    establishedYear: "",
    teamSize: "",
    services: [] as string[],
    subcategories: [] as string[],
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    verified: false,
    featured: false,
  })

  const services = form.category ? SERVICE_OPTIONS[form.category] : []

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggle(field: "services" | "subcategories", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((s) => s !== value)
        : [...prev[field], value],
    }))
  }

  async function submit(status: "draft" | "review") {
    if (form.name.trim().length < 3) {
      toast.error("اسم الشركة مطلوب")
      return
    }
    if (!form.category) {
      toast.error("اختر التصنيف")
      return
    }
    if (form.description.trim().length < 20) {
      toast.error("اكتب وصفاً لا يقل عن ٢٠ حرفاً")
      return
    }
    setSaving(status)
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: status === "draft" ? "pending" : "approved",
          keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "تعذّر الحفظ")
        return
      }
      toast.success(data.message || "تم حفظ الشركة")
      router.push("/admin/companies")
      router.refresh()
    } catch {
      toast.error("تعذّر الحفظ")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <Section title="الهوية" subtitle="الاسم والوصف والشعار">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الشركة (عربي) *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
          </Field>
          <Field label="الاسم الإنجليزي (اختياري)">
            <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" className="h-10" />
          </Field>
        </div>
        <Field label="التصنيف الرئيسي *">
          <Select value={form.category} onValueChange={(v) => set("category", v as Category)}>
            <SelectTrigger className="h-10 w-full"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CATEGORY_META[c].ar}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="شعار/وصف مختصر">
          <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="h-10" />
        </Field>
        <Field label="نبذة عن الشركة *">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
        </Field>
      </Section>

      <Section title="الموقع والتواصل" subtitle="المدينة والحي وبيانات الاتصال">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المدينة *">
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
              <SelectContent>
                {SAUDI_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الحي">
            <Input value={form.district} onChange={(e) => set("district", e.target.value)} className="h-10" />
          </Field>
          <Field label="الهاتف">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" className="h-10" />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} dir="ltr" className="h-10" />
          </Field>
          <Field label="الموقع الإلكتروني (اختياري)">
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} dir="ltr" className="h-10" />
          </Field>
          <Field label="سنة التأسيس (اختياري)">
            <Input value={form.establishedYear} onChange={(e) => set("establishedYear", e.target.value)} dir="ltr" className="h-10" />
          </Field>
        </div>
      </Section>

      <Section title="الصور" subtitle="الشعار وصورة الغلاف (روابط مباشرة)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رابط الشعار (اختياري)">
            <Input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
          <Field label="رابط صورة الغلاف">
            <Input value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
        </div>
      </Section>

      {form.category && (
        <Section title="التخصصات الفرعية والخدمات" subtitle={`متاحة لتخصص ${CATEGORY_META[form.category].ar}`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-secondary/50",
                  form.subcategories.includes(s) && "border-primary bg-primary/5",
                )}
              >
                <Checkbox
                  checked={form.subcategories.includes(s)}
                  onCheckedChange={() => toggle("subcategories", s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="تحسين محركات البحث (SEO)" subtitle="إعدادات ظهور الشركة في نتائج البحث">
        <div className="grid gap-4">
          <Field label="SEO Title (اختياري)">
            <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
          </Field>
          <Field label="SEO Description (اختياري)">
            <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} />
          </Field>
          <Field label="الكلمات المفتاحية (افصل بفاصلة)">
            <Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} className="h-10" />
          </Field>
        </div>
      </Section>

      <Section title="حالة الظهور" subtitle="خيارات التوثيق والتمييز">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
            <Checkbox checked={form.verified} onCheckedChange={(v) => set("verified", Boolean(v))} />
            شركة موثّقة
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
            <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", Boolean(v))} />
            شركة مميّزة
          </label>
        </div>
      </Section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
        <Button onClick={() => submit("review")} disabled={saving !== null} size="lg">
          {saving === "review" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          حفظ واعتماد ونشر
        </Button>
        <Button onClick={() => submit("draft")} disabled={saving !== null} variant="outline" size="lg">
          {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          حفظ كمسودة قيد المراجعة
        </Button>
        <p className="text-xs text-muted-foreground">
          المسودة لا تظهر للعامة حتى يتم اعتمادها.
        </p>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="font-heading text-base font-bold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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
