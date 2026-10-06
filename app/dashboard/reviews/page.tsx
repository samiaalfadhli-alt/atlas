import { redirect } from "next/navigation"

import { Star } from "lucide-react"

import { getSession } from "@/lib/session"
import { getCompanyByOwner, getReviews } from "@/lib/queries"
import { ReviewsBlock } from "@/components/reviews-block"
import { EmptyState } from "@/components/empty-state"
import { StarRating } from "@/components/star-rating"
import { toArabicDigits } from "@/lib/format"

export default async function DashboardReviewsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login?next=/dashboard/reviews")
  const company = await getCompanyByOwner(session.id)
  if (!company) {
    return (
      <EmptyState
        icon={<Star className="size-7" />}
        title="لم يتم العثور على ملف شركة"
        description="تواصل مع الدعم إذا واجهت هذه المشكلة."
      />
    )
  }

  const reviews = await getReviews(company._id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">التقييمات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            اطلّع على تقييمات العملاء وردّ عليها لبناء ثقة أكبر.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <StarRating rating={company.rating} showValue count={company.reviewCount} />
          <span className="text-xs text-muted-foreground">
            {toArabicDigits(company.reviewCount)} تقييم
          </span>
        </div>
      </div>

      <ReviewsBlock
        companyId={company._id}
        ownerId={company.ownerId}
        initial={reviews}
      />
    </div>
  )
}
