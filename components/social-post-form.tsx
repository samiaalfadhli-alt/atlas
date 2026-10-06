"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/types"

export function SocialPostForm() {
  const { t, isArabic } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [platforms, setPlatforms] = React.useState<SocialPlatform[]>([])
  const [mediaUrls, setMediaUrls] = React.useState("")
  const [scheduledAt, setScheduledAt] = React.useState("")

  function toggle(p: SocialPlatform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (content.trim().length < 3) {
      toast.error(t("اكتب محتوى المنشور", "Write post content"))
      return
    }
    if (platforms.length === 0) {
      toast.error(t("اختر منصة واحدة على الأقل", "Select at least one platform"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms,
          mediaUrls: mediaUrls.split("\n").map((s) => s.trim()).filter(Boolean),
          scheduledAt: scheduledAt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الحفظ", "Could not save"))
        return
      }
      toast.success(data.message || t("تم حفظ المنشور", "Post saved"))
      setOpen(false)
      setContent("")
      setPlatforms([])
      setMediaUrls("")
      setScheduledAt("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الحفظ", "Could not save"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("منشور جديد", "New post")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("إنشاء منشور للنشر الاجتماعي", "Create a social post")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-foreground">
            {t(
              "تكتب المنشور مرة واحدة وتختار المنصات. النشر الفعلي يتطلب ربط الحسابات عبر التكاملات الرسمية.",
              "Write once and pick platforms. Actual publishing requires connecting accounts via official APIs.",
            )}
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("المنصات", "Platforms")}</label>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => toggle(p.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    platforms.includes(p.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-gold",
                  )}
                >
                  {isArabic ? p.ar : p.en}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t("محتوى المنشور", "Content")}</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t("روابط الصور/الفيديو (سطر لكل رابط)", "Media URLs (one per line)")}</label>
            <Textarea value={mediaUrls} onChange={(e) => setMediaUrls(e.target.value)} rows={2} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">{t("جدولة النشر (اختياري)", "Schedule (optional)")}</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} dir="ltr" className="h-10" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {scheduledAt ? t("جدولة", "Schedule") : t("حفظ كمسودة", "Save draft")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
