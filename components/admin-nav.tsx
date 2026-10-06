"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Building2, LayoutDashboard, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function AdminNav() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: t("نظرة عامة", "Overview"), icon: LayoutDashboard, exact: true },
    { href: "/admin/companies", label: t("إدارة الشركات", "Companies"), icon: Building2 },
  ]

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
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

export function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      <ShieldCheck className="size-3.5" />
      لوحة الإدارة
    </span>
  )
}
