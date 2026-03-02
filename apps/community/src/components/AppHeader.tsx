"use client";

import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { blogUrl, mainUrl } from "@/lib/site-urls";

const menuItems: AppHeaderMenuItem[] = [
  { type: "link", href: blogUrl, label: "Blog" },
  { type: "link", href: "/dashboard", label: "Dashboard" },
];

export function CommunityAppHeader() {
  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
    />
  );
}
