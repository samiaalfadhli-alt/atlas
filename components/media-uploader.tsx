"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

const CONTEXTS = [
  { value: "hero", ar: "الهيرو" },
  { value: "section", ar: "الأقسام" },
  { value: "company", ar: "الشركات" },
  { value: "project", ar: "المشاريع" },
  { value: "category", ar: "التصنيفات" },
  { value: "article", ar: "المقالات" },
  { value: "banner", ar: "البنرات" },
  { value: "general", ar: "عام" },
]

export function MediaUploader() {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    url: "",
    name: "",
    alt: "",
    desktopUrl: "",
    mobileUrl: "",
    context: "general",
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.url.trim() || !form.name.trim()) {
      toast.error(t("الرابط والاسم مطلوبان", "URL and name required"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإضافة", "Could not add"))
        return
      }
      toast.success(t("تمت إضافة الوسيط", "Media added"))
      setOpen(false)
      setForm({ url: "", name: "", alt: "", desktopUrl: "", mobileUrl: "", context: "general" })
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإضافة", "Could not add"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("إضافة وسيط", "Add media")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("إضافة صورة/وسيط", "Add media")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("رابط الصورة", "Image URL")}>
            <Input value={form.url} onChange={(e) => set("url", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("الاسم", "Name")}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("السياق", "Context")}>
              <Select value={form.context} onValueChange={(v) => set("context", v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTEXTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label={t("النص البديل (Alt)", "Alt text")}>
            <Input value={form.alt} onChange={(e) => set("alt", e.target.value)} className="h-10" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("نسخة Desktop (اختياري)", "Desktop URL")}>
              <Input value={form.desktopUrl} onChange={(e) => set("desktopUrl", e.target.value)} dir="ltr" className="h-10" />
            </Field>
            <Field label={t("نسخة Mobile (اختياري)", "Mobile URL")}>
              <Input value={form.mobileUrl} onChange={(e) => set("mobileUrl", e.target.value)} dir="ltr" className="h-10" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t("إضافة", "Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MediaDeleteButton({ id }: { id: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  async function remove() {
    setLoading(true)
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الحذف", "Could not delete"))
        return
      }
      toast.success(t("تم الحذف", "Deleted"))
      router.refresh()
    } catch {
      toast.error(t("تعذّر الحذف", "Could not delete"))
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      onClick={remove}
      disabled={loading}
      className="flex size-8 items-center justify-center rounded-lg bg-background/90 text-destructive opacity-0 shadow-sm transition-opacity hover:bg-destructive hover:text-white group-hover/media:opacity-100"
      aria-label={t("حذف", "Delete")}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  )
}
