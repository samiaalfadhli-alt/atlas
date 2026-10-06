import Link from "next/link"
import { Sparkles, Crown, Clock, Gift, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, toArabicDigits } from "@/lib/format"
import { daysUntil, getPlan } from "@/lib/plans"
import type { Subscription, SubscriptionStatus } from "@/lib/types"

const STATUS_LABEL: Record<SubscriptionStatus, { ar: string; tone: "trial" | "ok" | "warn" | "muted" | "bad" }> = {
  trialing: { ar: "تجربة مجانية", tone: "trial" },
  active: { ar: "مفعّلة", tone: "ok" },
  past_due: { ar: "بانتظار الدفع", tone: "warn" },
  canceled: { ar: "ملغاة", tone: "muted" },
  expired: { ar: "منتهية", tone: "bad" },
}

const STATUS_CLASS: Record<string, string> = {
  trial: "border-gold/50 bg-gold/10 text-gold-foreground",
  ok: "border-primary/30 bg-primary/10 text-primary",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  muted: "border-border bg-secondary text-muted-foreground",
  bad: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function SubscriptionCard({ subscription }: { subscription?: Subscription }) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">الباقة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            لم يتم تفعيل باقة لهذه الشركة بعد.
          </p>
        </CardContent>
      </Card>
    )
  }

  const plan = getPlan(subscription.planId)
  const status = STATUS_LABEL[subscription.status]
  const remaining = daysUntil(subscription.trialEnd)
  const trialEnded =
    subscription.status === "trialing" && remaining === 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">باقتي</CardTitle>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_CLASS[trialEnded ? "bad" : status.tone]}`}
        >
          {trialEnded ? <Clock className="size-3.5" /> : <Gift className="size-3.5" />}
          {trialEnded ? "انتهت التجربة" : status.ar}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-9 items-center justify-center rounded-lg ${
              plan?.accent === "gold"
                ? "bg-gold/15 text-gold-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            {plan?.accent === "gold" ? (
              <Crown className="size-5" />
            ) : (
              <Sparkles className="size-5" />
            )}
          </span>
          <div>
            <p className="font-heading text-base font-bold leading-tight">
              {plan?.fullName.ar ?? subscription.planName}
            </p>
            <p className="text-xs text-muted-foreground">
              {toArabicDigits(subscription.price)} ﷼ / شهريًا بعد التجربة
            </p>
          </div>
        </div>

        {subscription.status === "trialing" && !trialEnded && (
          <div className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5">
            <p className="text-xs font-medium text-gold-foreground">
              متبقٍ {toArabicDigits(remaining)} يومًا من التجربة المجانية
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              تنتهي في {formatDate(subscription.trialEnd)}
            </p>
          </div>
        )}

        {trialEnded && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <p className="text-xs font-medium text-destructive">
              انتهت الفترة التجريبية في {formatDate(subscription.trialEnd)}.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              فعّل اشتراكك الشهري للاستمرار في الاستفادة من مزايا الباقة.
            </p>
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href="/dashboard/subscription">
            <ArrowUpRight className="size-4" />
            تفاصيل الباقة والمزايا
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
