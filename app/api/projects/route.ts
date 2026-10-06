import { NextResponse } from "next/server"

import { getCollections, newId, slugify } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { canPublishDirectly } from "@/lib/approvals"
import type { PlatformProject, PublishStatus } from "@/lib/types"

export async function GET() {
  const { projects } = await getCollections()
  const items = await projects
    .find({ publishStatus: "published" })
    .sort({ createdAt: -1 })
    .toArray()
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

  const title = String(body.title ?? "").trim()
  const description = String(body.description ?? "").trim()
  const imageUrl = String(body.imageUrl ?? "").trim()

  if (title.length < 3) {
    return NextResponse.json({ error: "عنوان المشروع مطلوب" }, { status: 422 })
  }
  if (description.length < 20) {
    return NextResponse.json({ error: "اكتب وصفاً للمشروع" }, { status: 422 })
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "صورة المشروع مطلوبة" }, { status: 422 })
  }

  const { projects } = await getCollections()
  const baseSlug = slugify(title) || `project-${newId().slice(-6)}`
  let slug = baseSlug
  let suffix = 1
  while (await projects.findOne({ slug })) {
    slug = `${baseSlug}-${suffix++}`
  }

  const staff = canPublishDirectly(session)
  const requestedStatus = String(body.publishStatus ?? "").trim() as PublishStatus
  const publishStatus: PublishStatus =
    staff && requestedStatus === "published"
      ? "published"
      : requestedStatus === "draft"
        ? "draft"
        : "pending-review"

  const now = new Date().toISOString()
  const project: PlatformProject = {
    _id: newId(),
    title,
    slug,
    developerId: staff ? (String(body.developerId ?? "") || undefined) : session.companyId,
    developerName: String(body.developerName ?? "").trim() || undefined,
    description,
    imageUrl,
    gallery: Array.isArray(body.gallery)
      ? (body.gallery as unknown[]).map((g) => String(g).trim()).filter(Boolean)
      : undefined,
    city: String(body.city ?? "").trim() || undefined,
    district: String(body.district ?? "").trim() || undefined,
    category: String(body.category ?? "").trim() || undefined,
    status: (String(body.status ?? "ready") as PlatformProject["status"]) || "ready",
    priceFrom: Number(body.priceFrom ?? 0) || undefined,
    units: String(body.units ?? "").trim() || undefined,
    handoverDate: String(body.handoverDate ?? "").trim() || undefined,
    publishStatus,
    createdBy: session.id,
    createdAt: now,
    updatedAt: now,
  }

  await projects.insertOne(project)
  await logAction({
    actor: session,
    action: "create_project",
    entityType: "project",
    entityId: project._id,
    details: `إنشاء مشروع «${title}» (${publishStatus})`,
  })

  return NextResponse.json({
    project,
    pending: publishStatus === "pending-review",
    message: staff && publishStatus === "published"
      ? "تم نشر المشروع."
      : "تم إرسال المشروع للمراجعة — لن يُنشر إلا بعد اعتماد الإدارة.",
  })
}
