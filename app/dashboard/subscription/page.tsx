import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Crown,
  Diamond,
  Gift,
  Minus,
  Sparkles,
  Star,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { getSession } from "@/lib/session"
import { getCompanyByOwner } from "@/lib/queries"
import { formatDate, toArabicDigits } from "@/lib/format"
import { PLANS, TRIAL_DAYS, daysUntil, getPlan } from "@/lib/plans"
import type { Plan } from "@/lib/plans"

const ACCENT_ICON: Record<Plan["accent"], React.ReactNode> = {
  primary: <Sparkles className="size-5" />,
  gold: <Crown className="size-5" />,
}

export default async function SubscriptionPage() {
  const session = await getSession()
  if (!session) return null
  const company = await getCompanyByOwner(session.id)
  if (!company) {
    return (
      <EmptyState
        icon={<Sparkles className="size-7" />}
        title="لم يتم العثور على ملف شركة"
        description="تواصل مع الدعم إذا واجهت هذه المشكلة."
      />
    )
  }

  const subscription = company.subscription
  const currentPlan = subscription ? getPlan(subscription.planId) : undefined
  const remaining = subscription ? daysUntil(subscription.trialEnd) : 0
  const trialActive = subscription?.status === "trialing" && remaining > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">باقتي ومزايا الاشتراك</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اخترت باقة عند تسجيل شركتك — التسجيل مجاني ولا يتطلب بطاقة ائتمان،
          وتبدأ الفترة التجريبية المجانية ({toArabicDigits(TRIAL_DAYS)} يومًا)
          فور إنشاء الحساب قبل بدء الاشتراك الشهري.
        </p>
      </div>

      {subscription ? (
        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-xl",
                    currentPlan?.accent === "gold"
                      ? "bg-gold/15 text-gold-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {currentPlan ? ACCENT_ICON[currentPlan.accent] : <Sparkles className="size-5" />}
                </span>
                <div>
                  <p className="font-heading text-lg font-bold leading-tight">
                    {currentPlan?.fullName.ar ?? subscription.planName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {toArabicDigits(subscription.price)} ﷼ / شهريًا بعد انتهاء التجربة
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold",
                  trialActive
                    ? "border-gold/50 bg-gold/10 text-gold-foreground"
                    : "border-border bg-secondary text-muted-foreground",
                )}
              >
                {trialActive ? <Gift className="size-4" /> : <Clock className="size-4" />}
                {trialActive ? "تجربة مجانية مفعّلة" : "الفترة التجريبية منتهية"}
              </span>
            </div>

            {trialActive ? (
              <div className="grid gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 sm:grid-cols-3">
                <Info label="الأيام المتبقية" value={`${toArabicDigits(remaining)} يومًا`} />
                <Info label="تنتهي التجربة في" value={formatDate(subscription.trialEnd)} />
                <Info
                  label="الاشتراك بعد التجربة"
                  value={`${toArabicDigits(subscription.price)} ﷼ / شهريًا`}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  انتهت الفترة التجريبية المجانية.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  فعّل اشتراكك الشهري ({toArabicDigits(subscription.price)} ﷼) للاستمرار في
                  الاستفادة من مزايا الباقة. لتفعيل الاشتراك تواصل مع إدارة المنصة.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <h2 className="mb-3 font-heading text-sm font-bold">مزايا باقتك الحالية</h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {currentPlan?.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      !feature.included && "opacity-60",
                    )}
                  >
                    {feature.included ? (
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          currentPlan.accent === "gold"
                            ? "text-gold-foreground"
                            : "text-primary",
                        )}
                      />
                    ) : (
                      <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className="text-foreground/90">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              لم يتم ربط باقة بهذا الحساب بعد. تواصل مع إدارة المنصة لتفعيل باقتك.
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-1 font-heading text-xl font-bold">مقارنة الباقات</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          التسجيل مجاني ولا يتطلب بطاقة ائتمان — اختر الباقة المناسبة لنموّ شركتك.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.planId === plan.id
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-5",
                  isCurrent
                    ? "border-primary ring-2 ring-primary/30"
                    : plan.premium
                      ? "border-gold/50"
                      : plan.popular
                        ? "border-primary/40"
                        : "border-border",
                )}
              >
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    <Star className="size-3.5" />
                    الأكثر طلبًا
                  </span>
                )}
                {plan.premium && !isCurrent && (
                  <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow-sm">
                    <Diamond className="size-3.5" />
                    بريميوم
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    <Check className="size-3.5" />
                    باقتك الحالية
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      plan.accent === "gold"
                        ? "bg-gold/15 text-gold-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {ACCENT_ICON[plan.accent]}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold leading-tight">
                      {plan.name.ar}
                    </h3>
                    <p className="text-xs text-muted-foreground">{plan.fullName.ar}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-1.5">
                  <span className="font-heading text-3xl font-bold leading-none tabular-nums">
                    {toArabicDigits(plan.price)}
                  </span>
                  <span className="mb-0.5 text-sm font-medium text-muted-foreground">
                    ﷼ / شهريًا
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            plan.accent === "gold"
                              ? "text-gold-foreground"
                              : "text-primary",
                          )}
                        />
                      ) : (
                        <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          feature.included
                            ? "text-foreground/90"
                            : "text-muted-foreground/70",
                        )}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          لترقية باقتك أو تفعيل الاشتراك الشهري بعد انتهاء التجربة، تواصل مع إدارة أطلس المنزل.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowRight className="size-4" />
            العودة للوحة التحكم
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-heading text-sm font-bold">{value}</p>
    </div>
  )
}
