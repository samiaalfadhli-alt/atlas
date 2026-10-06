"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"

export function AdSenseSlotRow({
  id,
  name,
  location,
  enabled,
}: {
  id: string
  name: string
  location: string
  enabled: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [on, setOn] = React.useState(enabled)
  const [loading, setLoading] = React.useState(false)

  async function toggle(value: boolean) {
    setOn(value)
    setLoading(true)
    try {
      const res = await fetch(`/api/adsense/slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: value }),
      })
      if (!res.ok) {
        setOn(!value)
        toast.error(t("تعذّر التحديث", "Could not update"))
        return
      }
      toast.success(value ? t("تم التفعيل", "Enabled") : t("تم الإيقاف", "Disabled"))
      router.refresh()
    } catch {
      setOn(!value)
      toast.error(t("تعذّر التحديث", "Could not update"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{location}</p>
      </div>
      <div className="flex items-center gap-2">
        {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        <Switch checked={on} onCheckedChange={toggle} />
      </div>
    </div>
  )
}

export function AdSenseSlotAdder() {
  const { t } = useLanguage()
  const router = useRouter()
  const [location, setLocation] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function add() {
    if (location.trim().length < 2) {
      toast.error(t("اكتب اسم الموضع", "Enter a location name"))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/adsense/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: location.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || t("تعذّر الإضافة", "Could not add"))
        return
      }
      toast.success(t("تمت إضافة الموضع", "Slot added"))
      setLocation("")
      router.refresh()
    } catch {
      toast.error(t("تعذّر الإضافة", "Could not add"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder={t("موضع مخصص…", "Custom location…")}
        className="h-10"
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <Button onClick={add} disabled={loading} variant="outline">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {t("إضافة", "Add")}
      </Button>
    </div>
  )
}
