"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// The arcade is dark-only. The old `d` hotkey that toggled the theme was
// removed because it fired during games (WASD).
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="dark"
      defaultTheme="dark"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
