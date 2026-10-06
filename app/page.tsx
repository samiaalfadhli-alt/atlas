import Link from "next/link"

import {
  ArrowLeft,
  Building2,
  PencilRuler,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HeroSearch } from "@/components/hero-search"
import { CompanyCard } from "@/components/company-card"
import { CategoryIcon } from "@/components/category-icon"
import { BannerCarousel, type BannerSlide } from "@/components/banner-carousel"
import {
  getFeaturedCompanies,
  getCategoryStats,
  getDistinctCities,
} from "@/lib/queries"
import { getActiveBannersForPlacement } from "@/lib/platform-queries"
import { CATEGORIES, CATEGORY_META } from "@/lib/types"
import { toArabicDigits } from "@/lib/format"

// هذه الصفحة تعتمد على بيانات حية من قاعدة البيانات (الشركات المميّزة،
// إحصاءات التصنيفات، المدن، البنرات). لا تتوفر MONGODB_URI أثناء بناء الإنتاج،
// لذا نُعرّضها ديناميكيًا عند الطلب بدل التوليد المسبق الثابت.
export const dynamic = "force-dynamic"

// بنرات العرض الافتراضية للمنصة — تظهر عندما لا توجد بنرات معتمدة من المعلنين
// بعد، ليبقى الكاروسيل المتحرّك متعدد الصور ظاهرًا دائمًا في الصفحة الرسمية.
const DEFAULT_HERO_BANNERS: BannerSlide[] = [
  {
    _id: "default-hero-1",
    title: "صمّم منزلك بأيدٍ سعودية ماهرة",
    description:
      "اكتشف أفضل مصممي الديكور الداخلي في المملكة — من الفكرة حتى آخر لمسة.",
    desktopImage: "/generated/banners/banner-interior-0x0e6685ac.webp",
    ctaLabel: "تصفّح مصممي الديكور",
    ctaUrl: "/companies?category=interior-designer",
  },
  {
    _id: "default-hero-2",
    title: "مقاولون ومعماريون موثوقون لمشروعك",
    description:
      "نفّذ مشروعك بثقة مع مقاولين ومعماريين معتمدين ومراجَعين عبر المنصة.",
    desktopImage: "/generated/banners/banner-architecture-0x9788a813.webp",
    ctaLabel: "اعثر على مقاولك",
    ctaUrl: "/companies?category=contractor",
  },
  {
    _id: "default-hero-3",
    title: "فرص عقارية وتطوير في كل مدن المملكة",
    description:
      "تصفّح أبرز شركات العقارات والتطوير العقاري واستثمر بوضوح وثقة.",
    desktopImage: "/generated/banners/banner-real-estate-0x1263ba42.webp",
    ctaLabel: "استكشف العقارات",
    ctaUrl: "/companies?category=real-estate",
  },
]

// بنرات منتصف الصفحة الافتراضية — تظهر قبل قسم الشركات المميّزة مباشرةً.
// تُبرز النتائج المنجزة وجودة الأعمال بدل التصنيفات، لتمييزها عن بنر الهيرو.
const DEFAULT_MID_BANNERS: BannerSlide[] = [
  {
    _id: "default-mid-1",
    title: "منازل جاهزة بأعلى معايير التشطيب",
    description:
      "اطّلع على مشاريع منفّذة بأيدٍ سعودية ماهرة — من التصميم حتى آخر لمسة.",
    desktopImage: "/generated/banners/banner-mid-luxury-home-0x49898fa7.webp",
    ctaLabel: "شاهد الأعمال المنجزة",
    ctaUrl: "/projects",
  },
  {
    _id: "default-mid-2",
    title: "حرفية وجودة في كل تفصيلة",
    description:
      "مطابخ وديكورات وتشطيبات تنفّذها نخبة الشركات المعتمدة على المنصة.",
    desktopImage: "/generated/banners/banner-mid-craftsmanship-0xce73d59e.webp",
    ctaLabel: "اكتشف ملفات الشركات",
    ctaUrl: "/companies",
  },
  {
    _id: "default-mid-3",
    title: "ابنِ منزل عائلتك بثقة",
    description:
      "شركات عقارات وتطوير موثوقة تقدّم لك خيارات جاهزة في مختلف مدن المملكة.",
    desktopImage: "/generated/banners/banner-mid-family-home-0x18fbbb07.webp",
    ctaLabel: "تصفّح الخيارات العقارية",
    ctaUrl: "/companies?category=real-estate",
  },
]

