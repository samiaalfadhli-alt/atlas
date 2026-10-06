import { redirect } from "next/navigation"

import { getSession } from "@/lib/session"
import { isStaffRole } from "@/lib/types"
import { OwnerShell } from "@/components/owner-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/admin")
  if (!isStaffRole(session.role)) redirect("/dashboard")

  return <OwnerShell>{children}</OwnerShell>
}
