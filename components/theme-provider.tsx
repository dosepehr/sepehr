"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Daylight by default, with a calm dark theme the visitor can switch to
// (see ThemeToggle). There is intentionally no keyboard shortcut for it:
// games and the arcade room use letter keys (WASD).
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
