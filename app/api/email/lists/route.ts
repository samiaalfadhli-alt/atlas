import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { EMAIL_SEGMENTS, type EmailList, type EmailSegment } from "@/lib/types"

const VALID_SEGMENTS = EMAIL_SEGMENTS.map((s) => s.value)

export async function GET() {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  const { emailLists } = await getCollections()
  const items = await emailLists.find({}).sort({ createdAt: -1 }).toArray()
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

  const name = String(body.name ?? "").trim()
  const segment = String(body.segment ?? "customers") as EmailSegment
  if (name.length < 2) {
    return NextResponse.json({ error: "اسم القائمة مطلوب" }, { status: 422 })
  }
  if (!VALID_SEGMENTS.includes(segment)) {
    return NextResponse.json({ error: "الشريحة غير صالحة" }, { status: 422 })
  }

  const list: EmailList = {
    _id: newId(),
    name,
    segment,
    subscriberCount: 0,
    createdAt: new Date().toISOString(),
  }
  const { emailLists } = await getCollections()
  await emailLists.insertOne(list)
  await logAction({
    actor: session,
    action: "create_email_list",
    entityType: "email-list",
    entityId: list._id,
    details: `إنشاء قائمة «${name}»`,
  })
  return NextResponse.json({ list })
}
