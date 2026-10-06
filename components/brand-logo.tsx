import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * الشعار الرسمي لمنصة «أطلس المنزل | HOME ATLAS».
 * يُعرض كما هو تمامًا دون أي تعديل على الأبعاد أو النسب أو الألوان.
 */
export function BrandLogo({
  className,
  height = 40,
  alt = "أطلس المنزل | HOME ATLAS",
  priority = false,
}: {
  className?: string
  height?: number
  alt?: string
  priority?: boolean
}) {
  // الأبعاد الأصلية للشعار: 332×241 — نحافظ على النسبة كما هي.
  const width = Math.round((height * 332) / 241)
  return (
    <img
      src="/logo.webp"
      alt={alt}
      width={width}
      height={height}
      loading={priority ? undefined : "eager"}
      decoding="async"
      className={cn("h-auto w-auto shrink-0 select-none object-contain", className)}
      style={{ height }}
    />
  )
}
