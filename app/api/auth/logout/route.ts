import { NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "@/lib/auth"
import { sessionCookieOptions } from "@/lib/session-cookie"

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true })
  const opts = sessionCookieOptions(request, 0)
  res.cookies.set(SESSION_COOKIE_NAME, "", { ...opts, maxAge: 0 })
  return res
}
