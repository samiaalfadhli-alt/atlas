import { NextResponse } from "next/server"

import { getIntegrations } from "@/lib/platform-queries"
import { requireStaff } from "@/lib/session"

export async function GET() {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const items = await getIntegrations()
  // لا نُرجع أي مفاتيح — الحالة فقط.
  return NextResponse.json({
    items: items.map((i) => ({
      _id: i._id,
      provider: i.provider,
      status: i.status,
      accountLabel: i.accountLabel,
      resourceRef: i.resourceRef,
      connectedAt: i.connectedAt,
    })),
  })
}
