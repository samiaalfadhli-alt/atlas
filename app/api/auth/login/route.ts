import { NextResponse } from "next/server"

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth"
import { sessionCookieOptions } from "@/lib/session-cookie"
import { getCollections, seedDatabase } from "@/lib/db"

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")

  if (!email || !password) {
    return NextResponse.json(
      { error: "البريد وكلمة المرور مطلوبان" },
      { status: 422 },
    )
  }

  // Make sure the seeded admin + sample companies exist before login attempts.
  await seedDatabase().catch(() => {})

  const { users } = await getCollections()
  const user = await users.findOne({ email })
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "البريد أو كلمة المرور غير صحيحة" },
      { status: 401 },
    )
  }

  const token = createSessionToken({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  })

  const res = NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  })
  res.cookies.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(request, SESSION_MAX_AGE_SECONDS),
  )
  return res
}
