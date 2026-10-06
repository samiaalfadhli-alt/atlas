import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { type MediaContext, type MediaItem } from "@/lib/types"

const CONTEXTS: MediaContext[] = [
  "hero",
  "section",
  "company",
  "project",
  "category",
  "article",
  "banner",
  "general",
]

function isStaff(role: string) {
  return role === "admin" || role === "content-manager" || role === "ads-manager"
}

export async function GET(request: Request) {
  const session = await getSession()
  const context = new URL(request.url).searchParams.get("context") as MediaContext | null

  const { media } = await getCollections()
  const filter: Record<string, unknown> = {}
  if (context && CONTEXTS.includes(context)) filter.context = context

  // غير الطاقم يرى فقط وسائط سياق الصفحات العامة.
  if (!session || !isStaff(session.role)) {
    filter.context = { $in: ["hero", "section", "category", "general"] }
  }

  const items = await media.find(filter).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "غير مصرح — إدارة الوسائط للطاقم فقط" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const url = String(body.url ?? "").trim()
  const name = String(body.name ?? "").trim()
  if (!url || !name) {
    return NextResponse.json({ error: "الرابط والاسم مطلوبان" }, { status: 422 })
  }

  const context = (String(body.context ?? "general") as MediaContext)
  const item: MediaItem = {
    _id: newId(),
    url,
    name,
    alt: String(body.alt ?? "").trim() || undefined,
    mime: String(body.mime ?? "image/*"),
    width: Number(body.width ?? 0) || undefined,
    height: Number(body.height ?? 0) || undefined,
    size: Number(body.size ?? 0) || undefined,
    context: CONTEXTS.includes(context) ? context : "general",
    desktopUrl: String(body.desktopUrl ?? "").trim() || undefined,
    mobileUrl: String(body.mobileUrl ?? "").trim() || undefined,
    uploadedBy: session.id,
    createdAt: new Date().toISOString(),
  }

  const { media } = await getCollections()
  await media.insertOne(item)
  await logAction({
    actor: session,
    action: "upload_media",
    entityType: "media",
    entityId: item._id,
    details: `إضافة وسيط «${name}» (${item.context})`,
  })

  return NextResponse.json({ item })
}
