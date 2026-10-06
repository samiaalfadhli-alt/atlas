import Link from "next/link"

import { BarChart3, Plug, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader, DisconnectedNotice } from "@/components/admin-primitives"
import { getIntegration } from "@/lib/platform-queries"

export default async function GoogleAnalyticsPage() {
  const integration = await getIntegration("google-analytics")

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google Analytics"
        subtitle="ربط الموقع بـ Google Analytics 4 عبر التكامل الرسمي وعرض بيانات حقيقية."
      />

      <DisconnectedNotice
        provider="Google Analytics 4"
        description="لم يتم ربط Google Analytics بعد. بعد الربط عبر OAuth والـ Measurement ID، ستظهر هنا: المستخدمون، الجلسات، مشاهدات الصفحات، مصادر الزيارات، أعلى الصفحات والتصنيفات، المدن، الأجهزة، أداء الحملات والتحويلات."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            خطوات الربط الرسمية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Step n="١" text="أنشئ خاصية Google Analytics 4 من لوحة Google Analytics." />
          <Step n="٢" text="احصل على Measurement ID (يبدأ بـ G-) وضعه في متغيرات البيئة الآمنة." />
          <Step n="٣" text="اربط المنصة عبر OAuth لسحب بيانات التقارير برمجياً عبر Data API." />
          <Step n="٤" text="بعد الربط، تُعرض هنا البيانات الحقيقية فقط — بدون أي أرقام تجريبية." />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="size-4 text-primary" />
              المقاييس المتاحة بعد الربط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• المستخدمون والجلسات ومشاهدات الصفحات</li>
              <li>• مصادر الزيارات وأعلى الصفحات</li>
              <li>• التصنيفات والمدن والأجهزة</li>
              <li>• أداء الحملات والتحويلات</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-primary" />
              الأمان
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>تُحفظ مفاتيح الربط في بيئة آمنة على الخادم ولا تُ exposى للواجهة الأمامية.</p>
            <p>يستخدم الربط OAuth الرسمي من Google فقط.</p>
            <p>الحالة الحالية: <span className="font-semibold text-foreground">{integration?.status === "connected" ? "متصل" : "غير متصل"}</span></p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/admin/reports" className="hover:text-foreground">عرض مركز التحليلات الموحّد →</Link>
      </p>
    </div>
  )
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{n}</span>
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
}
