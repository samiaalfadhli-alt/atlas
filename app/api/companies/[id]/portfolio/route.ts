import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { canPublishDirectly, createChangeRequest } from "@/lib/approvals"
import { isStaffRole, type Project } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const session = await requireSession().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const { companies } = await getCollections()
  const company = await companies.findOne({ _id: id })
  if (!company) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }
  if (company.ownerId !== session.id && !isStaffRole(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
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
  const location = String(body.location ?? "").trim()
  const year = String(body.year ?? "").trim()
  const category = String(body.category ?? "").trim()

  if (title.length < 3) {
    return NextResponse.json({ error: "عنوان المشروع مطلوب" }, { status: 422 })
  }
  if (description.length < 10) {
    return NextResponse.json({ error: "اكتب وصفاً للمشروع" }, { status: 422 })
  }

  const project: Project = {
    id: newId(),
    title,
    description,
    imageUrl: imageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`,
    location,
    year,
    category,
  }

  // الطاقم ينشر مباشرة.
  if (canPublishDirectly(session)) {
    await companies.updateOne(
      { _id: id },
      {
        $push: { portfolio: project },
        $set: {
          projectCount: (company.projectCount ?? 0) + 1,
          updatedAt: new Date().toISOString(),
        },
      },
    )
    await logAction({
      actor: session,
      action: "add_project",
      entityType: "company",
      entityId: id,
      details: `إضافة مشروع مباشرة: ${title}`,
    })
    return NextResponse.json({ project, direct: true })
  }

  // المعلن: المشروع يدخل مركز الموافقات.
  const req = await createChangeRequest({
    advertiser: session,
    entityType: "company-project",
    entityId: project.id,
    entityName: title,
    companyId: id,
    changes: [],
    payload: { action: "add", project },
  })
  await logAction({
    actor: session,
    action: "request_add_project",
    entityType: "company",
    entityId: id,
    details: `طلب إضافة مشروع «${title}» بانتظار المراجعة`,
  })
  return NextResponse.json({
    project,
    direct: false,
    pending: true,
    changeRequestId: req._id,
    message: "تم إرسال المشروع للمراجعة. سيظهر في ملف شركتك بعد اعتماد الإدارة.",
  })
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const session = await requireSession().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  const projectId = new URL(request.url).searchParams.get("projectId")
  if (!projectId) {
    return NextResponse.json({ error: "معرّف المشروع مطلوب" }, { status: 400 })
  }

  const { companies } = await getCollections()
  const company = await companies.findOne({ _id: id })
  if (!company) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }
  if (company.ownerId !== session.id && !isStaffRole(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const project = (company.portfolio ?? []).find((p) => p.id === projectId)
  const projectName = project?.title ?? projectId

  if (canPublishDirectly(session)) {
    await companies.updateOne(
      { _id: id },
      {
        $pull: { portfolio: { id: projectId } },
        $set: {
          projectCount: Math.max(0, (company.projectCount ?? 1) - 1),
          updatedAt: new Date().toISOString(),
        },
      },
    )
    await logAction({
      actor: session,
      action: "delete_project",
      entityType: "company",
      entityId: id,
      details: `حذف مشروع مباشرة: ${projectName}`,
    })
    return NextResponse.json({ ok: true, direct: true })
  }

  const req = await createChangeRequest({
    advertiser: session,
    entityType: "company-project",
    entityId: projectId,
    entityName: projectName,
    companyId: id,
    changes: [],
    payload: { action: "delete", projectId },
  })
  await logAction({
    actor: session,
    action: "request_delete_project",
    entityType: "company",
    entityId: id,
    details: `طلب حذف مشروع «${projectName}» بانتظار المراجعة`,
  })
  return NextResponse.json({
    ok: true,
    direct: false,
    pending: true,
    changeRequestId: req._id,
    message: "تم إرسال طلب الحذف للمراجعة.",
  })
}
