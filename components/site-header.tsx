"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LogOut, Menu, ShieldCheck, LayoutDashboard } from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { CATEGORY_META, isStaffRole, type Category } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export function SiteHeader() {
  const { t, isArabic } = useLanguage()
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const navLinks = [
    { href: "/", label: t("الرئيسية", "Home") },
    { href: "/companies", label: t("الشركات", "Companies") },
    { href: "/projects", label: t("المشاريع", "Projects") },
    { href: "/articles", label: t("المقالات", "Articles") },
    { href: "/partners", label: t("للشركات", "For companies") },
    { href: "/about", label: t("عن المنصة", "About") },
  ]

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="أطلس المنزل">
          <BrandLogo height={40} priority />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-bold tracking-tight">
              {t("أطلس المنزل", "Atlas Al Manzil")}
            </span>
            <span className="text-[0.62rem] font-medium text-muted-foreground">
              {t("دليل شركات البناء والتصميم", "Build & Design Directory")}
            </span>
          </span>
        </Link>

        <nav className="ms-6 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <DropdownNavCategories t={t} />
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 sm:flex">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <div className="hidden md:block">
            <Button asChild variant="outline" size="sm">
              <Link href="/companies">{t("تصفّح الدليل", "Browse")}</Link>
            </Button>
          </div>

          {loading ? (
            <div className="size-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-transparent transition hover:ring-border">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/10 font-heading text-xs font-bold text-primary">
                      {user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="font-heading text-sm font-semibold">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground" dir="ltr">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "admin" || isStaffRole(user.role) ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="size-4" />
                      {t("لوحة صاحب الموقع", "Owner Dashboard")}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      {t("لوحة المعلن", "Advertiser Dashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => void logout()}
                >
                  <LogOut className="size-4" />
                  {t("تسجيل الخروج", "Sign out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">{t("تسجيل الدخول", "Sign in")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">{t("سجّل شركتك", "List your company")}</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="القائمة">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 p-2">
                <span className="px-2 py-2 font-heading text-base font-bold">
                  {t("أطلس المنزل", "Atlas Al Manzil")}
                </span>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-secondary text-secondary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <span className="px-2 pb-1 pt-4 text-xs font-semibold text-muted-foreground">
                  {t("التصنيفات", "Categories")}
                </span>
                {CATEGORIES.map((cat) => (
                  <SheetClose asChild key={cat}>
                    <Link
                      href={`/companies?category=${cat}`}
                      className="rounded-md px-3 py-2.5 text-sm hover:bg-muted"
                    >
                      {isArabic ? CATEGORY_META[cat].ar : CATEGORY_META[cat].en}
                    </Link>
                  </SheetClose>
                ))}
                <span className="my-2 h-px bg-border" />
                {!user && (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/login">{t("تسجيل الدخول", "Sign in")}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/auth/register">{t("سجّل شركتك", "List your company")}</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                {user && (
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={isStaffRole(user.role) ? "/admin" : "/dashboard"}>
                        {isStaffRole(user.role)
                          ? t("لوحة صاحب الموقع", "Owner Dashboard")
                          : t("لوحة المعلن", "Advertiser Dashboard")}
                      </Link>
                    </Button>
                  </SheetClose>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function DropdownNavCategories({ t }: { t: (a: string, b: string) => string }) {
  const { isArabic } = useLanguage()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {t("التصنيفات", "Categories")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {CATEGORIES.map((cat) => (
          <DropdownMenuItem asChild key={cat}>
            <Link href={`/companies?category=${cat}`}>
              <CategoryDot category={cat} />
              <span className="flex flex-col">
                <span className="font-medium">
                  {isArabic ? CATEGORY_META[cat].ar : CATEGORY_META[cat].en}
                </span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CategoryDot({ category }: { category: Category }) {
  const colorVar = CATEGORY_META[category].colorVar
  return (
    <span
      className={cn("size-2.5 shrink-0 rounded-full")}
      style={{ backgroundColor: `var(--${colorVar})` }}
    />
  )
}
