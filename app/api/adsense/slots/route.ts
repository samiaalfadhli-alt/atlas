import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { getAdSenseSlots } from "@/lib/platform-queries"
import type { AdSenseSlot } from "@/lib/types"

export async function GET() {
  const items = await getAdSenseSlots()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const location = String(body.location ?? "").trim()
  const name = String(body.name ?? location).trim()
  if (!location) {
    return NextResponse.json({ error: "الموضع مطلوب" }, { status: 422 })
  }

  const slot: AdSenseSlot = {
    _id: newId(),
    name,
    location,
    enabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const { adsenseSlots } = await getCollections()
  await adsenseSlots.insertOne(slot)
  await logAction({
    actor: session,
    action: "create_adsense_slot",
    entityType: "adsense-slot",
    entityId: slot._id,
  })
  return NextResponse.json({ slot })
}
