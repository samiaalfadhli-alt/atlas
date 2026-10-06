import Link from "next/link"

import { Building2, Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" />
      </span>
      <p className="font-heading text-6xl font-bold tracking-tight text-primary">٤٠٤</p>
      <h1 className="mt-3 font-heading text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        ربما تم نقل الصفحة أو لم تعد متاحة. يمكنك العودة إلى الدليل ومتابعة البحث عن شريك مشروعك.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/companies">
            <Building2 className="size-4" />
            تصفّح الشركات
          </Link>
        </Button>
      </div>
    </main>
  )
}
