"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type BannerSlide = {
  _id: string
  title: string
  description?: string
  desktopImage: string
  mobileImage?: string
  ctaLabel?: string
  ctaUrl?: string
}

const isDefaultBanner = (id: string) => id.startsWith("default-")

function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {}
      }
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      const handler = () => onChange()
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    },
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

export function BannerCarousel({
  banners,
  intervalMs = 6000,
  autoplay = true,
}: {
  banners: BannerSlide[]
  intervalMs?: number
  autoplay?: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [snaps, setSnaps] = React.useState<number[]>([])
  const [paused, setPaused] = React.useState(false)
  const [navNonce, setNavNonce] = React.useState(0)

  const prefersReduced = usePrefersReducedMotion()

  const canAutoplay = autoplay && banners.length > 1 && !prefersReduced

  const track = React.useCallback(
    async (id: string, type: "view" | "click") => {
      if (isDefaultBanner(id)) return
      try {
        await fetch(`/api/banners/${id}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        })
      } catch {
        // تجاهل أخطاء التتبّع.
      }
    },
    [],
  )

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSnaps(emblaApi.scrollSnapList())
      const idx = emblaApi.selectedScrollSnap()
      setSelectedIndex(idx)
      const current = banners[idx]
      if (current) void track(current._id, "view")
    }
    emblaApi.on("select", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, banners, track])

  // إيقاف التحريك التلقائي عند إخفاء التبويب.
  React.useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // مؤقّت التحريك التلقائي — يُعاد ضبطه عند التفاعل اليدوي.
  React.useEffect(() => {
    if (!emblaApi || !canAutoplay || paused) return
    const id = setInterval(() => emblaApi.scrollNext(), intervalMs)
    return () => clearInterval(id)
  }, [emblaApi, canAutoplay, paused, intervalMs, navNonce])

  const scrollPrev = React.useCallback(() => {
    setNavNonce((n) => n + 1)
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    setNavNonce((n) => n + 1)
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = React.useCallback(
    (i: number) => {
      setNavNonce((n) => n + 1)
      emblaApi?.scrollTo(i)
    },
    [emblaApi],
  )

  if (banners.length === 0) return null
  const multiple = banners.length > 1

  return (
    <div
      className="group/carousel relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onMouseEnter={() => canAutoplay && setPaused(true)}
      onMouseLeave={() => canAutoplay && setPaused(false)}
      onFocus={() => canAutoplay && setPaused(true)}
      onBlur={() => canAutoplay && setPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((b) => (
            <div key={b._id} className="min-w-0 flex-[0_0_100%]">
              <a
                href={b.ctaUrl || "#"}
                target={b.ctaUrl?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => void track(b._id, "click")}
                className="group/slide relative block"
              >
                <div className="relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.desktopImage}
                    alt={b.title}
                    className="size-full object-cover transition-transform duration-[1200ms] ease-out group-hover/slide:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent rtl:bg-gradient-to-r" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
                  <div className="max-w-2xl space-y-3">
                    {b.title && (
                      <h3 className="font-heading text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">
                        {b.title}
                      </h3>
                    )}
                    {b.description && (
                      <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/90 drop-shadow sm:text-lg">
                        {b.description}
                      </p>
                    )}
                    {b.ctaLabel && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-md transition-all group-hover/slide:gap-2.5 group-hover/slide:bg-gold/95 sm:text-base">
                        {b.ctaLabel}
                        <ArrowLeft className="size-4 rtl:rotate-180" />
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* أسهم التنقّل — السابق (يمين) والتالي (يسار) في RTL */}
      {multiple && (
        <React.Fragment>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="الشريحة السابقة"
            className="absolute end-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:end-4 sm:size-11"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="الشريحة التالية"
            className="absolute start-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:start-4 sm:size-11"
          >
            <ChevronLeft className="size-5" />
          </button>
        </React.Fragment>
      )}

      {/* شريط التقدّم + النقاط */}
      {multiple && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0">
          {canAutoplay && (
            <div className="h-0.5 w-full bg-white/15" aria-hidden>
              <div
                key={`${selectedIndex}-${navNonce}`}
                className="banner-progress-bar h-full origin-right bg-gold"
                style={{
                  animation: `banner-progress ${intervalMs}ms linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/40 to-transparent p-3">
            {snaps.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`الشريحة ${i + 1}`}
                aria-current={i === selectedIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selectedIndex
                    ? "w-6 bg-gold"
                    : "w-1.5 bg-white/60 hover:bg-white",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
