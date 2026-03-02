"use client";

import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { mainUrl, communityUrl } from "@/lib/site-urls";

const menuItems: AppHeaderMenuItem[] = [
  { type: "link", href: communityUrl, label: "Community" },
  { type: "link", href: `${communityUrl}/dashboard`, label: "Dashboard" },
  { type: "link", href: mainUrl, label: "CodeBay" }
];

export function BlogAppHeader() {
  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
    />
  );
}
