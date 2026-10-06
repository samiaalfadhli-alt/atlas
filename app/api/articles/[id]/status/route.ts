import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import type { PublishStatus } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

const STAFF_STATUSES: PublishStatus[] = [
  "published",
  "draft",
  "pending-review",
  "rejected",
  "approved",
]

const AUTHOR_ALLOWED: Record<PublishStatus, PublishStatus[]> = {
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

  const { articles } = await getCollections()
  const article = await articles.findOne({ _id: id })
  if (!article) {
    return NextResponse.json({ error: "المقال غير موجود" }, { status: 404 })
  }

  if (!isStaff) {
    if (article.authorId !== session.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    const allowed = AUTHOR_ALLOWED[article.status] ?? []
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "لا يمكنك تغيير حالة هذا المقال مباشرة. الانتظار موافقة الإدارة." },
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
  if (status === "published" && !article.publishedAt) {
    update.publishedAt = new Date().toISOString()
  }
  if (status === "rejected" && reason) update.rejectionReason = reason
  if (status !== "rejected") update.rejectionReason = ""

  await articles.updateOne({ _id: id }, { $set: update })
  await logAction({
    actor: session,
    action: `article_${status}`,
    entityType: "article",
    entityId: id,
    details: reason ? `سبب: ${reason}` : undefined,
  })

  return NextResponse.json({ ok: true, status })
}
