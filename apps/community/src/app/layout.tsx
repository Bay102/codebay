import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CommunityAppHeader } from "@/components/AppHeader";
import { siteUrl } from "@/lib/site-urls";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodingBay Community",
  description: "The official CodingBay community platform.",
  metadataBase: new URL(siteUrl)
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <CommunityAppHeader />
        {children}
      </body>
    </html>
  );
}
