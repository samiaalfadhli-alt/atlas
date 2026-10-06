import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { type MediaContext } from "@/lib/types"

type Params = { params: Promise<{ id: string }> }

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

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const session = await getSession()
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (typeof body.url === "string") update.url = body.url.trim()
  if (typeof body.name === "string") update.name = body.name.trim()
  if (typeof body.alt === "string") update.alt = body.alt.trim()
  if (typeof body.desktopUrl === "string") update.desktopUrl = body.desktopUrl.trim()
  if (typeof body.mobileUrl === "string") update.mobileUrl = body.mobileUrl.trim()
  if (typeof body.context === "string") {
    const ctx = body.context as MediaContext
    if (CONTEXTS.includes(ctx)) update.context = ctx
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "لا توجد حقول للتحديث" }, { status: 422 })
  }

  const { media } = await getCollections()
  await media.updateOne({ _id: id }, { $set: update })
  await logAction({
    actor: session,
    action: "update_media",
    entityType: "media",
    entityId: id,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const session = await getSession()
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { media } = await getCollections()
  await media.deleteOne({ _id: id })
  await logAction({
    actor: session,
    action: "delete_media",
    entityType: "media",
    entityId: id,
  })
  return NextResponse.json({ ok: true })
}
