"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES, CATEGORY_META } from "@/lib/types"

export function ArticleForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    excerpt: "",
    body: "",
    coverImage: "",
    tags: "",
    category: "",
    seoTitle: "",
    seoDescription: "",
    featured: false,
  })

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 5) {
      toast.error(t("اكتب عنوان المقال", "Enter a title"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
          status: "published",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر النشر", "Could not publish"))
        return
      }
      toast.success(data.message || t("تم نشر المقال", "Article published"))
      setOpen(false)
      setForm({ title: "", excerpt: "", body: "", coverImage: "", tags: "", category: "", seoTitle: "", seoDescription: "", featured: false })
      router.refresh()
    } catch {
      toast.error(t("تعذّر النشر", "Could not publish"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("مقال جديد", "New article")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("إنشاء مقال / محتوى", "Create content")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("عنوان المقال", "Title")}>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
          </Field>
          <Field label={t("الملخص", "Excerpt")}>
            <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
          </Field>
          <Field label={t("المحتوى", "Body")}>
            <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={8} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("صورة الغلاف (رابط)", "Cover image URL")}>
              <Input value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} dir="ltr" className="h-10" placeholder="https://…" />
            </Field>
            <Field label={t("التصنيف", "Category")}>
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-10" list="cat-list" />
              <datalist id="cat-list">
                {CATEGORIES.map((c) => (
                  <option key={c} value={CATEGORY_META[c].ar} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field label={t("الوسوم (افصل بفاصلة)", "Tags (comma separated)")}>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="h-10" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("SEO Title", "SEO Title")}>
              <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
            </Field>
            <Field label={t("SEO Description", "SEO Description")}>
              <Input value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="h-10" />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
            <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", Boolean(v))} />
            {t("مقال مميّز", "Featured article")}
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {t("نشر", "Publish")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
