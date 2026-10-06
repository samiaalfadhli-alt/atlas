import { NextResponse } from "next/server"
import { type Filter } from "mongodb"

import { getCollections, newId, slugify } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import {
  CATEGORIES,
  type Category,
  type Company,
  type CompanyStatus,
} from "@/lib/types"

function isStaff(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

export async function GET(request: Request) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const status = new URL(request.url).searchParams.get("status") || undefined
  const { companies } = await getCollections()

  const filter: Filter<Company> = {}
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status as CompanyStatus
  }

  const items = await companies
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({
    items: items.map((c) => ({
      ...c,
      portfolio: c.portfolio ?? [],
      services: c.services ?? [],
    })),
  })
}

export async function POST(request: Request) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const name = String(body.name ?? "").trim()
  const category = String(body.category ?? "").trim() as Category
  const city = String(body.city ?? "").trim()
  const description = String(body.description ?? "").trim()

  if (name.length < 3) {
    return NextResponse.json({ error: "اسم الشركة مطلوب" }, { status: 422 })
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "التصنيف غير صالح" }, { status: 422 })
  }
  if (city.length < 2) {
    return NextResponse.json({ error: "المدينة مطلوبة" }, { status: 422 })
  }
  if (description.length < 20) {
    return NextResponse.json({ error: "اكتب وصفاً لا يقل عن ٢٠ حرفاً" }, { status: 422 })
  }

  const { companies } = await getCollections()
  const baseSlug = slugify(name)
  let slug = baseSlug
  let suffix = 1
  while (await companies.findOne({ slug })) {
    slug = `${baseSlug}-${suffix++}`
  }

  const requestedStatus = String(body.status ?? "pending").trim() as CompanyStatus
  const status: CompanyStatus = isStaff(session.role) && requestedStatus === "approved"
    ? "approved"
    : "pending"

  const services = Array.isArray(body.services)
    ? body.services.map((s) => String(s).trim()).filter(Boolean)
    : []
  const subcategories = Array.isArray(body.subcategories)
    ? body.subcategories.map((s) => String(s).trim()).filter(Boolean)
    : []

  const now = new Date().toISOString()
  const company: Company = {
    _id: newId(),
    name,
    nameEn: String(body.nameEn ?? "").trim(),
    slug,
    category,
    tagline: String(body.tagline ?? "").trim() || " ",
    description,
    city,
    district: String(body.district ?? "").trim() || undefined,
    services: [...new Set([...services, ...subcategories])].slice(0, 12),
    phone: String(body.phone ?? "").trim(),
    email: String(body.email ?? "").trim(),
    website: String(body.website ?? "").trim() || undefined,
    logoUrl: String(body.logoUrl ?? "").trim() || undefined,
    coverUrl: String(body.coverUrl ?? "").trim() || undefined,
    establishedYear: String(body.establishedYear ?? "").trim() || undefined,
    teamSize: String(body.teamSize ?? "").trim() || undefined,
    status,
    ownerId: undefined,
    rating: 0,
    reviewCount: 0,
    projectCount: 0,
    portfolio: [],
    featured: Boolean(body.featured),
    verified: Boolean(body.verified),
    createdAt: now,
    updatedAt: now,
  }

  await companies.insertOne(company)
  await logAction({
    actor: session,
    action: "create_company",
    entityType: "company",
    entityId: company._id,
    details: `إضافة شركة «${name}» (${status})`,
  })

  return NextResponse.json({
    company,
    message: status === "approved"
      ? "تمت إضافة الشركة واعتمادها."
      : "تمت إضافة الشركة كمسودة قيد المراجعة.",
  })
}
