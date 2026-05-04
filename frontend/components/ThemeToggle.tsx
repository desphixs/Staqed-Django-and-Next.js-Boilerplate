// This tells Next.js that this file uses interactive features (like hooks) and must run in the browser.
"use client";

import * as React from "react";
// We import the icons for the Sun and Moon to show which mode is active.
import { Moon, Sun } from "lucide-react";
// useTheme is a hook that lets us talk to the 'ThemeProvider' to see or change the current mode.
import { useTheme } from "next-themes";

export function ThemeToggle() {
  // We extract 'setTheme' (to change it), 'theme' (what the user picked), and 'resolvedTheme' (the actual active color).
  const { setTheme, theme, resolvedTheme } = useTheme();
  
  // This 'mounted' state is a safety check. Servers don't know your theme preferences, only browsers do.
  const [mounted, setMounted] = React.useState(false);
  
  // This runs exactly once when the component first appears on the user's screen.
  // It flips 'mounted' to true, signaling that it's now safe to show the UI.
  React.useEffect(() => setMounted(true), []);

  // If the component hasn't 'mounted' yet, we return an empty box. 
  // This prevents the "Hydration Mismatch" error where the server and browser disagree on what the icon should be.
  if (!mounted) {
    return (
      <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black opacity-50">
      </div>
    );
  }

  // If the theme is set to 'system', we use 'resolvedTheme' (which is what the computer actually chose). 
  // Otherwise, we just use the theme the user explicitly picked (light or dark).
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      // When clicked, if the current theme is dark, we change it to light. If it's light, we change it to dark.
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none"
      aria-label="Toggle theme"
    >
      {/* The Sun icon. It shrinks and rotates out of sight when 'dark mode' is active. */}
      <Sun className="h-4 w-4 transition-all dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
      
      {/* The Moon icon. It is hidden by default and only scales up/rotates into view when 'dark mode' is active. */}
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
    </button>
  );
}