import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "CodeBay",
  description: "CodeBay website and admin dashboard",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
