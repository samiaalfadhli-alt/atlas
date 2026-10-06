"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { OwnerNav } from "@/components/owner-nav"
import { BrandLogo } from "@/components/brand-logo"
import { useLanguage } from "@/contexts/language-context"

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const { t, isArabic } = useLanguage()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-3">
            <Link
              href="/admin"
              className="mb-3 flex items-center gap-2.5 rounded-lg px-2 py-2"
            >
              <BrandLogo height={34} />
              <span className="flex flex-col leading-none">
                <span className="font-heading text-sm font-bold">
                  {t("أطلس المنزل", "Home Atlas")}
                </span>
                <span className="text-[0.62rem] text-muted-foreground">
                  {t("لوحة صاحب الموقع", "Owner Dashboard")}
                </span>
              </span>
            </Link>
            <OwnerNav />
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="size-4" />
                {t("القائمة", "Menu")}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto p-3">
              <div className="mb-3 flex items-center gap-2.5 px-2 py-2">
                <BrandLogo height={34} />
                <span className="flex flex-col leading-none">
                  <span className="font-heading text-sm font-bold">
                    {isArabic ? "أطلس المنزل" : "Home Atlas"}
                  </span>
                  <span className="text-[0.62rem] text-muted-foreground">
                    {isArabic ? "لوحة صاحب الموقع" : "Owner Dashboard"}
                  </span>
                </span>
              </div>
              <SheetClose asChild>
                <div className="block">
                  <OwnerNav />
                </div>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
