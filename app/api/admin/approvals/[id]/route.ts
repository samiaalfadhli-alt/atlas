import { NextResponse } from "next/server"

import { requireStaff } from "@/lib/session"
import { approveChangeRequest, rejectChangeRequest, requestChangesOnRequest } from "@/lib/approvals"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const action = String(body.action ?? "").trim()
  const reason = String(body.reason ?? "").trim()

  if (action === "approve") {
    const req = await approveChangeRequest(id, session)
    if (!req) {
      return NextResponse.json({ error: "الطلب غير موجود أو تمت مراجعته" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, status: "approved" })
  }

  if (action === "reject") {
    if (reason.length < 3) {
      return NextResponse.json({ error: "يرجى كتابة سبب الرفض" }, { status: 422 })
    }
    const req = await rejectChangeRequest(id, session, reason)
    if (!req) {
      return NextResponse.json({ error: "الطلب غير موجود أو تمت مراجعته" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, status: "rejected", reason })
  }

  if (action === "request-changes") {
    if (reason.length < 3) {
      return NextResponse.json({ error: "يرجى كتابة الملاحظات المطلوبة" }, { status: 422 })
    }
    const req = await requestChangesOnRequest(id, session, reason)
    if (!req) {
      return NextResponse.json({ error: "الطلب غير موجود أو تمت مراجعته" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, status: "changes-requested", reason })
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 422 })
}
