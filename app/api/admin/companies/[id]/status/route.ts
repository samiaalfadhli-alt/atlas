import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireAdmin } from "@/lib/session"
import type { CompanyStatus } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdmin().catch((error) => error)
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

  const status = String(body.status ?? "").trim()
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 422 })
  }

  const { companies } = await getCollections()
  const result = await companies.updateOne(
    { _id: id },
    {
      $set: {
        status: status as CompanyStatus,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, status })
}
