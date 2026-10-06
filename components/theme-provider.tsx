"use client"

import * as React from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light")

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light")
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme)
    setThemeState(nextTheme)
    try {
      localStorage.setItem("theme", nextTheme)
    } catch {}
  }, [])

  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== "theme" || (event.newValue !== "light" && event.newValue !== "dark")) {
        return
      }
      applyTheme(event.newValue)
      setThemeState(event.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [setTheme, theme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

export { ThemeProvider, useTheme }
