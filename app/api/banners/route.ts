import { NextResponse } from "next/server"
import { type Filter } from "mongodb"

import { getCollections, newId } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { AD_PLACEMENTS, type AdPlacement, type Banner, type PublishStatus } from "@/lib/types"

function isStaff(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placement = searchParams.get("placement") as AdPlacement | null
  const status = searchParams.get("status") as PublishStatus | null
  const advertiserId = searchParams.get("advertiserId")
  const companyId = searchParams.get("companyId")
  const session = await getSession()

  const { banners } = await getCollections()
  const filter: Filter<Banner> = {}

  // الزائر العام يرى البنرات النشطة فقط.
  if (!session || !isStaff(session.role)) {
    filter.status = "active"
    if (placement && AD_PLACEMENTS.some((p) => p.value === placement)) {
      filter.placement = placement
    }
    if (companyId) filter.companyId = companyId
    const now = new Date().toISOString()
    const items = await banners
      .find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .toArray()
    return NextResponse.json({
      items: items.filter((b) => (!b.startDate || b.startDate <= now) && (!b.endDate || b.endDate >= now)),
    })
  }

  // الطاقم يرى كل البنرات حسب الفلتر.
  if (status) filter.status = status
  if (placement && AD_PLACEMENTS.some((p) => p.value === placement)) filter.placement = placement
  if (advertiserId) filter.advertiserId = advertiserId
  if (companyId) filter.companyId = companyId
  const items = await banners.find(filter).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const name = String(body.name ?? "").trim()
  const desktopImage = String(body.desktopImage ?? "").trim()
  const placement = String(body.placement ?? "") as AdPlacement

  if (name.length < 3) {
    return NextResponse.json({ error: "اسم البنر مطلوب" }, { status: 422 })
  }
  if (!desktopImage) {
    return NextResponse.json({ error: "صورة البنر (Desktop) مطلوبة" }, { status: 422 })
  }
  if (!AD_PLACEMENTS.some((p) => p.value === placement)) {
    return NextResponse.json({ error: "مكان ظهور غير صالح" }, { status: 422 })
  }

  const staff = isStaff(session.role)
  const requestedStatus = String(body.status ?? "").trim() as PublishStatus
  // المعلن: يبدأ كمسودة أو قيد مراجعة ولا يمكنه النشر مباشرة.
  const status: PublishStatus = staff && (requestedStatus === "active" || requestedStatus === "approved")
    ? requestedStatus
    : (requestedStatus === "draft" ? "draft" : "pending-review")

  const now = new Date().toISOString()
  const banner: Banner = {
    _id: newId(),
    name,
    advertiserId: staff ? (String(body.advertiserId ?? "") || undefined) : session.companyId ?? session.id,
    companyId: staff ? (String(body.companyId ?? "") || undefined) : session.companyId,
    desktopImage,
    mobileImage: String(body.mobileImage ?? "").trim() || undefined,
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? "").trim() || undefined,
    ctaLabel: String(body.ctaLabel ?? "").trim() || undefined,
    ctaUrl: String(body.ctaUrl ?? "").trim() || undefined,
    placement,
    category: String(body.category ?? "").trim() || undefined,
    city: String(body.city ?? "").trim() || undefined,
    startDate: String(body.startDate ?? "").trim() || undefined,
    endDate: String(body.endDate ?? "").trim() || undefined,
    priority: Number(body.priority ?? 0) || 0,
    status,
    views: 0,
    clicks: 0,
    createdBy: session.id,
    createdAt: now,
    updatedAt: now,
  }

  const { banners } = await getCollections()
  await banners.insertOne(banner)
  await logAction({
    actor: session,
    action: "create_banner",
    entityType: "banner",
    entityId: banner._id,
    details: `إنشاء بنر «${name}» (${status})`,
  })

  return NextResponse.json({
    banner,
    pending: status === "pending-review",
    message: staff && status !== "pending-review"
      ? "تم إنشاء البنر."
      : "تم إرسال البنر للمراجعة — لن يظهر إلا بعد اعتماد الإدارة.",
  })
}
