"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Briefcase,
  ClipboardList,
  Crown,
  GalleryVerticalEnd,
  LayoutDashboard,
  Megaphone,
  Star,
  UserRound,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function DashboardNav() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: t("نظرة عامة", "Overview"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/profile", label: t("ملف الشركة", "Company profile"), icon: UserRound },
    { href: "/dashboard/subscription", label: t("باقتي", "My plan"), icon: Crown },
    { href: "/dashboard/portfolio", label: t("الأعمال", "Portfolio"), icon: Briefcase },
    { href: "/dashboard/banners", label: t("بنراتي", "My banners"), icon: GalleryVerticalEnd },
    { href: "/dashboard/ads", label: t("إعلاناتي", "My ads"), icon: Megaphone },
    { href: "/dashboard/changes", label: t("طلبات التعديل", "Change requests"), icon: ClipboardList },
    { href: "/dashboard/reviews", label: t("التقييمات", "Reviews"), icon: Star },
  ]

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
