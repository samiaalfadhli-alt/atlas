import Link from "next/link"

import {
  Armchair,
  ArrowLeft,
  Clapperboard,
  Compass,
  Flag,
  Gem,
  HardHat,
  Heart,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  PaintRoller,
  Phone,
  Radio,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  Users,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const STATS = [
  { num: "+٣٠٠٠", label: "شركة معتمدة", gold: true },
  { num: "١٢", label: "تصنيف رئيسي", gold: false },
  { num: "+١٢ ألف", label: "زيارة شهرية", gold: false },
  { num: "١٣", label: "مدينة مغطاة", gold: false },
] as const

const JOURNEY = [
  {
    num: "المرحلة ١",
    title: "البناء والتأسيس",
    icon: HardHat,
  },
  {
    num: "المرحلة ٢",
    title: "الديكور والتشطيب",
    icon: PaintRoller,
  },
  {
    num: "المرحلة ٣",
    title: "الأثاث والتأثيث",
    icon: Armchair,
  },
  {
    num: "المرحلة ٤",
    title: "الصيانة والعناية المستمرة",
    icon: Wrench,
  },
] as const

const VMV = [
  {
    icon: Compass,
    title: "رؤيتنا",
    desc: "أن نكون الدليل الأول والأكثر ثقة لخدمات المنزل في المملكة العربية السعودية، ووجهة كل من يبحث عن مزود خدمة موثوق أو فرصة للنمو التجاري.",
  },
  {
    icon: Flag,
    title: "رسالتنا",
    desc: "تسهيل الوصول إلى خدمات المنزل الموثوقة عبر منصة رقمية منظمة، ودعم الشركات الصغيرة والمتوسطة من خلال أدوات تسويقية فعالة وبأسعار عادلة.",
  },
  {
    icon: Heart,
    title: "قيمنا",
    desc: "الشفافية في عرض المعلومات، الموضوعية في عرض جميع المعلنين بشكل عادل، والالتزام بدعم رواد الأعمال والمشاريع الصغيرة في القطاع المنزلي.",
  },
] as const

const GOALS = [
  {
    title: "تجميع الخدمات في مكان واحد",
    desc: "توفير دليل منظم يضم جميع تخصصات خدمات المنزل بدلاً من البحث المشتت عبر منصات متعددة.",
  },
  {
    title: "دعم الشركات الصغيرة والمتوسطة",
    desc: "منح أصحاب الأعمال أدوات تسويقية رقمية فعالة بأسعار تناسب جميع الأحجام.",
  },
  {
    title: "تسهيل التواصل المباشر",
    desc: "ربط العميل بمزود الخدمة مباشرة عبر واتساب والهاتف دون وسطاء أو رسوم إضافية.",
  },
  {
    title: "تغطية شاملة للمملكة",
    desc: "التوسع التدريجي لتغطية جميع مدن ومناطق المملكة العربية السعودية بمحتوى محلي دقيق.",
  },
  {
    title: "رفع جودة الخدمات المعروضة",
    desc: "مراجعة الشركات المسجلة والتأكد من جدية المعلنين لضمان تجربة موثوقة للعملاء.",
  },
  {
    title: "محتوى تسويقي احترافي للمعلنين",
    desc: "تقديم خدمات إنتاج محتوى وفيديو للباقات المميزة لمساعدة الشركات على الظهور بشكل أقوى.",
  },
] as const

const MARKETING = [
  {
    icon: Mail,
    title: "التسويق عبر البريد الإلكتروني",
    desc: "نشرات دورية للمعلنين والزوار بأحدث الإعلانات والعروض.",
  },
  {
    icon: Search,
    title: "محركات البحث (SEO)",
    desc: "تحسين ظهور الدليل والشركات المسجلة في نتائج البحث المحلية.",
  },
  {
    icon: Share2,
    title: "السوشيال ميديا",
    desc: "محتوى أسبوعي على إنستقرام، تيك توك، وسناب شات يعرض المعلنين.",
  },
  {
    icon: MessageCircle,
    title: "تطبيق وروابط مباشرة",
    desc: "زر واتساب مباشر لكل معلن لتسهيل التواصل الفوري مع العملاء.",
  },
  {
    icon: Megaphone,
    title: "الإعلانات الخارجية",
    desc: "لوحات إعلانية في المواقع الحيوية بالمدن الرئيسية وإعلانات على الحافلات.",
  },
  {
    icon: Tv,
    title: "التلفزيون",
    desc: "فقرات وإعلانات تعريفية على القنوات المحلية لتعزيز الثقة والانتشار.",
  },
  {
    icon: Radio,
    title: "الراديو",
    desc: "إعلانات صوتية خلال أوقات الذروة على محطات الراديو المحلية الشهيرة.",
  },
  {
    icon: Star,
    title: "التسويق بالمؤثرين",
    desc: "تعاون مع مشاهير ومؤثرين سعوديين لتعريف جمهور أوسع بالمنصة والمعلنين.",
  },
] as const

const WHY_US = [
  {
    icon: MapPin,
    title: "تصفح حسب المدينة",
    desc: "تغطية لمناطق المملكة مع فلترة دقيقة بالمدينة والتصنيف.",
  },
  {
    icon: Gem,
    title: "أسعار تناسب الجميع",
    desc: "باقات متدرجة من الأساسية إلى البريميوم لكل حجم عمل.",
  },
  {
    icon: Phone,
    title: "تواصل مباشر وسريع",
    desc: "تواصل فوري مع الشركات دون تسجيل أو وسطاء.",
  },
  {
    icon: Clapperboard,
    title: "محتوى احترافي للمعلنين",
    desc: "إنتاج فيديو وريلز للباقات المميزة لتعزيز ظهور العلامة.",
  },
] as const

export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-border/60 bg-primary">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
            <span className="size-1.5 rounded-full bg-gold" />
            عن أطلس المنزل
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            دليلك الموثوق لخدمات المنزل في المملكة
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            أطلس المنزل منصة سعودية متخصصة تجمع أصحاب المنازل بأفضل مزودي خدمات
            المنزل — في مكان واحد، بثقة وسهولة.
          </p>
        </div>
      </section>

      {/* ===== STORY + STATS ===== */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <SectionTag>قصة أطلس المنزل</SectionTag>
            <p className="text-sm leading-loose text-muted-foreground sm:text-[0.95rem]">
              تبدأ فكرة أي بيت من لحظة قرار البناء — وهنا تبدأ الحيرة: كيف تتعرف
              على شركة مقاولات موثوقة؟ من يرشّح لك مهندساً أو مصمم ديكور داخلي؟
              وما الفرق بين أنواع مواد السباكة والتشطيبات والدهانات؟ أين تجد شركات
              العزل، وشركات تركيب التكييف المركزي أو العادي، وأين تشتري الأثاث
              لتأسيس البيت من الصفر؟
            </p>
            <p className="text-sm leading-loose text-muted-foreground sm:text-[0.95rem]">
              كل هذه الأسئلة كانت متفرقة بين عشرات المصادر — توصيات أصدقاء، حسابات
              سوشيال ميديا متناثرة، وعروض غير موثوقة. من هنا وُلدت أطلس المنزل:
              دليل واحد يرافقك في رحلة بيتك الكاملة، من أول حجر أساس إلى آخر
              تفصيلة تشطيب وتأثيث.
            </p>
            <p className="text-sm leading-loose text-muted-foreground sm:text-[0.95rem]">
              ولأن رحلة البيت لا تنتهي بالتأسيس، يستمر أطلس المنزل معك بعد السكن
              أيضاً — في الصيانة الدورية، وعناية الحدائق المستمرة، وخدمات التنظيف
              والتعقيم التي تحافظ على بيتك وتجعله يعيش لسنوات بأفضل حال.
            </p>
            <p className="text-sm leading-loose text-muted-foreground sm:text-[0.95rem]">
              بهذا الشكل، يجمع أطلس المنزل كل مزودي الخدمات على اختلاف تخصصاتهم في
              منصة واحدة منظمة، تتيح للعميل التصفح حسب التصنيف أو المدينة والتواصل
              المباشر دون وسيط، وتمنح الشركات فرصة الوصول لعملاء حقيقيين بتكلفة
              إعلانية تناسب جميع الأحجام.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-6 text-center transition-colors ${
                  s.gold
                    ? "border-gold/60 bg-gradient-to-b from-gold/10 to-card"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`font-heading text-3xl font-extrabold leading-none sm:text-4xl ${
                    s.gold ? "text-gold" : "text-primary"
                  }`}
                >
                  {s.num}
                </div>
                <div className="mt-2 text-xs font-semibold text-muted-foreground sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== JOURNEY ===== */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <SectionTag>رحلة المنزل</SectionTag>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              نرافقك في كل مرحلة
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {JOURNEY.map((phase, i) => (
              <div
                key={phase.title}
                className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary p-5 text-white"
                style={{ minHeight: "8.5rem" }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 75% 25%, #fff 0%, transparent 45%)",
                  }}
                  aria-hidden
                />
                <phase.icon className="absolute end-4 top-4 size-6 text-gold" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <span className="text-[0.7rem] font-bold tracking-widest text-gold">
                    {phase.num}
                  </span>
                  <h3 className="mt-1 font-heading text-base font-bold leading-tight">
                    {phase.title}
                  </h3>
                </div>
                <span className="sr-only">المرحلة {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISION / MISSION / VALUES ===== */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <SectionTag>إلى أين نتجه</SectionTag>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            رؤيتنا ورسالتنا
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {VMV.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg"
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-gold">
                <item.icon className="size-6" />
              </span>
              <h3 className="font-heading text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GOALS ===== */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <SectionTag>لماذا أنشأنا هذا الدليل</SectionTag>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              أهدافنا
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {GOALS.map((goal, i) => (
              <div
                key={goal.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold/60"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/50 bg-secondary font-heading text-base font-extrabold text-primary">
                  {toArabicDigit(i + 1)}
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-heading text-base font-bold">
                    {goal.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {goal.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MARKETING METHODS ===== */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <SectionTag>كيف نصل لعملائنا</SectionTag>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            طرقنا التسويقية
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETING.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg"
            >
              <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <h3 className="font-heading text-sm font-bold leading-tight">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <SectionTag>ما يميزنا</SectionTag>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              لماذا أطلس المنزل؟
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg"
              >
                <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </span>
                <h3 className="font-heading text-base font-bold leading-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            شركات موثّقة ومراجَعة
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            تجربة عربية أولاً
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" />
            لوحة تحكم لكل شركة
          </span>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          جاهز للانضمام إلى أطلس المنزل؟
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          تصفّح الدليل الآن أو سجّل شركتك للوصول إلى آلاف العملاء المحتملين في
          المملكة.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/auth/register">
              <Users className="size-4" />
              سجّل شركتك مجاناً
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6">
            <Link href="/companies">
              تصفّح الدليل
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
      {children}
    </span>
  )
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

function toArabicDigit(n: number): string {
  return String(n)
    .split("")
    .map((d) => (/\d/.test(d) ? ARABIC_DIGITS[Number(d)]! : d))
    .join("")
}
