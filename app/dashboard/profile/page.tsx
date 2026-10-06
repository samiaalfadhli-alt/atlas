import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"
import { getCompanyByOwner } from "@/lib/queries"
import { ProfileEditor } from "@/components/profile-editor"
import { EmptyState } from "@/components/empty-state"
import { Briefcase } from "lucide-react"

export default async function DashboardProfilePage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/profile")
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
        <h1 className="font-heading text-2xl font-bold">ملف الشركة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عدّل بيانات شركتك التي تظهر لأصحاب المشاريع. كل تغيير يُحفظ مباشرة.
        </p>
      </div>
      <ProfileEditor company={company} />
    </div>
  )
}
