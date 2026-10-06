import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { AdminPageHeader } from "@/components/admin-primitives"
import { AddCompanyForm } from "@/components/add-company-form"

export default function AddCompanyPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="إضافة شركة جديدة"
        subtitle="أضف شركة يدويًا من لوحة التحكم — حفظ كمسودة أو اعتماد ونشر مباشرة."
        action={
          <Link
            href="/admin/companies"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
          >
            <ArrowRight className="size-4 rtl:rotate-180" />
            رجوع للقائمة
          </Link>
        }
      />
      <AddCompanyForm />
    </div>
  )
}
