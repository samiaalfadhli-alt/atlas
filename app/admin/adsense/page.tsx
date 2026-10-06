import Link from "next/link"

import { DollarSign, Plug, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader, DisconnectedNotice } from "@/components/admin-primitives"
import { AdSenseSlotAdder, AdSenseSlotRow } from "@/components/adsense-slots"
import { getAdSenseSlots, getIntegration } from "@/lib/platform-queries"
import { toArabicDigits } from "@/lib/format"

export default async function AdSensePage() {
  const [slots, integration] = await Promise.all([
    getAdSenseSlots(),
    getIntegration("google-adsense"),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google AdSense"
        subtitle="ربط حساب AdSense وإدارة أماكن إعلانية قابلة للإدارة عبر الموقع."
      />

      <DisconnectedNotice
        provider="Google AdSense"
        description="لم يتم ربط AdSense بعد. بعد الربط عبر التكامل الرسمي، ستظهر هنا: الانطباعات، النقرات، نسبة النقر (CTR)، الأرباح التقديرية، RPM وأداء الإعلانات — ببيانات حقيقية فقط."
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            أماكن الإعلانات القابلة للإدارة
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {toArabicDigits(slots.filter((s) => s.enabled).length)} مفعّل من {toArabicDigits(slots.length)}
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.length > 0 ? (
            slots.map((s) => (
              <AdSenseSlotRow
                key={s._id}
                id={s._id}
                name={s.name}
                location={s.location}
                enabled={s.enabled}
              />
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">لا توجد مواضع بعد.</p>
          )}
          <div className="border-t border-border pt-3">
            <AdSenseSlotAdder />
          </div>
          <p className="text-xs text-muted-foreground">
            تفعيل الموضع لا يعرض إعلاناً فعلياً حتى يتم ربط AdSense. يلتزم النظام بسياسات Google AdSense.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-primary" />
            الالتزام بسياسات AdSense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>لا يُعرض إعلان في موضع مفعّل إلا بعد ربط الحساب واعتماد Google للموقع.</p>
          <p>الحالة: <span className="font-semibold text-foreground">{integration?.status === "connected" ? "متصل" : "غير متصل"}</span></p>
          <p className="flex items-center gap-1"><DollarSign className="size-3.5" /> الأرباح تُعرض فقط عند توفر بيانات التكامل الرسمي.</p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/admin/reports" className="hover:text-foreground">عرض مركز التحليلات الموحّد →</Link>
      </p>
    </div>
  )
}
