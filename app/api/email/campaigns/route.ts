import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { EMAIL_SEGMENTS, type EmailCampaign } from "@/lib/types"

export async function GET() {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  const { emailCampaigns } = await getCollections()
  const items = await emailCampaigns.find({}).sort({ createdAt: -1 }).toArray()
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
  const subject = String(body.subject ?? "").trim()
  const bodyText = String(body.body ?? "").trim()
  const segment = String(body.segment ?? "") as EmailCampaign["segment"]
  const listId = String(body.listId ?? "").trim() || undefined
  const scheduledAt = String(body.scheduledAt ?? "").trim() || undefined

  if (name.length < 3) {
    return NextResponse.json({ error: "اسم الحملة مطلوب" }, { status: 422 })
  }
  if (subject.length < 3) {
    return NextResponse.json({ error: "عنوان الرسالة مطلوب" }, { status: 422 })
  }
  if (bodyText.length < 10) {
    return NextResponse.json({ error: "محتوى الرسالة قصير جداً" }, { status: 422 })
  }
  if (segment && !EMAIL_SEGMENTS.map((s) => s.value).includes(segment)) {
    return NextResponse.json({ error: "الشريحة غير صالحة" }, { status: 422 })
  }

  const now = new Date().toISOString()
  const campaign: EmailCampaign = {
    _id: newId(),
    name,
    subject,
    preheader: String(body.preheader ?? "").trim() || undefined,
    body: bodyText,
    listId,
    segment: segment || undefined,
    status: scheduledAt ? "scheduled" : "draft",
    scheduledAt,
    opens: 0,
    clicks: 0,
    createdBy: session.id,
    createdAt: now,
    updatedAt: now,
  }

  const { emailCampaigns } = await getCollections()
  await emailCampaigns.insertOne(campaign)
  await logAction({
    actor: session,
    action: "create_email_campaign",
    entityType: "email-campaign",
    entityId: campaign._id,
    details: `إنشاء حملة بريدية «${name}»`,
  })

  return NextResponse.json({
    campaign,
    message: "تم حفظ الحملة. الإرسال الفعلي يتطلب ربط مزوّد بريد معتمد عبر التكامل.",
  })
}
