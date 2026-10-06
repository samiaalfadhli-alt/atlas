import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/category-icon"
import { PortfolioGallery } from "@/components/portfolio-gallery"
import { ReviewsBlock } from "@/components/reviews-block"
import { StarRating } from "@/components/star-rating"
import { EmptyState } from "@/components/empty-state"
import { BannerCarousel } from "@/components/banner-carousel"
import { getCompanyBySlug, getReviews } from "@/lib/queries"
import { getCompanyBanners } from "@/lib/platform-queries"
import { CATEGORY_META } from "@/lib/types"
import { formatRating, toArabicDigits } from "@/lib/format"

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyBySlug(slug)
  if (!company) return { title: "الشركة غير موجودة | أطلس المنزل" }
  return {
    title: `${company.name} | أطلس المنزل`,
    description: company.tagline || company.description.slice(0, 150),
  }
}

export default async function CompanyDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const company = await getCompanyBySlug(slug)
  if (!company) notFound()

  const reviews = await getReviews(company._id)
  const allBanners = await getCompanyBanners(company._id)
  const activeBanners = allBanners.filter((b) => b.status === "active")
  const meta = CATEGORY_META[company.category]
  const colorVar = meta.colorVar
  const cover = company.coverUrl
  const initials = company.name.slice(0, 2)

  return (
    <main className="flex-1">
      {/* Cover */}
      <section className="relative">
        <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-72">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={company.name} className="size-full object-cover" />
          ) : (
            <div className={cn("blueprint-fine flex size-full items-center justify-center bg-primary/10")}>
              <CategoryIcon category={company.category} className="size-16 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <nav className="-mb-2 flex items-center gap-1.5 py-3 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">الرئيسية</Link>
            <span>/</span>
            <Link href="/companies" className="hover:text-foreground">الشركات</Link>
            <span>/</span>
            <Link href={`/companies?category=${company.category}`} className="hover:text-foreground">
              {meta.ar}
            </Link>
            <span>/</span>
            <span className="truncate text-foreground">{company.name}</span>
          </nav>

          <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span
                className="-mt-12 flex size-24 shrink-0 items-center justify-center rounded-2xl font-heading text-3xl font-bold text-white ring-4 ring-background shadow-lg sm:size-28"
                style={{ backgroundColor: `var(--${colorVar})` }}
              >
                {initials}
              </span>
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      <ShieldCheck className="size-3.5" />
                      موثّقة
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{company.tagline}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: `var(--${colorVar})` }}
                  >
                    <CategoryIcon category={company.category} className="size-3.5" />
                    {meta.ar}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {company.city}
                    {company.district ? ` - ${company.district}` : ""}
                  </span>
                  <StarRating rating={company.rating} showValue count={company.reviewCount} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-8">
          {activeBanners.length > 0 && (
            <BannerCarousel banners={activeBanners} />
          )}

          <Section title="نبذة عن الشركة" id="about">
            <p className="text-sm leading-loose text-foreground/85 sm:text-base">
              {company.description}
            </p>
          </Section>

          {company.services.length > 0 && (
            <Section title="الخدمات" id="services">
              <div className="flex flex-wrap gap-2">
                {company.services.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="h-7 border-border bg-secondary/50 px-3 text-sm font-medium"
                  >
                    <CheckCircle2 className="size-3.5 text-primary" />
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          <Section
            title="الأعمال السابقة"
            id="portfolio"
            count={company.portfolio.length}
          >
            {company.portfolio.length > 0 ? (
              <PortfolioGallery projects={company.portfolio} />
            ) : (
              <EmptyState
                icon={<Building2 className="size-7" />}
                title="لا توجد أعمال منشورة بعد"
                description="لم تنشر هذه الشركة مشاريعها السابقة حتى الآن."
              />
            )}
          </Section>

          <Section
            title="التقييمات"
            id="reviews"
            count={company.reviewCount}
          >
            <ReviewsBlock
              companyId={company._id}
              ownerId={company.ownerId}
              initial={reviews}
            />
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-sm font-bold">تواصل مع الشركة</h3>
            <div className="space-y-2.5">
              <ContactRow icon={<Phone className="size-4" />} label="الهاتف">
                <a href={`tel:${company.phone}`} className="font-medium hover:text-primary" dir="ltr">
                  {company.phone}
                </a>
              </ContactRow>
              <ContactRow icon={<Mail className="size-4" />} label="البريد">
                <a href={`mailto:${company.email}`} className="break-all font-medium hover:text-primary" dir="ltr">
                  {company.email}
                </a>
              </ContactRow>
              {company.website && (
                <ContactRow icon={<Globe className="size-4" />} label="الموقع">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium hover:text-primary"
                    dir="ltr"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </ContactRow>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href={`tel:${company.phone}`}>
                  <Phone className="size-4" />
                  اتصل الآن
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href={`mailto:${company.email}`}>
                  <Mail className="size-4" />
                  راسل عبر البريد
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-sm font-bold">معلومات الشركة</h3>
            <dl className="space-y-3 text-sm">
              <Fact icon={<Building2 className="size-4" />} label="التخصص" value={meta.ar} />
              <Fact icon={<MapPin className="size-4" />} label="المدينة" value={company.city} />
              {company.establishedYear && (
                <Fact
                  icon={<Calendar className="size-4" />}
                  label="سنة التأسيس"
                  value={toArabicDigits(company.establishedYear)}
                />
              )}
              {company.teamSize && (
                <Fact icon={<Users className="size-4" />} label="حجم الفريق" value={company.teamSize} />
              )}
              <Fact
                icon={<Building2 className="size-4" />}
                label="عدد المشاريع"
                value={`${toArabicDigits(company.portfolio.length || company.projectCount)} مشروع`}
              />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="text-muted-foreground">التقييم العام</dt>
                <dd>
                  <StarRating rating={company.rating} showValue count={company.reviewCount} />
                </dd>
              </div>
            </dl>
          </div>

          <Link
            href="/companies"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowRight className="size-4 rtl:rotate-180" />
            العودة إلى الدليل
          </Link>
        </aside>
      </div>
    </main>
  )
}

function Section({
  title,
  id,
  count,
  children,
}: {
  title: string
  id: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        {typeof count === "number" && count > 0 && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
            {toArabicDigits(count)}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        {children}
      </div>
    </div>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
