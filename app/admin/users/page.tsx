import { Users, ShieldCheck, UserRound } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, AdminStat } from "@/components/admin-primitives"
import { UserRoleSelect } from "@/components/user-role-select"
import { getAllUsers } from "@/lib/platform-queries"
import { timeAgo } from "@/lib/format"
import { ROLE_LABELS, isStaffRole, type UserRole } from "@/lib/types"

export default async function UsersPage() {
  const users = await getAllUsers()

  const counts = {
    total: users.length,
    staff: users.filter((u) => isStaffRole(u.role)).length,
    advertisers: users.filter((u) => u.role === "company").length,
    regular: users.filter((u) => u.role === "user").length,
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المستخدمون"
        subtitle="إدارة حسابات المنصة والأدوار والصلاحيات (RBAC)."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat icon={<Users className="size-5" />} label="إجمالي المستخدمين" value={counts.total} />
        <AdminStat icon={<ShieldCheck className="size-5" />} label="طاقم الإدارة" value={counts.staff} tone="primary" />
        <AdminStat icon={<UserRound className="size-5" />} label="المعلنون" value={counts.advertisers} tone="gold" />
        <AdminStat icon={<Users className="size-5" />} label="مستخدمون عاديون" value={counts.regular} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>كل المستخدمين</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length > 0 ? (
            users.map((u) => (
              <div
                key={u._id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                    {u.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                    <p className="text-xs text-muted-foreground/70">{timeAgo(u.createdAt)}</p>
                  </div>
                </div>
                <UserRoleSelect userId={u._id} current={u.role as UserRole} />
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Users className="size-7" />}
              title="لا يوجد مستخدمون"
              description="ستظهر هنا الحسابات المسجّلة في المنصة."
            />
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        الأدوار: {Object.values(ROLE_LABELS).map((r) => r.ar).join(" — ")}. صاحب الموقع (Super Admin) يملك صلاحية كاملة، والمعلن لا ينشر مباشرة.
      </p>
    </div>
  )
}
