import { NextResponse } from "next/server"

import { getCollections, seedDatabase } from "@/lib/db"
import { requireSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { canPublishDirectly, createChangeRequest } from "@/lib/approvals"
import { isStaffRole, type Company } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

const FIELD_LABELS: Record<string, string> = {
  name: "اسم الشركة",
  nameEn: "الاسم الإنجليزي",
  tagline: "الشعار المختصر",
  description: "نبذة عن الشركة",
  city: "المدينة",
  district: "الحي",
  phone: "الهاتف",
  email: "البريد الإلكتروني",
  website: "الموقع الإلكتروني",
  logoUrl: "الشعار",
  coverUrl: "صورة الغلاف",
  establishedYear: "سنة التأسيس",
  teamSize: "حجم الفريق",
  services: "الخدمات",
}

export async function GET(_request: Request, { params }: Params) {
  await seedDatabase().catch(() => {})
  const { id } = await params
  const { companies } = await getCollections()
  const company = await companies.findOne({ _id: id })
  if (!company || company.status !== "approved") {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }
  return NextResponse.json({ company: serializeCompany(company) })
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const session = await requireSession().catch((error) => error)

  if (session instanceof Error) {
    const status = "status" in session ? (session.status as number) : 401
    return NextResponse.json({ error: "غير مصرح" }, { status })
  }

  const { companies } = await getCollections()
  const company = await companies.findOne({ _id: id })
  if (!company) {
    return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 })
  }
  if (company.ownerId !== session.id && !isStaffRole(session.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية تعديل هذه الشركة" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const candidate: Partial<Company> = {
    name: str(body.name, company.name),
    nameEn: str(body.nameEn, company.nameEn ?? ""),
    tagline: str(body.tagline, company.tagline),
    description: str(body.description, company.description),
    city: str(body.city, company.city),
    district: str(body.district, company.district ?? ""),
    phone: str(body.phone, company.phone),
    email: str(body.email, company.email),
    website: str(body.website, company.website ?? ""),
    logoUrl: str(body.logoUrl, company.logoUrl ?? ""),
    coverUrl: str(body.coverUrl, company.coverUrl ?? ""),
    establishedYear: str(body.establishedYear, company.establishedYear ?? ""),
    teamSize: str(body.teamSize, company.teamSize ?? ""),
  }
  if (Array.isArray(body.services)) {
    candidate.services = body.services.map((s) => String(s).trim()).filter(Boolean)
  }

  // صاحب الموقع والمديرون ينشرون مباشرة.
  if (canPublishDirectly(session)) {
    await companies.updateOne(
      { _id: id },
      { $set: { ...candidate, updatedAt: new Date().toISOString() } },
    )
    await logAction({
      actor: session,
      action: "update_company",
      entityType: "company",
      entityId: id,
      details: `تعديل مباشر لبيانات «${candidate.name ?? company.name}»`,
    })
    const updated = await companies.findOne({ _id: id })
    return NextResponse.json({ company: serializeCompany(updated!), direct: true })
  }

  // المعلن: التعديلات تدخل مركز الموافقات ولا تُنشر مباشرة.
  const changes: Array<{ field: string; fieldLabel: string; oldValue: unknown; newValue: unknown }> = []
  for (const [field, value] of Object.entries(candidate)) {
    const current = (company as unknown as Record<string, unknown>)[field]
    if (JSON.stringify(current) !== JSON.stringify(value)) {
      changes.push({
        field,
        fieldLabel: FIELD_LABELS[field] ?? field,
        oldValue: (current as unknown) ?? "",
        newValue: value ?? "",
      })
    }
  }

  if (changes.length === 0) {
    return NextResponse.json({ ok: true, direct: false, message: "لا توجد تغييرات" })
  }

  const req = await createChangeRequest({
    advertiser: session,
    entityType: "company",
    entityId: id,
    entityName: company.name,
    companyId: id,
    changes: changes.map((c) => ({
      field: c.field,
      fieldLabel: c.fieldLabel,
      oldValue: Array.isArray(c.oldValue) ? (c.oldValue as string[]) : String(c.oldValue ?? ""),
      newValue: Array.isArray(c.newValue) ? (c.newValue as string[]) : String(c.newValue ?? ""),
    })),
  })

  await logAction({
    actor: session,
    action: "request_company_change",
    entityType: "company",
    entityId: id,
    details: `طلب تعديل بيانات «${company.name}» (${changes.length} حقل)`,
  })

  return NextResponse.json({
    ok: true,
    direct: false,
    pending: true,
    changeRequestId: req._id,
    message: "تم إرسال التعديلات للمراجعة. لن تظهر على الموقع إلا بعد اعتماد الإدارة.",
  })
}

function str(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value.trim()
  return fallback
}

export function serializeCompany(c: Company): Company {
  return {
    ...c,
    portfolio: c.portfolio ?? [],
    services: c.services ?? [],
  }
}
