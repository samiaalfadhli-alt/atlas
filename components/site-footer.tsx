"use client"

import Link from "next/link"

import { useLanguage } from "@/contexts/language-context"
import { BrandLogo } from "@/components/brand-logo"
import { CATEGORY_META, type Category } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export function SiteFooter() {
  const { t, isArabic } = useLanguage()
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="blueprint-fine border-b border-border/60">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandLogo height={40} />
              <span className="font-heading text-lg font-bold">
                {t("أطلس المنزل", "Atlas Al Manzil")}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(
                "منصة سعودية تجمع المصممين والمهندسين والمقاولين، وشركات الأثاث والحدائق والإضاءة والمطابخ والدهانات، والشركات العقارية والتطوير العقاري لتختار شريك مشروعك بثقة ووضوح.",
                "A Saudi platform that brings together designers, architects, contractors, and furniture, landscaping, lighting, kitchens and painting firms, plus real-estate and development companies so you can choose your project partner with confidence.",
              )}
            </p>
          </div>

          <FooterCol title={t("التصنيفات", "Categories")}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/companies?category=${cat}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {isArabic ? CATEGORY_META[cat].ar : CATEGORY_META[cat].en}
              </Link>
            ))}
          </FooterCol>

          <FooterCol title={t("استكشف", "Explore")}>
            <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground">
              {t("كل الشركات", "All companies")}
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              {t("عن المنصة", "About")}
            </Link>
            <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground">
              {t("سجّل شركتك", "List your company")}
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
              {t("تسجيل الدخول", "Sign in")}
            </Link>
          </FooterCol>

          <FooterCol title={t("للشركات", "For companies")}>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              {t("لوحة التحكم", "Dashboard")}
            </Link>
            <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground">
              {t("إنشاء حساب", "Create account")}
            </Link>
          </FooterCol>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <span>
          {t("© ٢٠٢٦ أطلس المنزل. جميع الحقوق محفوظة.", "© 2026 Atlas Al Manzil. All rights reserved.")}
        </span>
        <span className="text-xs">
          {t("صُنع في السعودية", "Made in Saudi Arabia")}
        </span>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-heading text-sm font-semibold text-foreground">{title}</span>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}
