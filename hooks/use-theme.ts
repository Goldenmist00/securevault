"use client"

import { useEffect, useState } from "react"
import { getStoredTheme, setStoredTheme, applyTheme, type Theme } from "@/lib/theme"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"
    const stored = getStoredTheme()
    return stored === "system" ? "light" : stored // Simplified for now, can add system support later
  })

  useEffect(() => {
    applyTheme(theme)
    setStoredTheme(theme)
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  }
}