export default async function HomePage() {
  const [featured, stats, cities, heroBanners, midBanners] = await Promise.all([
    getFeaturedCompanies(6),
    getCategoryStats(),
    getDistinctCities(),
    getActiveBannersForPlacement("hero"),
    getActiveBannersForPlacement("mid-page"),
  ])

  // بنرات المعلنين المعتمدة إن وُجدت، وإلا بنرات العرض الافتراضية للمنصة.
  const bannerSlides: BannerSlide[] =
    heroBanners.length > 0 ? heroBanners : DEFAULT_HERO_BANNERS

  // بنرات منتصف الصفحة قبل قسم الشركات المميّزة.
  const midBannerSlides: BannerSlide[] =
    midBanners.length > 0 ? midBanners : DEFAULT_MID_BANNERS

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-gold" />
            دليل المملكة الأول لشركات البناء والتصميم والعقارات
          </span>

          <h1 className="max-w-4xl font-heading text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            كل ما تحتاجه
            <span className="relative mx-2 inline-block text-primary">
              لبناء منزلك
              <span className="measure-line absolute -bottom-1 inset-x-0 h-1.5 opacity-70" aria-hidden />
            </span>
            في مكان واحد
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ابحث وقارن بين المصممين والمهندسين والمقاولين، وشركات العزل والتكييف
            والأثاث والحدائق والإضاءة والمطابخ والدهانات، والشركات العقارية والتطوير
            العقاري — في مختلف مدن المملكة، واختر شريك مشروعك بثقة ووضوح.
          </p>

          <div className="w-full max-w-3xl">
            <HeroSearch cities={cities} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <Stat label="شركة معتمدة" value={stats.total} />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <Stat label="تصنيف رئيسي" value={CATEGORIES.length} />
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              شركات موثّقة ومراجَعة
            </span>
          </div>
        </div>
      </section>

      {/* بنر متحرّك متعدد الصور — الصفحة الرسمية */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6">
        <BannerCarousel banners={bannerSlides} />
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            ١٢ تصنيفاً
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            اختر التصنيف المناسب لمشروعك
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            صُنّفت الشركات في اثني عشر تصنيفاً رئيسياً تغطي رحلة المنزل من التصميم
            والبناء والعزل والتكييف حتى التشطيب والعقارات، وفي كل تصنيف تخصصات
            فرعية تسهّل الوصول لما تبحث عنه.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const count = stats.byCategory[cat]
            return (
              <Link
                key={cat}
                href={`/companies?category=${cat}`}
                className="group/cat relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.image}
                    alt={meta.ar}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover/cat:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                  {/* gold accent bar — ذهبي على الـ hover */}
                  <span
                    className="absolute inset-x-0 top-0 h-1 origin-right scale-x-0 bg-gold transition-transform duration-300 group-hover/cat:scale-x-100 rtl:origin-left"
                    aria-hidden
                  />
                  {/* line icon — عنابي */}
                  <span className="absolute bottom-3 start-3 flex size-11 items-center justify-center rounded-xl bg-card shadow-md ring-1 ring-border sm:start-4">
                    <CategoryIcon category={cat} className="size-6 text-primary" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4 pt-5">
                  <h3 className="font-heading text-base font-bold leading-tight">
                    {meta.ar}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {meta.description.ar}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {meta.subcategories.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[0.62rem] font-medium text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                      {toArabicDigits(count)} مقدم خدمة
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors group-hover/cat:text-gold">
                      تصفّح
                      <ArrowLeft className="size-3.5 transition-transform group-hover/cat:-translate-x-1 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* بنر متحرّك قبل الشركات المميّزة — منتصف الصفحة */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <BannerCarousel banners={midBannerSlides} />
      </section>

      {/* Featured companies */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                شركات مختارة
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                شركات مميّزة هذا الشهر
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/companies">
                عرض كل الشركات
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          {featured.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((company) => (
                <CompanyCard key={company._id} company={company} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Building2 className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                لا توجد شركات معتمدة بعد. كن أول من ينضم إلى الدليل.
              </p>
              <Button asChild size="sm">
                <Link href="/auth/register">سجّل شركتك الآن</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            كيف يعمل أطلس المنزل
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            ثلاث خطوات تجد بها شريكك
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Step
            n="١"
            icon={<Search className="size-6" />}
            title="ابحث وصفِّ النتائج"
            desc="حدّد التصنيف والتخصص الفرعي والمدينة التي تحتاجها، وصفّ الشركات حسب التقييم أو الأحدث."
          />
          <Step
            n="٢"
            icon={<PencilRuler className="size-6" />}
            title="قارن الأعمال والخدمات"
            desc="اطّلع على ملف كل شركة وأعمالها السابقة وخدماتها وتقييمات العملاء قبل الاختيار."
          />
          <Step
            n="٣"
            icon={<Sparkles className="size-6" />}
            title="تواصل وابدأ مشروعك"
            desc="تواصل مباشرة مع الشركة المناسبة عبر بياناتها المعتمدة وابدأ رحلة بناء منزلك."
          />
        </div>
      </section>

      {/* For companies CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12">
          <div className="blueprint-fine absolute inset-0 opacity-20" aria-hidden />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-start">
            <div className="max-w-xl space-y-3">
              <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
                هل تقدّم خدمة في البناء أو التصميم أو العقارات؟
              </h2>
              <p className="text-primary-foreground/80">
                انضم إلى أطلس المنزل واعرض شركتك أمام آلاف أصحاب المشاريع في المملكة.
                أنشئ ملف شركتك، أضف أعمالك، واستقبل طلبات العملاء — مع تجربة مجانية
                ٣٠ يومًا وباقات تبدأ من ١٠٠ ﷼ شهريًا.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
                <Link href="/auth/register">
                  <Users className="size-5" />
                  سجّل شركتك مجاناً
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/about">تعرّف على المنصة</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-heading text-lg font-bold tabular-nums text-foreground">
        {toArabicDigits(value)}
      </span>
      {label}
    </span>
  )
}

function Step({
  n,
  icon,
  title,
  desc,
}: {
  n: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className={cn("relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6")}>
      <span className="absolute end-5 top-5 font-heading text-5xl font-bold text-muted-foreground/15">
        {n}
      </span>
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  )
}
