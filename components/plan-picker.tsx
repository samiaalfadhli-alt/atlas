"use client"

import * as React from "react"
import { Check, Crown, Diamond, Minus, Sparkles, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { toArabicDigits } from "@/lib/format"
import { PLANS, type Plan, type PlanId } from "@/lib/plans"

const ACCENT_ICON: Record<Plan["accent"], React.ReactNode> = {
  primary: <Sparkles className="size-5" />,
  gold: <Crown className="size-5" />,
}

export function PlanPicker({
  value,
  onChange,
  error,
}: {
  value: PlanId | ""
  onChange: (id: PlanId) => void
  error?: string
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
        <Diamond className="size-4 shrink-0 text-gold-foreground" />
        <p className="text-sm font-semibold text-gold-foreground">
          التسجيل مجاني — لا حاجة لبطاقة ائتمان. اختر باقتك الآن وابدأ فورًا.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const selected = value === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              aria-pressed={selected}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-5 text-right transition-all",
                "hover:border-primary/60 hover:shadow-md",
                selected
                  ? "border-primary ring-2 ring-primary/30 shadow-md"
                  : "border-border",
                plan.premium && !selected && "border-gold/50",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                  <Star className="size-3.5" />
                  الأكثر طلبًا
                </span>
              )}
              {plan.premium && (
                <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground shadow-sm">
                  <Diamond className="size-3.5" />
                  بريميوم
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
                  <p className="text-xs text-muted-foreground">
                    {plan.fullName.ar}
                  </p>
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

              <div
                className={cn(
                  "mt-5 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
                  selected
                    ? plan.accent === "gold"
                      ? "bg-gold text-gold-foreground"
                      : "bg-primary text-primary-foreground"
                    : "border border-border bg-secondary/40 text-foreground",
                )}
              >
                {selected ? (
                  <>
                    <Check className="size-4" />
                    مُختارة
                  </>
                ) : (
                  "اختيار"
                )}
              </div>
            </button>
          )
        })}
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
