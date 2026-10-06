import { NextResponse } from "next/server"

import { getCollections, newId } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { logAction } from "@/lib/audit"
import {
  SOCIAL_PLATFORMS,
  type SocialPlatform,
  type SocialPost,
} from "@/lib/types"

const VALID_PLATFORMS = SOCIAL_PLATFORMS.map((p) => p.value)

export async function GET() {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }
  const { socialPosts } = await getCollections()
  const items = await socialPosts.find({}).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ items })
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

  const content = String(body.content ?? "").trim()
  const platforms = Array.isArray(body.platforms)
    ? (body.platforms as string[]).filter((p) => VALID_PLATFORMS.includes(p as SocialPlatform)) as SocialPlatform[]
    : []
  const scheduledAt = String(body.scheduledAt ?? "").trim() || undefined

  if (content.length < 3) {
    return NextResponse.json({ error: "اكتب محتوى المنشور" }, { status: 422 })
  }
  if (platforms.length === 0) {
    return NextResponse.json({ error: "اختر منصة واحدة على الأقل" }, { status: 422 })
  }

  const now = new Date().toISOString()
  const post: SocialPost = {
    _id: newId(),
    content,
    platforms,
    mediaUrls: Array.isArray(body.mediaUrls)
      ? (body.mediaUrls as unknown[]).map((m) => String(m).trim()).filter(Boolean)
      : [],
    perPlatformText:
      body.perPlatformText && typeof body.perPlatformText === "object"
        ? (body.perPlatformText as SocialPost["perPlatformText"])
        : undefined,
    scheduledAt,
    status: scheduledAt ? "scheduled" : "draft",
    createdBy: session.id,
    createdAt: now,
    updatedAt: now,
  }

  const { socialPosts } = await getCollections()
  await socialPosts.insertOne(post)
  await logAction({
    actor: session,
    action: "create_social_post",
    entityType: "social-post",
    entityId: post._id,
    details: `إنشاء منشور لـ ${platforms.length} منصة`,
  })

  return NextResponse.json({
    post,
    message: "تم حفظ المنشور. النشر الفعلي يتطلب ربط حسابات التواصل عبر التكاملات الرسمية.",
  })
}
