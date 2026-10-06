import { NextResponse } from "next/server"

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  hashPassword,
} from "@/lib/auth"
import { sessionCookieOptions } from "@/lib/session-cookie"
import { getCollections, newId, slugify } from "@/lib/db"
import { buildTrialWindow, getPlan, isPlanId } from "@/lib/plans"
import { CATEGORIES, type Category, type Company, type Subscription, type User } from "@/lib/types"

function jsonError(message: string, status: number, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError("البيانات غير صالحة", 400)
  }

  const name = String(body.name ?? "").trim()
  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")
  const phone = String(body.phone ?? "").trim()
  const companyName = String(body.companyName ?? "").trim()
  const category = String(body.category ?? "").trim() as Category
  const city = String(body.city ?? "").trim()
  const tagline = String(body.tagline ?? "").trim()
  const description = String(body.description ?? "").trim()
  const servicesRaw = Array.isArray(body.services) ? body.services : []
  const services = servicesRaw.map((s) => String(s).trim()).filter(Boolean)
  const phone2 = String(body.companyPhone ?? "").trim()
  const planId = String(body.planId ?? "").trim()

  const fields: Record<string, string> = {}
  if (name.length < 3) fields.name = "الاسم مطلوب"
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fields.email = "بريد إلكتروني غير صالح"
  if (password.length < 8) fields.password = "كلمة المرور لا تقل عن ٨ أحرف"
  if (!CATEGORIES.includes(category)) fields.category = "اختر التخصص"
  if (companyName.length < 3) fields.companyName = "اسم الشركة مطلوب"
  if (city.length < 2) fields.city = "المدينة مطلوبة"
  if (description.length < 20) fields.description = "اكتب وصفاً موجزاً لا يقل عن ٢٠ حرفاً"
  if (!isPlanId(planId)) fields.planId = "اختر إحدى الباقات"
  if (Object.keys(fields).length > 0) {
    return jsonError("يرجى تصحيح الحقول المطلوبة", 422, fields)
  }

  const plan = getPlan(planId)!

  const { users, companies } = await getCollections()
  const existing = await users.findOne({ email })
  if (existing) {
    return jsonError("هذا البريد مسجل مسبقاً", 409, { email: "البريد مستخدم" })
  }

  const userId = newId()
  const companyId = newId()
  const now = new Date().toISOString()
  const baseSlug = slugify(companyName)
  let slug = baseSlug
  let suffix = 1
  while (await companies.findOne({ slug })) {
    slug = `${baseSlug}-${suffix++}`
  }

  const { start: trialStart, end: trialEnd } = buildTrialWindow(plan.trialDays)
  const subscription: Subscription = {
    planId: plan.id,
    planName: plan.fullName.ar,
    status: "trialing",
    trialStart,
    trialEnd,
    startedAt: now,
    price: plan.price,
    currency: plan.currency,
    period: plan.period,
  }

  const company: Company = {
    _id: companyId,
    name: companyName,
    nameEn: "",
    slug,
    category,
    tagline: tagline || " ",
    description,
    city,
    services: services.slice(0, 12),
    phone: phone2 || phone,
    email,
    website: "",
    logoUrl: "",
    coverUrl: "",
    establishedYear: "",
    teamSize: "",
    status: "pending",
    ownerId: userId,
    rating: 0,
    reviewCount: 0,
    projectCount: 0,
    portfolio: [],
    featured: false,
    verified: false,
    subscription,
    createdAt: now,
    updatedAt: now,
  }

  const user: User = {
    _id: userId,
    name,
    email,
    phone,
    role: "company",
    companyId,
    passwordHash: hashPassword(password),
    createdAt: now,
  }

  await companies.insertOne(company)
  await users.insertOne(user)

  const token = createSessionToken({
    id: userId,
    email,
    name,
    role: "company",
    companyId,
  })

  const res = NextResponse.json({
    user: { id: userId, name, email, role: "company", companyId },
    companySlug: slug,
  })
  res.cookies.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(request, SESSION_MAX_AGE_SECONDS),
  )
  return res
}
