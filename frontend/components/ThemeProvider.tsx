// Again, this must be a client component because it manages the state of the theme in the browser.
"use client";

import * as React from "react";
// We import the original provider from the 'next-themes' library but rename it to avoid confusion.
import { ThemeProvider as NextThemesProvider } from "next-themes";

// We define our own ThemeProvider that accepts 'children' (the rest of your app) and 'props' (settings).
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  // We return the original provider and "spread" all the settings (like defaultTheme="system") onto it.
  // The {children} part means everything inside this wrapper will have access to the theme logic.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}