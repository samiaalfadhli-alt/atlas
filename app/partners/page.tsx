import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Crown,
  Diamond,
  Images,
  Minus,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/plans"
import { toArabicDigits } from "@/lib/format"
import type { Plan } from "@/lib/plans"

export const metadata: Metadata = {
  title: "انضم كشريك | أطلس المنزل",
  description:
    "هل أنت مصمم أو مقاول أو مورد؟ انضم إلى أطلس المنزل وأعرض خدماتك أمام آلاف العملاء الباحثين عنك. التسجيل مجاني ولا يتطلب بطاقة ائتمان.",
}

const BENEFITS = [
  {
    icon: <BadgeCheck className="size-6" />,
    title: "ملف تعريفي احترافي",
    desc: "صفحة شركاتك الخاصة تعرض هويتك وخبراتك وخدماتك بشكل يبني الثقة.",
  },
  {
    icon: <Images className="size-6" />,
    title: "عرض أعمالك ومشاريعك",
    desc: "معرض صور ومشاريع منجزة يُبرز جودة عملك أمام كل زائر.",
  },
  {
    icon: <Users className="size-6" />,
    title: "الوصول لعملاء جدد",
    desc: "آلاف أصحاب المشاريع يبحثون عنك يوميًا في مختلف مدن المملكة.",
  },
  {
    icon: <TrendingUp className="size-6" />,
    title: "زيادة فرصك في النمو",
    desc: "ظهور مميّز وإحصائيات وإعلانات ترفع فرصك في كسب عملاء جدد.",
  },
]

const ACCENT_ICON: Record<Plan["accent"], React.ReactNode> = {
  primary: <Sparkles className="size-5" />,
  gold: <Crown className="size-5" />,
}

export default function PartnersPage() {
  return (
    <main className="flex-1">
      {/* هيرو الشركاء */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-gold" />
            للشركات والمقاولين والموردين
          </span>

          <h1 className="font-heading text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            هل أنت مصمم أو مقاول أو مورد؟
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            انضم إلى أطلس المنزل وأعرض خدماتك أمام آلاف العملاء الباحثين عنك.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/auth/register">
                <UserPlus className="size-5" />
                سجل الآن كشريك
              </Link>
            </Button>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              التسجيل مجاني — لا حاجة لبطاقة ائتمان
            </p>
          </div>
        </div>
      </section>

      {/* المزايا */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {b.icon}
              </span>
              <h3 className="font-heading text-lg font-bold leading-tight">{b.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الباقات */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              الباقات
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              اختر الباقة المناسبة لنموّ شركتك
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              كل الباقات اشتراك شهري — التسجيل مجاني ولا يتطلب بطاقة ائتمان.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 text-center">
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <Link href="/auth/register">
                <UserPlus className="size-4" />
                سجل الآن كشريك
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              التسجيل مجاني — لا حاجة لبطاقة ائتمان
            </p>
          </div>
        </div>
      </section>

      {/* تذييل دعوة */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
          <div className="blueprint-fine absolute inset-0 opacity-20" aria-hidden />
          <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:justify-between md:text-start">
            <div className="max-w-xl space-y-2">
              <h2 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
                جاهز تبدأ تعرض خدماتك؟
              </h2>
              <p className="text-primary-foreground/80">
                أنشئ ملف شركتك اليوم وكن بين أوائل من ينضمون إلى دليل أطلس المنزل.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 shrink-0 px-6 text-base">
              <Link href="/auth/register">
                سجل الآن كشريك
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function PricingCard({ plan }: { plan: Plan }) {
  const isPremium = plan.premium
  const isPopular = plan.popular

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-5",
        isPremium ? "border-gold/50" : isPopular ? "border-primary/40" : "border-border",
      )}
    >
      {isPopular && (
        <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
          <Star className="size-3.5" />
          الأكثر طلبًا
        </span>
      )}
      {isPremium && (
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
          <h3 className="font-heading text-lg font-bold leading-tight">{plan.name.ar}</h3>
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
                  plan.accent === "gold" ? "text-gold-foreground" : "text-primary",
                )}
              />
            ) : (
              <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
            )}
            <span
              className={cn(
                feature.included ? "text-foreground/90" : "text-muted-foreground/70",
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="sm"
        variant={isPremium || isPopular ? "default" : "outline"}
        className={cn(
          "mt-5 h-10 w-full font-bold",
          isPremium && "bg-gold text-gold-foreground hover:bg-gold/90",
        )}
      >
        <Link href="/auth/register">اختيار</Link>
      </Button>
    </div>
  )
}
