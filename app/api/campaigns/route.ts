import { NextResponse } from "next/server"
import { type Filter } from "mongodb"

import { getCollections, newId } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import {
  AD_PLACEMENTS,
  AD_TYPES,
  type AdPlacement,
  type AdType,
  type Campaign,
  type PublishStatus,
  type TargetDevice,
} from "@/lib/types"

function isStaff(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as PublishStatus | null
  const advertiserId = searchParams.get("advertiserId")
  const session = await getSession()

  const { campaigns } = await getCollections()
  const filter: Filter<Campaign> = {}

  if (!session || !isStaff(session.role)) {
    filter.status = "active"
  } else {
    if (status) filter.status = status
  }
  if (advertiserId) filter.advertiserId = advertiserId

  const items = await campaigns.find(filter).sort({ createdAt: -1 }).toArray()
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
  const type = String(body.type ?? "image") as AdType
  const placement = String(body.placement ?? "") as AdPlacement

  if (name.length < 3) {
    return NextResponse.json({ error: "اسم الحملة مطلوب" }, { status: 422 })
  }
  if (!AD_TYPES.some((t) => t.value === type)) {
    return NextResponse.json({ error: "نوع إعلان غير صالح" }, { status: 422 })
  }
  if (!AD_PLACEMENTS.some((p) => p.value === placement)) {
    return NextResponse.json({ error: "مكان ظهور غير صالح" }, { status: 422 })
  }

  const staff = isStaff(session.role)
  const requestedStatus = String(body.status ?? "").trim() as PublishStatus
  const status: PublishStatus = staff && (requestedStatus === "active" || requestedStatus === "approved")
    ? requestedStatus
    : requestedStatus === "draft" ? "draft" : "pending-review"

  const now = new Date().toISOString()
  const campaign: Campaign = {
    _id: newId(),
    name,
    advertiserId: staff ? (String(body.advertiserId ?? "") || undefined) : session.companyId ?? session.id,
    companyId: staff ? (String(body.companyId ?? "") || undefined) : session.companyId,
    type,
    imageUrl: String(body.imageUrl ?? "").trim() || undefined,
    videoUrl: String(body.videoUrl ?? "").trim() || undefined,
    copyText: String(body.copyText ?? "").trim() || undefined,
    linkUrl: String(body.linkUrl ?? "").trim() || undefined,
    ctaLabel: String(body.ctaLabel ?? "").trim() || undefined,
    placement,
    category: String(body.category ?? "").trim() || undefined,
    city: String(body.city ?? "").trim() || undefined,
    audience: String(body.audience ?? "").trim() || undefined,
    devices: (String(body.devices ?? "all") as TargetDevice) || "all",
    budget: Number(body.budget ?? 0) || undefined,
    startDate: String(body.startDate ?? "").trim() || undefined,
    endDate: String(body.endDate ?? "").trim() || undefined,
    status,
    impressions: 0,
    clicks: 0,
    createdBy: session.id,
    createdAt: now,
    updatedAt: now,
  }

  const { campaigns } = await getCollections()
  await campaigns.insertOne(campaign)
  await logAction({
    actor: session,
    action: "create_campaign",
    entityType: "campaign",
    entityId: campaign._id,
    details: `إنشاء حملة «${name}» (${status})`,
  })

  return NextResponse.json({
    campaign,
    pending: status === "pending-review",
    message: staff && status !== "pending-review"
      ? "تم إنشاء الحملة."
      : "تم إرسال الحملة للمراجعة — لن تظهر إلا بعد اعتماد الإدارة.",
  })
}
