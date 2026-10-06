import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireSession } from "@/lib/session"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const session = await requireSession().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const reply = String(body.reply ?? "").trim()
  if (reply.length < 2) {
    return NextResponse.json({ error: "اكتب رداً صالحاً" }, { status: 422 })
  }
  if (reply.length > 1000) {
    return NextResponse.json({ error: "الرد طويل جداً" }, { status: 422 })
  }

  const { reviews, companies } = await getCollections()
  const review = await reviews.findOne({ _id: id })
  if (!review) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 })
  }

  const company = await companies.findOne({ _id: review.companyId })
  if (!company) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }

  if (company.ownerId !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  await reviews.updateOne(
    { _id: id },
    { $set: { reply, repliedAt: new Date().toISOString() } },
  )

  return NextResponse.json({ ok: true })
}
