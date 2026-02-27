"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ConnectFormProvider } from "@/contexts/ConnectFormContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="codebay-theme">
      <ConnectFormProvider>{children}</ConnectFormProvider>
    </ThemeProvider>
  );
}
