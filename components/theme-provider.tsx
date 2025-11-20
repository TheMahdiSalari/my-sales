"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// تغییر: استفاده از ComponentProps برای جلوگیری از ارور تایپ
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}