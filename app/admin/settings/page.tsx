import Link from "next/link"

import {
  Palette,
  ShieldCheck,
  KeyRound,
  ScrollText,
  Plug,
  Lock,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin-primitives"
import { getIntegrations } from "@/lib/platform-queries"
import { getCollections } from "@/lib/db"
import { toArabicDigits } from "@/lib/format"

const BRAND_COLORS = [
  { name: "العنابي الرئيسي", hex: "#7e1842" },
  { name: "العنابي الداكن", hex: "#5E1233" },
  { name: "الذهبي", hex: "#D29E55" },
  { name: "الذهبي الفاتح", hex: "#E5C58F" },
  { name: "البيج المحايد", hex: "#D8C7B2" },
  { name: "الكريمي", hex: "#F7F1E8" },
  { name: "الأوف وايت", hex: "#FCFAF6" },
  { name: "البني الدافئ", hex: "#6B5545" },
  { name: "الفحمي", hex: "#292522" },
  { name: "الأبيض", hex: "#FFFFFF" },
]

export default async function SettingsPage() {
  const integrations = await getIntegrations()
  const { auditLogs } = await getCollections()
  const auditCount = await auditLogs.countDocuments()
  const connected = integrations.filter((i) => i.status === "connected").length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الإعدادات"
        subtitle="الهوية، الأمان، الصلاحيات والتكاملات الخارجية للمنصة."
      />

      {/* الهوية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            الهوية والشعار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            شعار «أطلس المنزل | HOME ATLAS» الرسمي معتمد كما هو — خط IBM Plex Sans Arabic للعناوين والنصوص، وأيقونات خطية رفيعة بألوان الهوية.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {BRAND_COLORS.map((c) => (
              <div key={c.hex} className="flex flex-col gap-1.5">
                <div
                  className="h-12 w-full rounded-lg ring-1 ring-border"
                  style={{ backgroundColor: c.hex }}
                />
                <p className="text-xs font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">{c.hex}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الأمان */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              الصلاحيات والأمان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <SecurityRow icon={<Lock className="size-4" />} text="Role-Based Access Control — أدوار منفصلة لكل فئة." />
            <SecurityRow icon={<ScrollText className="size-4" />} text={`سجل تدقيق كامل — ${toArabicDigits(auditCount)} عملية مسجّلة.`} />
            <SecurityRow icon={<KeyRound className="size-4" />} text="مفاتيح Google و Social APIs محفوظة في بيئة آمنة على الخادم." />
            <SecurityRow icon={<ShieldCheck className="size-4" />} text="كلمات المرور مشفّرة (scrypt) وجلسات آمنة عبر كوكيز HttpOnly." />
            <SecurityRow icon={<KeyRound className="size-4" />} text="2FA للحسابات الإدارية — جاهز للتفعيل عند ربط مزوّد التحقق." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plug className="size-4 text-primary" />
              التكاملات الخارجية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {toArabicDigits(connected)} متصل من {toArabicDigits(integrations.length)} تكامل.
            </p>
            <div className="space-y-1.5">
              {integrations.map((i) => (
                <div key={i._id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs">
                  <span>{i.provider}</span>
                  <span className={i.status === "connected" ? "font-semibold text-primary" : "text-muted-foreground"}>
                    {i.status === "connected" ? "متصل" : "غير متصل"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">إدارة المستخدمين والأدوار</Link>
        <span className="text-muted-foreground">•</span>
        <Link href="/admin/reports" className="text-sm font-medium text-primary hover:underline">مركز التحليلات</Link>
      </div>
    </div>
  )
}

function SecurityRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
