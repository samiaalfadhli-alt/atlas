"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImagePlus, Loader2, MapPin, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { toArabicDigits } from "@/lib/format"
import type { Project } from "@/lib/types"

export function PortfolioManager({
  companyId,
  projects,
}: {
  companyId: string
  projects: Project[]
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [items, setItems] = React.useState(projects)
  const [open, setOpen] = React.useState(false)

  function onAdded(project: Project) {
    setItems((prev) => [project, ...prev])
    setOpen(false)
    router.refresh()
  }

  async function remove(id: string) {
    const prev = items
    setItems((prev) => prev.filter((p) => p.id !== id))
    try {
      const res = await fetch(`/api/companies/${companyId}/portfolio?projectId=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setItems(prev)
        toast.error(t("تعذّر الحذف", "Could not delete"))
        return
      }
      if (data.pending) {
        toast.info(
          t(
            "تم إرسال طلب الحذف للمراجعة",
            "Deletion request sent for review",
          ),
        )
        setItems(prev)
      } else {
        toast.success(t("تم حذف المشروع", "Project deleted"))
      }
      router.refresh()
    } catch {
      setItems(prev)
      toast.error(t("تعذّر الحذف", "Could not delete"))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          <span className="font-heading font-bold text-foreground">{toArabicDigits(items.length)}</span>{" "}
          {t("مشروع منشور", "projects published")}
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              {t("إضافة مشروع", "Add project")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("إضافة مشروع جديد", "Add a new project")}</DialogTitle>
            </DialogHeader>
            <AddProjectForm companyId={companyId} onAdded={onAdded} t={t} />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center">
          <ImagePlus className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t("لم تنشر أي مشروع بعد. أضف أول عمل لك.", "No projects yet. Add your first work.")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <div
              key={project.id}
              className="group/project flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.imageUrl} alt={project.title} loading="lazy" className="size-full object-cover" />
                <button
                  onClick={() => void remove(project.id)}
                  className="absolute end-2 top-2 flex size-8 items-center justify-center rounded-lg bg-background/90 text-destructive opacity-0 shadow-sm transition-opacity hover:bg-destructive hover:text-white group-hover/project:opacity-100"
                  aria-label={t("حذف", "Delete")}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h4 className="font-heading text-sm font-bold leading-tight">{project.title}</h4>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  {project.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />
                      {project.location}
                    </span>
                  )}
                  {project.year && <span className="tabular-nums">{toArabicDigits(project.year)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddProjectForm({
  companyId,
  onAdded,
  t,
}: {
  companyId: string
  onAdded: (p: Project) => void
  t: (a: string, b: string) => string
}) {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    year: "",
    category: "",
  })
  const [loading, setLoading] = React.useState(false)

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 3) {
      toast.error(t("اكتب عنواناً للمشروع", "Enter a project title"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/companies/${companyId}/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإضافة", "Could not add"))
        return
      }
      if (data.pending) {
        toast.info(
          t(
            "تم إرسال المشروع للمراجعة — سيظهر بعد اعتماد الإدارة",
            "Project sent for review — visible after admin approval",
          ),
        )
      } else {
        onAdded(data.project as Project)
        toast.success(t("تمت إضافة المشروع", "Project added"))
      }
    } catch {
      toast.error(t("تعذّر الإضافة", "Could not add"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold">{t("عنوان المشروع", "Project title")}</label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold">{t("الوصف", "Description")}</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold">{t("رابط الصورة", "Image URL")}</label>
        <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} dir="ltr" className="h-10" placeholder="https://… (اختياري)" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">{t("الموقع", "Location")}</label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold">{t("السنة", "Year")}</label>
          <Input value={form.year} onChange={(e) => set("year", e.target.value)} dir="ltr" className="h-10" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold">{t("التصنيف (اختياري)", "Category (optional)")}</label>
        <Input value={form.category} onChange={(e) => set("category", e.target.value)} className="h-10" placeholder={t("مثال: سكني، تجاري", "e.g. Residential, Commercial")} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {loading ? t("جارٍ الإضافة…", "Adding…") : t("إضافة المشروع", "Add project")}
      </Button>
    </form>
  )
}
