import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CodeBayThemeProvider } from "@codebay/theme/theme-provider";
import { BlogAppHeader } from "@/components/AppHeader";
import { siteUrl } from "@/lib/site-urls";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodingBay Blog",
  description: "Technical writing and engineering insights from the CodeBay team.",
  metadataBase: new URL(siteUrl)
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CodeBayThemeProvider storageKey="codebay-theme-blog">
          <BlogAppHeader />
          {children}
        </CodeBayThemeProvider>
      </body>
    </html>
  );
}
