"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  GalleryVerticalEnd,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Mail,
  MapPin,
  Plug,
  Settings,
  Share2,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { ROLE_LABELS, isStaffRole } from "@/lib/types"

type NavItem = {
  href: string
  label: string
  labelEn: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  /** أدوار الطاقم المسموح لها برؤية هذا القسم. */
  roles?: string[]
}

type NavGroup = {
  title: string
  titleEn: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "الرئيسية",
    titleEn: "Main",
    items: [
      {
        href: "/admin",
        label: "الرئيسية",
        labelEn: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/admin/approvals",
        label: "الموافقات",
        labelEn: "Approvals",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "الدليل والشركات",
    titleEn: "Directory",
    items: [
      {
        href: "/admin/companies",
        label: "الشركات",
        labelEn: "Companies",
        icon: Building2,
      },
      {
        href: "/admin/specialists",
        label: "المتخصصون",
        labelEn: "Specialists",
        icon: Wrench,
      },
      {
        href: "/admin/projects",
        label: "المشاريع",
        labelEn: "Projects",
        icon: MapPin,
      },
      {
        href: "/admin/advertisers",
        label: "المعلنون",
        labelEn: "Advertisers",
        icon: Users,
      },
    ],
  },
  {
    title: "المحتوى والوسائط",
    titleEn: "Content",
    items: [
      {
        href: "/admin/content",
        label: "المحتوى",
        labelEn: "Content",
        icon: FileText,
        roles: ["admin", "content-manager"],
      },
      {
        href: "/admin/media",
        label: "الصور والوسائط",
        labelEn: "Media",
        icon: ImageIcon,
        roles: ["admin", "content-manager"],
      },
    ],
  },
  {
    title: "الإعلانات",
    titleEn: "Advertising",
    items: [
      {
        href: "/admin/ads",
        label: "الإعلانات",
        labelEn: "Ads",
        icon: Megaphone,
        roles: ["admin", "ads-manager"],
      },
      {
        href: "/admin/banners",
        label: "البنرات",
        labelEn: "Banners",
        icon: GalleryVerticalEnd,
        roles: ["admin", "ads-manager"],
      },
    ],
  },
  {
    title: "النشر والبريد",
    titleEn: "Publishing",
    items: [
      {
        href: "/admin/social",
        label: "النشر الاجتماعي",
        labelEn: "Social",
        icon: Share2,
        roles: ["admin", "content-manager"],
      },
      {
        href: "/admin/email",
        label: "البريد الإلكتروني",
        labelEn: "Email",
        icon: Mail,
        roles: ["admin", "content-manager"],
      },
    ],
  },
  {
    title: "التكاملات والتحليلات",
    titleEn: "Integrations",
    items: [
      {
        href: "/admin/analytics",
        label: "Google Analytics",
        labelEn: "Google Analytics",
        icon: BarChart3,
      },
      {
        href: "/admin/google-ads",
        label: "Google Ads",
        labelEn: "Google Ads",
        icon: TrendingUp,
      },
      {
        href: "/admin/adsense",
        label: "AdSense",
        labelEn: "AdSense",
        icon: Plug,
      },
      {
        href: "/admin/reports",
        label: "التقارير",
        labelEn: "Reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "النظام",
    titleEn: "System",
    items: [
      {
        href: "/admin/users",
        label: "المستخدمون",
        labelEn: "Users",
        icon: Users,
        roles: ["admin"],
      },
      {
        href: "/admin/settings",
        label: "الإعدادات",
        labelEn: "Settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
]

export function OwnerNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isArabic } = useLanguage()
  const role = user?.role ?? "user"
  const roleLabel = ROLE_LABELS[isStaffRole(role) ? (role as keyof typeof ROLE_LABELS) : "company"]

  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter(
          (item) => !item.roles || item.roles.includes(role),
        )
        if (items.length === 0) return null
        return (
          <div key={group.title} className="space-y-1">
            <p className="px-2.5 pb-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/70">
              {isArabic ? group.title : group.titleEn}
            </p>
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{isArabic ? item.label : item.labelEn}</span>
                </Link>
              )
            })}
          </div>
        )
      })}

      <div className="mt-2 rounded-xl border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          {isArabic ? "دورك" : "Your role"}
        </p>
        <p className="mt-0.5 text-sm font-bold text-foreground">
          {isArabic ? roleLabel.ar : roleLabel.en}
        </p>
      </div>
    </nav>
  )
}
