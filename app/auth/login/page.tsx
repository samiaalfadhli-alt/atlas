"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { KeyRound, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandLogo } from "@/components/brand-logo"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const { t } = useLanguage()
  const { refresh } = useAuth()
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("تعذّر تسجيل الدخول", "Could not sign in"))
        return
      }
      await refresh()
      toast.success(t("تم تسجيل الدخول", "Signed in"))
      const next = new URLSearchParams(window.location.search).get("next")
      const role = data.user?.role
      const staff = role === "admin" || role === "content-manager" || role === "ads-manager"
      if (staff) router.push(next || "/admin")
      else router.push(next || "/dashboard")
      router.refresh()
    } catch {
      setError(t("تعذّر تسجيل الدخول", "Could not sign in"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo height={56} className="mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ادخل إلى لوحة التحكم لإدارة ملف شركتك وأعمالك
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              dir="ltr"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="h-10 w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {loading ? "جارٍ الدخول…" : "دخول"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">
              سجّل شركتك الآن
            </Link>
          </p>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          دخول آمن — بياناتك محمية على أطلس المنزل
        </p>
      </div>
    </main>
  )
}
