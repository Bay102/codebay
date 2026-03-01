"use client";

import type { ReactNode } from "react";
import { CodeBayThemeProvider } from "@codebay/theme/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConnectFormProvider } from "@/contexts/ConnectFormContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <CodeBayThemeProvider storageKey="codebay-theme-main">
      <AuthProvider>
        <ConnectFormProvider>{children}</ConnectFormProvider>
      </AuthProvider>
    </CodeBayThemeProvider>
  );
}
