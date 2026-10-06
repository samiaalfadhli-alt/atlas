"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BrandLogo } from "@/components/brand-logo"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryIcon } from "@/components/category-icon"
import { PlanPicker } from "@/components/plan-picker"
import { useAuth } from "@/contexts/auth-context"
import {
  CATEGORY_META,
  SAUDI_CITIES,
  SERVICE_OPTIONS,
  type Category,
} from "@/lib/types"
import { isPlanId, type PlanId } from "@/lib/plans"

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export default function RegisterPage() {
  const { refresh } = useAuth()
  const router = useRouter()

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    category: "" as Category | "",
    city: "",
    tagline: "",
    description: "",
    companyPhone: "",
    services: [] as string[],
    planId: "" as PlanId | "",
  })
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const services = form.category ? SERVICE_OPTIONS[form.category] : []

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
    if (!isPlanId(form.planId)) {
      setErrors({ planId: "اختر إحدى الباقات للمتابعة" })
      toast.error("يرجى اختيار إحدى الباقات لإكمال التسجيل")
      return
    }
    setLoading(true)
    setErrors({})
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.fields) setErrors(data.fields)
        toast.error(data.error || "تعذّر إنشاء الحساب")
        return
      }
      await refresh()
      toast.success("تم إنشاء حساب شركتك بنجاح. سيظهر ملفك للعامة بعد اعتماد الإدارة.")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("تعذّر إنشاء الحساب")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <BrandLogo height={56} className="mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold">سجّل شركتك</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ ملف شركتك واعرض خدماتك وأعمالك أمام آلاف أصحاب المشاريع — تجربة
            مجانية ٣٠ يومًا وباقات تبدأ من ١٠٠ ﷼ شهريًا
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Account */}
          <Card title="بيانات الحساب" subtitle="المعلومات التي ستدخل بها إلى لوحة التحكم">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم" error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="اسمك الكامل"
                  className="h-10"
                />
              </Field>
              <Field label="رقم الجوال" >
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="h-10"
                />
              </Field>
              <Field label="البريد الإلكتروني" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="h-10"
                />
              </Field>
              <Field label="كلمة المرور" error={errors.password}>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="٨ أحرف على الأقل"
                  className="h-10"
                />
              </Field>
            </div>
          </Card>

          {/* Company */}
          <Card title="بيانات الشركة" subtitle="المعلومات التي ستظهر في ملف شركتك العام">
            <div className="space-y-4">
              <Field label="اسم الشركة" error={errors.companyName}>
                <Input
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="مثال: شركة البناء الحديث"
                  className="h-10"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="التخصص" error={errors.category}>
                  <Select
                    value={form.category}
                    onValueChange={(v) => {
                      set("category", v as Category)
                      set("services", [])
                    }}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <CategoryIcon category={cat} className="size-4" />
                          {CATEGORY_META[cat].ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="المدينة" error={errors.city}>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAUDI_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="رقم هاتف الشركة">
                <Input
                  value={form.companyPhone}
                  onChange={(e) => set("companyPhone", e.target.value)}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="h-10"
                />
              </Field>

              <Field label="وصف مختصر (شعار الشركة)">
                <Input
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="مثال: نبني بيوتاً تدوم أجيالاً"
                  className="h-10"
                />
              </Field>

              <Field label="نبذة عن الشركة" error={errors.description}>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="اكتب وصفاً موجزاً عن شركتك وخبراتها وخدماتها (٢٠ حرفاً على الأقل)"
                  rows={4}
                />
              </Field>

              {services.length > 0 && (
                <Field label="الخدمات التي تقدمها">
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
                </Field>
              )}
            </div>
          </Card>

          {/* Package */}
          <Card
            title="اختر باقتك"
            subtitle="التسجيل مجاني ولا يتطلب بطاقة ائتمان — اختر الباقة المناسبة لشركتك"
          >
            <PlanPicker
              value={form.planId}
              onChange={(id) => set("planId", id)}
              error={errors.planId}
            />
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} size="lg" className="h-11 w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              {loading ? "جارٍ الإنشاء…" : "إنشاء حساب الشركة"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

function Card({
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
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
