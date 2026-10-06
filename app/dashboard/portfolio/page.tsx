import { redirect } from "next/navigation"

import { Briefcase } from "lucide-react"

import { getSession } from "@/lib/session"
import { getCompanyByOwner } from "@/lib/queries"
import { PortfolioManager } from "@/components/portfolio-manager"
import { EmptyState } from "@/components/empty-state"

export default async function DashboardPortfolioPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/portfolio")
  const company = await getCompanyByOwner(session.id)
  if (!company) {
    return (
      <EmptyState
        icon={<Briefcase className="size-7" />}
        title="لم يتم العثور على ملف شركة"
        description="تواصل مع الدعم إذا واجهت هذه المشكلة."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">الأعمال السابقة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          أضف مشاريعك السابقة لتعرضها في ملف شركتك. كل مشروع يعزز ثقة أصحاب المشاريع بك.
        </p>
      </div>
      <PortfolioManager companyId={company._id} projects={company.portfolio} />
    </div>
  )
}
