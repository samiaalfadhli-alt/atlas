import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { type UserRole } from "@/lib/types"

const VALID_ROLES: UserRole[] = [
  "user",
  "company",
  "content-manager",
  "ads-manager",
  "admin",
]

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSuperAdmin().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const role = String(body.role ?? "").trim() as UserRole
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "دور غير صالح" }, { status: 422 })
  }

  const { users } = await getCollections()
  const target = await users.findOne({ _id: id })
  if (!target) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
  }
  if (target._id === session.id) {
    return NextResponse.json({ error: "لا يمكنك تغيير دورك الخاص" }, { status: 422 })
  }

  await users.updateOne({ _id: id }, { $set: { role } })
  await logAction({
    actor: session,
    action: "update_user_role",
    entityType: "user",
    entityId: id,
    details: `تغيير دور «${target.name}» إلى ${role}`,
  })

  return NextResponse.json({ ok: true, role })
}
