import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CodeBayThemeProvider } from "@codebay/theme/theme-provider";
import { BlogAppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/contexts/AuthContext";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k="codebay-primary-color";var v=null;var cs=document.cookie.split(";");for(var i=0;i<cs.length;i++){var p=cs[i].trim().split("=");if(p[0]===k&&p[1]){v=p[1];break;}}if(!v)v=localStorage.getItem(k);var allowed=["orange","blue","red","green","yellow","purple"];if(v&&allowed.indexOf(v)!==-1)document.documentElement.setAttribute("data-primary",v);})();`
          }}
        />
      </head>
      <body>
        <CodeBayThemeProvider storageKey="codebay-theme-blog">
          <AuthProvider>
            <BlogAppHeader />
            {children}
          </AuthProvider>
        </CodeBayThemeProvider>
      </body>
    </html>
  );
}
