import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/session"

export async function GET() {
  const session = await requireSuperAdmin().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { users } = await getCollections()
  const items = await users
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
    .then((rows) =>
      rows.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        companyId: u.companyId,
        createdAt: u.createdAt,
      })),
    )

  return NextResponse.json({ items })
}
