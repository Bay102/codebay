import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";
import { CodeBayThemeProvider } from "@codebay/theme/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CommunityAppHeader } from "@/components/AppHeader";
import { siteUrl } from "@/lib/site-urls";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hero",
  display: "swap"
});

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
    <html lang="en" suppressHydrationWarning className={ibmPlexSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k="codebay-primary-color";var v=localStorage.getItem(k);var allowed=["orange","blue","red","green","yellow","purple"];if(v&&allowed.indexOf(v)!==-1){document.documentElement.setAttribute("data-primary",v);}})();`
          }}
        />
      </head>
      <body>
        <CodeBayThemeProvider storageKey="codebay-theme-community">
          <AuthProvider>
            <CommunityAppHeader />
            {children}
          </AuthProvider>
        </CodeBayThemeProvider>
      </body>
    </html>
  );
}
