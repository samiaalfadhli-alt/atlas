import { NextResponse } from "next/server"

import { getCollections, newId, slugify } from "@/lib/db"
import { getSession } from "@/lib/session"
import { logAction } from "@/lib/audit"
import { canPublishDirectly } from "@/lib/approvals"
import type { Article, PublishStatus } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as PublishStatus | null
  const session = await getSession()
  const isStaff = session?.role === "admin" || session?.role === "content-manager" || session?.role === "ads-manager"

  const { articles } = await getCollections()
  if (!isStaff) {
    const items = await articles
      .find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .toArray()
    return NextResponse.json({ items })
  }

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  const items = await articles.find(filter).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "تسجيل الدخول مطلوب" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "البيانات غير صالحة" }, { status: 400 })
  }

  const title = String(body.title ?? "").trim()
  const excerpt = String(body.excerpt ?? "").trim()
  const bodyText = String(body.body ?? "").trim()

  if (title.length < 5) {
    return NextResponse.json({ error: "عنوان المقال مطلوب" }, { status: 422 })
  }
  if (excerpt.length < 10) {
    return NextResponse.json({ error: "اكتب ملخصاً للمقال" }, { status: 422 })
  }
  if (bodyText.length < 20) {
    return NextResponse.json({ error: "محتوى المقال قصير جداً" }, { status: 422 })
  }

  const { articles } = await getCollections()
  const baseSlug = slugify(title) || `article-${newId().slice(-6)}`
  let slug = baseSlug
  let suffix = 1
  while (await articles.findOne({ slug })) {
    slug = `${baseSlug}-${suffix++}`
  }

  const staff = canPublishDirectly(session)
  const requestedStatus = String(body.status ?? "").trim() as PublishStatus
  const status: PublishStatus = staff && requestedStatus === "published"
    ? "published"
    : requestedStatus === "draft"
      ? "draft"
      : "pending-review"

  const now = new Date().toISOString()
  const article: Article = {
    _id: newId(),
    title,
    slug,
    excerpt,
    body: bodyText,
    coverImage: String(body.coverImage ?? "").trim() || undefined,
    tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    category: String(body.category ?? "").trim() || undefined,
    seoTitle: String(body.seoTitle ?? "").trim() || undefined,
    seoDescription: String(body.seoDescription ?? "").trim() || undefined,
    status,
    authorId: session.id,
    authorName: session.name,
    featured: Boolean(body.featured),
    publishedAt: status === "published" ? now : undefined,
    views: 0,
    createdAt: now,
    updatedAt: now,
  }

  await articles.insertOne(article)
  await logAction({
    actor: session,
    action: "create_article",
    entityType: "article",
    entityId: article._id,
    details: `إنشاء مقال «${title}» (${status})`,
  })

  return NextResponse.json({
    article,
    pending: status === "pending-review",
    message: staff && status === "published"
      ? "تم نشر المقال."
      : "تم إرسال المقال للمراجعة — لن يُنشر إلا بعد اعتماد الإدارة.",
  })
}
