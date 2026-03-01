import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "../contexts/providers";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { siteUrl } from "@/lib/site-urls";
import "../index.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CodeBay | AI-Powered Software Development Agency",
    template: "%s | CodeBay",
  },
  description:
    "CodeBay builds professional-grade software using AI, delivering weeks of work in days. Fast, reliable, and built to scale.",
  applicationName: "CodeBay",
  authors: [{ name: "CodeBay" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "CodeBay | AI-Powered Software Development Agency",
    description:
      "CodeBay builds professional-grade software using AI, delivering weeks of work in days. Fast, reliable, and built to scale.",
    siteName: "CodeBay",
    locale: "en_US",
    images: [{ url: "/codebay.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ConditionalHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
