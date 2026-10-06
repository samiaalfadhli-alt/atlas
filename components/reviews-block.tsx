"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { formatDate, toArabicDigits } from "@/lib/format"
import type { Review } from "@/lib/types"

export function ReviewsBlock({
  companyId,
  ownerId,
  initial,
}: {
  companyId: string
  ownerId?: string
  initial: Review[]
}) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = React.useState(initial)

  const isOwner = !!user && user.id === ownerId
  const canReview = !isOwner

  function onAdded(review: Review) {
    setReviews((prev) => [review, ...prev])
    router.refresh()
  }

  function onReplied(reviewId: string, reply: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r._id === reviewId ? { ...r, reply, repliedAt: new Date().toISOString() } : r,
      ),
    )
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {canReview && (
        <ReviewForm companyId={companyId} userName={user?.name} onAdded={onAdded} t={t} />
      )}
      {isOwner && reviews.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          {t(
            "لا توجد تقييمات بعد. ستظهر تقييمات العملاء وردودك هنا.",
            "No reviews yet. Client reviews and your replies will appear here.",
          )}
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && !isOwner ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
            <p className="font-heading text-sm font-semibold">
              {t("لا توجد تقييمات بعد", "No reviews yet")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "كن أول من يقيّم تجربته مع هذه الشركة.",
                "Be the first to share your experience with this company.",
              )}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              isOwner={isOwner}
              onReplied={onReplied}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ReviewForm({
  companyId,
  userName,
  onAdded,
  t,
}: {
  companyId: string
  userName?: string
  onAdded: (r: Review) => void
  t: (a: string, b: string) => string
}) {
  const [name, setName] = React.useState(userName || "")
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      toast.error(t("اختر تقييماً من نجمة إلى خمس", "Select a rating from 1 to 5 stars"))
      return
    }
    if (!name.trim()) {
      toast.error(t("أدخل اسمك", "Enter your name"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, rating, comment, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("حدث خطأ", "Something went wrong"))
        return
      }
      onAdded(data.review as Review)
      setComment("")
      setRating(0)
      toast.success(t("تم نشر تقييمك", "Your review was published"))
    } catch {
      toast.error(t("تعذّر نشر التقييم", "Could not publish review"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="font-heading text-base font-bold">
        {t("أضف تقييمك", "Add your review")}
      </h3>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          {t("التقييم", "Rating")}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
              aria-label={`${toArabicDigits(i)} ${t("نجوم", "stars")}`}
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  (hover || rating) >= i
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      {!userName && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("الاسم", "Name")}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("اسمك كما سيظهر في التقييم", "Your name as it will appear")}
          />
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          {t("تعليقك", "Your comment")}
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("شارك تجربتك مع هذه الشركة…", "Share your experience with this company…")}
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? t("جارٍ النشر…", "Publishing…") : t("انشر التقييم", "Publish review")}
      </Button>
    </form>
  )
}

function ReviewItem({
  review,
  isOwner,
  onReplied,
  t,
}: {
  review: Review
  isOwner: boolean
  onReplied: (id: string, reply: string) => void
  t: (a: string, b: string) => string
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 font-heading text-xs font-bold text-primary">
            {review.userName.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-sm font-semibold">{review.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i <= review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-foreground/90">{review.comment}</p>
      )}

      {review.reply ? (
        <div className="rounded-lg bg-secondary/60 p-3 ps-4 ring-1 ring-border/60">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {t("ردّ الشركة", "Company reply")}
          </span>
          <p className="text-sm leading-relaxed text-foreground/90">{review.reply}</p>
        </div>
      ) : isOwner ? (
        <OwnerReply reviewId={review._id} onReplied={onReplied} t={t} />
      ) : null}
    </div>
  )
}

function OwnerReply({
  reviewId,
  onReplied,
  t,
}: {
  reviewId: string
  onReplied: (id: string, reply: string) => void
  t: (a: string, b: string) => string
}) {
  const [reply, setReply] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (reply.trim().length < 2) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("حدث خطأ", "Something went wrong"))
        return
      }
      onReplied(reviewId, reply.trim())
      setReply("")
      setOpen(false)
      toast.success(t("تم نشر الرد", "Reply published"))
    } catch {
      toast.error(t("تعذّر نشر الرد", "Could not publish reply"))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t("الرد على التقييم", "Reply to review")}
      </Button>
    )
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={t("اكتب ردّك…", "Write your reply…")}
        rows={2}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? t("جارٍ النشر…", "Publishing…") : t("نشر الرد", "Publish reply")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t("إلغاء", "Cancel")}
        </Button>
      </div>
    </form>
  )
}
