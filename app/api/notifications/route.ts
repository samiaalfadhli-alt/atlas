import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireUser } from "@/lib/session"

export async function GET() {
  const session = await requireUser().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const { notifications } = await getCollections()
  const items = await notifications
    .find({ userId: session.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray()
  const unread = await notifications.countDocuments({ userId: session.id, read: false })
  return NextResponse.json({ items, unread })
}

export async function PATCH(request: Request) {
  const session = await requireUser().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const { notifications } = await getCollections()
  const action = String(body.action ?? "").trim()

  if (action === "read-all") {
    await notifications.updateMany(
      { userId: session.id, read: false },
      { $set: { read: true } },
    )
    return NextResponse.json({ ok: true })
  }

  const id = String(body.id ?? "").trim()
  if (id) {
    await notifications.updateOne(
      { _id: id, userId: session.id },
      { $set: { read: true } },
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "معرّف الإشعار مطلوب" }, { status: 422 })
}
