import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import type { PublishStatus } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

const STAFF_STATUSES: PublishStatus[] = [
  "approved",
  "active",
  "paused",
  "rejected",
  "expired",
  "draft",
  "pending-review",
]

const ADVERTISER_ALLOWED: Record<PublishStatus, PublishStatus[]> = {
  draft: ["pending-review"],
  "pending-review": ["draft"],
  rejected: ["draft", "pending-review"],
  approved: [],
  active: [],
  paused: [],
  expired: [],
  published: [],
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const isStaff = session.role === "admin" || session.role === "content-manager" || session.role === "ads-manager"

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const status = String(body.status ?? "").trim() as PublishStatus
  const reason = String(body.reason ?? "").trim()

  const { banners } = await getCollections()
  const banner = await banners.findOne({ _id: id })
  if (!banner) {
    return NextResponse.json({ error: "البنر غير موجود" }, { status: 404 })
  }

  // المعلن يملك صلاحية على بنراته فقط، وضمن انتقالات محددة (لا نشر مباشر).
  if (!isStaff) {
    if (banner.advertiserId !== session.id && banner.companyId !== session.companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    const allowed = ADVERTISER_ALLOWED[banner.status] ?? []
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "لا يمكنك تغيير حالة هذا البنر مباشرة. الانتظار موافقة الإدارة." },
        { status: 403 },
      )
    }
  } else if (!STAFF_STATUSES.includes(status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 422 })
  }

  const update: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  }
  if (status === "rejected" && reason) {
    update.rejectionReason = reason
  }
  if (status !== "rejected") {
    update.rejectionReason = ""
  }

  await banners.updateOne({ _id: id }, { $set: update })
  await logAction({
    actor: session,
    action: `banner_${status}`,
    entityType: "banner",
    entityId: id,
    details: reason ? `سبب: ${reason}` : undefined,
  })

  return NextResponse.json({ ok: true, status })
}
