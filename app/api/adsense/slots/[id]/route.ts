import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireStaff().catch((error) => error)
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

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (typeof body.enabled === "boolean") update.enabled = body.enabled
  if (typeof body.name === "string") update.name = body.name

  const { adsenseSlots } = await getCollections()
  await adsenseSlots.updateOne({ _id: id }, { $set: update })
  await logAction({
    actor: session,
    action: "update_adsense_slot",
    entityType: "adsense-slot",
    entityId: id,
  })
  return NextResponse.json({ ok: true })
}
