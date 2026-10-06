import Link from "next/link"

import { Megaphone, Plug, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader, DisconnectedNotice } from "@/components/admin-primitives"
import { getIntegration } from "@/lib/platform-queries"

export default async function GoogleAdsPage() {
  const integration = await getIntegration("google-ads")

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Google Ads"
        subtitle="ربط حساب Google Ads عبر APIs الرسمية والصلاحيات الآمنة لعرض أداء الحملات."
      />

      <DisconnectedNotice
        provider="Google Ads"
        description="لم يتم ربط Google Ads بعد. بعد الربط عبر OAuth وGoogle Ads API، ستظهر هنا: الحملات، الانطباعات، النقرات، نسبة النقر (CTR)، تكلفة النقرة (CPC)، التكلفة، التحويلات وقيمة التحويلات — بتقارير يومية وأسبوعية وشهرية."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" />
            خطوات الربط الرسمية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Step n="١" text="فعّل Google Ads API في Google Cloud Console وأنشئ بيانات اعتماد OAuth." />
          <Step n="٢" text="امنح صلاحية الوصول إلى الحساب الإعلاني عبر OAuth." />
          <Step n="٣" text="احفظ بيانات الربط في متغيرات البيئة الآمنة على الخادم." />
          <Step n="٤" text="بعد الربط، تُعرض تقارير حقيقية فقط — بدون أرقام تجريبية." />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Megaphone className="size-4 text-primary" />
              المقاييس بعد الربط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• الحملات والانطباعات والنقرات</li>
              <li>• CTR و CPC والتكلفة</li>
              <li>• التحويلات وقيمة التحويلات</li>
              <li>• تقارير يومية / أسبوعية / شهرية</li>
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
            <p>ربط عبر OAuth الرسمي من Google فقط — لا طرق مخالفة.</p>
            <p>المفاتيح على الخادم فقط ولا تُعرض للمستخدمين.</p>
            <p>الحالة: <span className="font-semibold text-foreground">{integration?.status === "connected" ? "متصل" : "غير متصل"}</span></p>
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
