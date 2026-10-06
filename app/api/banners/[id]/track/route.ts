import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const type = String(body.type ?? "").trim()
  if (type !== "view" && type !== "click") {
    return NextResponse.json({ error: "نوع غير صالح" }, { status: 422 })
  }

  const { banners } = await getCollections()
  const field = type === "view" ? "views" : "clicks"
  await banners.updateOne({ _id: id }, { $inc: { [field]: 1 } })
  return NextResponse.json({ ok: true })
}
