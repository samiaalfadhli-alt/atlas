"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { ROLE_LABELS, type UserRole } from "@/lib/types"

const ROLES: UserRole[] = [
  "user",
  "company",
  "content-manager",
  "ads-manager",
  "admin",
]

export function UserRoleSelect({ userId, current }: { userId: string; current: UserRole }) {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function change(role: string) {
    if (role === current) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر التغيير", "Could not change"))
        return
      }
      toast.success(t("تم تحديث الدور", "Role updated"))
      router.refresh()
    } catch {
      toast.error(t("تعذّر التغيير", "Could not change"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={current} onValueChange={change} disabled={loading}>
      <SelectTrigger className="h-9 w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {isArabic ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
