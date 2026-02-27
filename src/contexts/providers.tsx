"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConnectFormProvider } from "@/contexts/ConnectFormContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="codebay-theme">
      <AuthProvider>
        <ConnectFormProvider>{children}</ConnectFormProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
