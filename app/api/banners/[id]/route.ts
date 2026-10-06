import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { AD_PLACEMENTS, type AdPlacement, type Banner } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

function isStaff(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

const LIVE_STATUSES = ["active", "approved", "published"]

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const { banners } = await getCollections()
  const banner = await banners.findOne({ _id: id })
  if (!banner) {
    return NextResponse.json({ error: "البنر غير موجود" }, { status: 404 })
  }
  return NextResponse.json({ banner })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const { banners } = await getCollections()
  const banner = await banners.findOne({ _id: id })
  if (!banner) {
    return NextResponse.json({ error: "البنر غير موجود" }, { status: 404 })
  }

  const staff = isStaff(session.role)
  if (!staff) {
    if (banner.advertiserId !== session.id && banner.companyId !== session.companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    // المعلن لا يستطيع تعديل بنر منشور مباشرة.
    if (LIVE_STATUSES.includes(banner.status)) {
      return NextResponse.json(
        { error: "لا يمكن تعديل بنر منشور مباشرة. أرسل طلب تعديل للمراجعة." },
        { status: 403 },
      )
    }
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const update: Partial<Banner> = { updatedAt: new Date().toISOString() }
  if (typeof body.name === "string") update.name = body.name.trim()
  if (typeof body.title === "string") update.title = body.title.trim()
  if (typeof body.description === "string") update.description = body.description.trim()
  if (typeof body.desktopImage === "string") update.desktopImage = body.desktopImage.trim()
  if (typeof body.mobileImage === "string") update.mobileImage = body.mobileImage.trim()
  if (typeof body.ctaLabel === "string") update.ctaLabel = body.ctaLabel.trim()
  if (typeof body.ctaUrl === "string") update.ctaUrl = body.ctaUrl.trim()
  if (typeof body.startDate === "string") update.startDate = body.startDate.trim()
  if (typeof body.endDate === "string") update.endDate = body.endDate.trim()
  if (typeof body.category === "string") update.category = body.category.trim()
  if (typeof body.city === "string") update.city = body.city.trim()
  if (typeof body.priority === "number") update.priority = body.priority
  if (typeof body.placement === "string") {
    const placement = body.placement as AdPlacement
    if (AD_PLACEMENTS.some((p) => p.value === placement)) update.placement = placement
  }

  await banners.updateOne({ _id: id }, { $set: update })
  await logAction({
    actor: session,
    action: "update_banner",
    entityType: "banner",
    entityId: id,
    details: `تعديل بنر «${banner.name}»`,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const { banners } = await getCollections()
  const banner = await banners.findOne({ _id: id })
  if (!banner) {
    return NextResponse.json({ error: "البنر غير موجود" }, { status: 404 })
  }

  const staff = isStaff(session.role)
  if (!staff) {
    if (banner.advertiserId !== session.id && banner.companyId !== session.companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    if (LIVE_STATUSES.includes(banner.status)) {
      return NextResponse.json(
        { error: "لا يمكن حذف بنر منشور مباشرة. تواصل مع الإدارة." },
        { status: 403 },
      )
    }
  }

  await banners.deleteOne({ _id: id })
  await logAction({
    actor: session,
    action: "delete_banner",
    entityType: "banner",
    entityId: id,
    details: `حذف بنر «${banner.name}»`,
  })
  return NextResponse.json({ ok: true })
}
