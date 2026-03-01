"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export type ThemePreference = "light" | "dark" | "system";

export type CodeBayThemeProviderProps = {
  children: ReactNode;
  storageKey?: string;
  defaultTheme?: ThemePreference;
};

export function CodeBayThemeProvider({
  children,
  storageKey = "codebay-theme",
  defaultTheme = "system"
}: CodeBayThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
