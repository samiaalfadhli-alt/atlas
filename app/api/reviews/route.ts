import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { getSession } from "@/lib/session"
import type { Review } from "@/lib/types"

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")
  if (!companyId) {
    return NextResponse.json({ error: "معرّف الشركة مطلوب" }, { status: 400 })
  }

  const { reviews } = await getCollections()
  const items = await reviews
    .find({ companyId })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const companyId = String(body.companyId ?? "").trim()
  const rating = Number(body.rating)
  const comment = String(body.comment ?? "").trim()
  const providedName = String(body.name ?? "").trim()

  if (!companyId) {
    return NextResponse.json({ error: "معرّف الشركة مطلوب" }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "التقييم من ١ إلى ٥" }, { status: 422 })
  }
  if (comment.length > 1000) {
    return NextResponse.json({ error: "التعليق طويل جداً" }, { status: 422 })
  }

  const session = await getSession()
  const { companies, reviews } = await getCollections()
  const company = await companies.findOne({ _id: companyId })
  if (!company || company.status !== "approved") {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }

  // A company owner cannot review their own company.
  if (session && company.ownerId === session.id) {
    return NextResponse.json(
      { error: "لا يمكنك تقييم شركتك" },
      { status: 403 },
    )
  }

  const name = session?.name || providedName
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "الاسم مطلوب لإظهار التقييم" },
      { status: 422 },
    )
  }

  // One review per user per company when logged in.
  if (session) {
    const existing = await reviews.findOne({
      companyId,
      userId: session.id,
    })
    if (existing) {
      return NextResponse.json(
        { error: "سبق أن أضفت تقييماً لهذه الشركة" },
        { status: 409 },
      )
    }
  }

  const review: Review = {
    _id: newId(),
    companyId,
    userId: session?.id || `anon-${newId()}`,
    userName: name,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }

  await reviews.insertOne(review)

  // Recompute aggregate rating server-side.
  const all = await reviews.find({ companyId }).toArray()
  const count = all.length
  const avg = count > 0 ? all.reduce((s, r) => s + r.rating, 0) / count : 0
  await companies.updateOne(
    { _id: companyId },
    {
      $set: {
        rating: Math.round(avg * 10) / 10,
        reviewCount: count,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  return NextResponse.json({ review })
}
