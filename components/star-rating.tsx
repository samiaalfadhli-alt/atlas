import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatRating } from "@/lib/format"

export function StarRating({
  rating,
  size = 16,
  showValue = false,
  count,
  className,
}: {
  rating: number
  size?: number
  showValue?: boolean
  count?: number
  className?: string
}) {
  const rounded = Math.round(rating)
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="font-heading text-sm font-semibold tabular-nums">
          {rating > 0 ? formatRating(rating) : "—"}
        </span>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          ({formatRating(count)})
        </span>
      )}
    </span>
  )
}
