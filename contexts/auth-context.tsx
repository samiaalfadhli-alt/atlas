"use client"

import * as React from "react"

import type { SessionUser } from "@/lib/types"

type AuthState = {
  user: (SessionUser & { companyStatus?: string | null }) | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthState["user"]>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as {
        user: (SessionUser & { companyStatus?: string | null }) | null
      }
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- جلب بيانات الجلسة عند التحميل؛ تحديث الحالة يتم بعد await وليس بشكل متزامن
    void refresh()
  }, [refresh])

  const value = React.useMemo(
    () => ({ user, loading, refresh, logout }),
    [loading, logout, refresh, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.use(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
