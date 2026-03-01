"use client";

import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { mainUrl, communityUrl } from "@/lib/site-urls";

const menuItems: AppHeaderMenuItem[] = [
  { type: "link", href: mainUrl, label: "CodeBay" },
  { type: "link", href: communityUrl, label: "Community" },
];

export function BlogAppHeader() {
  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-8 w-auto dark:invert md:h-10" />}
      menuItems={menuItems}
    />
  );
}
