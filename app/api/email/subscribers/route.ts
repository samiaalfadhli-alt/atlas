import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { EMAIL_SEGMENTS, type EmailSubscriber } from "@/lib/types"

const VALID_SEGMENTS = EMAIL_SEGMENTS.map((s) => s.value)

export async function GET(request: Request) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  const listId = new URL(request.url).searchParams.get("listId") || undefined
  const { emailSubscribers } = await getCollections()
  const filter: Record<string, unknown> = {}
  if (listId) filter.listId = listId
  const items = await emailSubscribers.find(filter).sort({ createdAt: -1 }).limit(100).toArray()
  return NextResponse.json({
    items: items.map((s) => ({ _id: s._id, email: s.email, name: s.name, city: s.city, segment: s.segment, status: s.status, createdAt: s.createdAt })),
  })
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

  const listId = String(body.listId ?? "").trim()
  const email = String(body.email ?? "").trim().toLowerCase()
  const name = String(body.name ?? "").trim()
  const city = String(body.city ?? "").trim()
  const segment = String(body.segment ?? "customers") as EmailSubscriber["segment"]

  if (!listId) {
    return NextResponse.json({ error: "القائمة مطلوبة" }, { status: 422 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "بريد إلكتروني غير صالح" }, { status: 422 })
  }
  if (!VALID_SEGMENTS.includes(segment)) {
    return NextResponse.json({ error: "الشريحة غير صالحة" }, { status: 422 })
  }

  const { emailSubscribers, emailLists } = await getCollections()
  const existing = await emailSubscribers.findOne({ listId, email })
  if (existing) {
    return NextResponse.json({ ok: true, subscriber: existing, existed: true })
  }

  const sub: EmailSubscriber = {
    _id: newId(),
    listId,
    email,
    name: name || undefined,
    city: city || undefined,
    segment,
    status: "active",
    createdAt: new Date().toISOString(),
  }
  await emailSubscribers.insertOne(sub)
  await emailLists.updateOne({ _id: listId }, { $inc: { subscriberCount: 1 } })
  await logAction({
    actor: session,
    action: "add_subscriber",
    entityType: "email-subscriber",
    entityId: sub._id,
    details: `إضافة مشترك ${email}`,
  })
  return NextResponse.json({ subscriber: sub })
}

export async function DELETE(request: Request) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  const id = new URL(request.url).searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 })
  }
  const { emailSubscribers, emailLists } = await getCollections()
  const sub = await emailSubscribers.findOne({ _id: id })
  if (sub) {
    await emailLists.updateOne({ _id: sub.listId }, { $inc: { subscriberCount: -1 } })
  }
  await emailSubscribers.deleteOne({ _id: id })
  return NextResponse.json({ ok: true })
}
