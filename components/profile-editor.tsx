"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

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
import { useLanguage } from "@/contexts/language-context"
import {
  CATEGORY_META,
  SAUDI_CITIES,
  SERVICE_OPTIONS,
  type Company,
} from "@/lib/types"

export function ProfileEditor({ company }: { company: Company }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [form, setForm] = React.useState({
    name: company.name,
    nameEn: company.nameEn ?? "",
    tagline: company.tagline,
    description: company.description,
    city: company.city,
    district: company.district ?? "",
    phone: company.phone,
    email: company.email,
    website: company.website ?? "",
    logoUrl: company.logoUrl ?? "",
    coverUrl: company.coverUrl ?? "",
    establishedYear: company.establishedYear ?? "",
    teamSize: company.teamSize ?? "",
    services: company.services,
  })
  const [saving, setSaving] = React.useState(false)

  const services = SERVICE_OPTIONS[company.category]

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleService(service: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${company._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الحفظ", "Could not save"))
        return
      }
      if (data.pending) {
        toast.info(
          t(
            "تم إرسال التعديلات للمراجعة — لن تظهر إلا بعد اعتماد الإدارة",
            "Sent for review — visible after admin approval",
          ),
        )
      } else {
        toast.success(t("تم حفظ التعديلات", "Changes saved"))
      }
      router.refresh()
    } catch {
      toast.error(t("تعذّر الحفظ", "Could not save"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
        <span className="mt-0.5 size-2 shrink-0 rounded-full bg-gold" />
        <p className="text-sm leading-relaxed text-gold-foreground">
          {t(
            "تعديلاتك تُرسل للمراجعة ولا تُنشر مباشرة. تظهر على الموقع بعد اعتماد الإدارة.",
            "Your edits go to review and are not published directly. They appear after admin approval.",
          )}
        </p>
      </div>
      <Section title="الهوية" subtitle="الاسم والوصف الذي يميّز شركتك">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الشركة (عربي)">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
          </Field>
          <Field label="اسم الشركة (إنجليزي - اختياري)">
            <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" className="h-10" />
          </Field>
        </div>
        <Field label="شعار/وصف مختصر">
          <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="h-10" />
        </Field>
        <Field label="نبذة عن الشركة">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
        </Field>
      </Section>

      <Section title="موقع الخدمة" subtitle="المدينة والحي ونطاق عملك">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المدينة">
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAUDI_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الحي (اختياري)">
            <Input value={form.district} onChange={(e) => set("district", e.target.value)} className="h-10" />
          </Field>
        </div>
      </Section>

      <Section title="بيانات التواصل" subtitle="كيف يصل إليك أصحاب المشاريع">
        <div className="grid gap-4 sm:grid-cols-2">
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

      <Section title="الصور" subtitle="صورة الغلاف والشعار (رابط مباشر)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رابط صورة الغلاف">
            <Input value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
          <Field label="رابط الشعار (اختياري)">
            <Input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
        </div>
      </Section>

      <Section title="الخدمات" subtitle={`الخدمات المتاحة لتخصص ${CATEGORY_META[company.category].ar}`}>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label
              key={s}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-secondary/50",
                form.services.includes(s) && "border-primary bg-primary/5",
              )}
            >
              <Checkbox
                checked={form.services.includes(s)}
                onCheckedChange={() => toggleService(s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} size="lg" className="h-11">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? t("جارٍ الحفظ…", "Saving…") : t("حفظ التعديلات", "Save changes")}
        </Button>
        {company.status === "approved" && (
          <a
            href={`/companies/${company.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            عرض الصفحة العامة ↗
          </a>
        )}
      </div>
    </form>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
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
