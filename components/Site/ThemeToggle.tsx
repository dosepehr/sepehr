"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useDictionary } from "@/components/DictionaryProvider"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { cn } from "@/lib/funcs/cn"

/** Two-state light/dark switch. Light is the default; the choice persists. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { dict } = useDictionary()
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const dark = hydrated && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? dict.hud.themeToLight : dict.hud.themeToDark}
      title={dark ? dict.hud.themeToLight : dict.hud.themeToDark}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
