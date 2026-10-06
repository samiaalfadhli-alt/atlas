import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"
import { isStaffRole } from "@/lib/types"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard")
  if (isStaffRole(session.role)) redirect("/admin")
  if (session.role !== "company") redirect("/auth/login?next=/dashboard")

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-3">
            <span className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              لوحة المعلن
            </span>
            <DashboardNav />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
