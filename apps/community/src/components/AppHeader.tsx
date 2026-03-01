"use client";

import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { blogUrl, mainUrl } from "@/lib/site-urls";

const menuItems: AppHeaderMenuItem[] = [
  { type: "link", href: mainUrl, label: "CodeBay" },
  { type: "link", href: blogUrl, label: "Blog" },
];

export function CommunityAppHeader() {
  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-8 w-auto dark:invert md:h-10" />}
      menuItems={menuItems}
    />
  );
}
