import { Share2, Clock, CheckCircle2, XCircle } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, DisconnectedNotice } from "@/components/admin-primitives"
import { SocialPostForm } from "@/components/social-post-form"
import { getSocialPosts, getIntegrations } from "@/lib/platform-queries"
import { toArabicDigits, timeAgo } from "@/lib/format"
import { SOCIAL_PLATFORMS } from "@/lib/types"

const STATUS_LABEL: Record<string, { ar: string; tone: string }> = {
  draft: { ar: "مسودة", tone: "text-muted-foreground" },
  scheduled: { ar: "مجدول", tone: "text-gold-foreground" },
  publishing: { ar: "قيد النشر", tone: "text-primary" },
  published: { ar: "منشور", tone: "text-primary" },
  failed: { ar: "فشل", tone: "text-destructive" },
  partial: { ar: "نشر جزئي", tone: "text-amber-600" },
}

export default async function SocialPage() {
  const [posts, integrations] = await Promise.all([
    getSocialPosts(),
    getIntegrations(),
  ])

  const connectedPlatforms = new Set(
    integrations
      .filter((i) => i.status === "connected")
      .map((i) => i.provider),
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مركز النشر الاجتماعي"
        subtitle="اكتب المنشور مرة واحدة وانشره على منصات التواصل عبر APIs الرسمية فقط."
        action={<SocialPostForm />}
      />

      <DisconnectedNotice
        provider="حسابات التواصل الاجتماعي"
        description="لم يتم ربط أي حساب تواصل اجتماعي بعد. بعد الربط عبر APIs الرسمية وOAuth، يمكنك النشر الآن أو جدولته ومتابعة حالة النشر وإعادة المحاولة عند الفشل."
      />

      {/* حالة اتصال المنصات */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
        <span className="px-1 text-xs font-semibold text-muted-foreground">حالة المنصات:</span>
        {SOCIAL_PLATFORMS.map((p) => (
          <span
            key={p.value}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              connectedPlatforms.has(p.value)
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {p.ar} — {connectedPlatforms.has(p.value) ? "متصل" : "غير متصل"}
          </span>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => {
            const meta = STATUS_LABEL[post.status] ?? STATUS_LABEL.draft
            return (
              <div key={post._id} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {post.platforms.map((p) => {
                      const plat = SOCIAL_PLATFORMS.find((s) => s.value === p)
                      return (
                        <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                          {plat?.ar ?? p}
                        </span>
                      )
                    })}
                  </div>
                  <span className={`text-xs font-semibold ${meta.tone}`}>{meta.ar}</span>
                </div>
                <p className="line-clamp-3 text-sm text-foreground/90">{post.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {post.status === "published" ? <CheckCircle2 className="size-3" /> : post.status === "failed" ? <XCircle className="size-3" /> : <Clock className="size-3" />}
                    {post.scheduledAt ? `مجدول: ${timeAgo(post.scheduledAt)}` : timeAgo(post.createdAt)}
                  </span>
                  {post.mediaUrls.length > 0 && <span>{toArabicDigits(post.mediaUrls.length)} مرفق</span>}
                </div>
                {post.failureReason && (
                  <p className="mt-2 text-xs text-destructive">سبب الفشل: {post.failureReason}</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Share2 className="size-8" />}
          title="لا توجد منشورات"
          description="أنشئ أول منشور — سيُحفظ كمسودة حتى يتم ربط الحسابات."
        />
      )}
    </div>
  )
}
