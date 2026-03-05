"use client";

import { useMemo } from "react";
import { AppHeader as SharedAppHeader, CodeBayLogo } from "@codebay/ui";
import type { AppHeaderMenuItem } from "@codebay/ui";
import { useAuth } from "@/contexts/AuthContext";
import { blogUrl, communityUrl, siteUrl } from "@/lib/site-urls";

function getMenuItems(myBlogHref: string): AppHeaderMenuItem[] {
  return [
    { type: "link", href: "/", label: "Home" },
    {
      type: "group",
      label: "Community",
      children: [{ type: "link", href: "/dashboard", label: "My Dashboard" }],
    },
    {
      type: "group",
      label: "Discussions",
      children: [
        { type: "link", href: "/discussions", label: "All Discussions" },
        { type: "link", href: "/discussions/new", label: "New Discussion" },
      ],
    },
    {
      type: "group",
      label: "Blog",
      children: [
        { type: "link", href: "/dashboard/blog", label: "Blog dashboard" },
        { type: "link", href: myBlogHref, label: "My Blog" },
        { type: "link", href: "/dashboard/blog/new", label: "New Blog Post" },
        { type: "link", href: blogUrl, label: "CodingBay Blog" },
      ],
    },
  ];
}

export function CommunityAppHeader() {
  const { user } = useAuth();
  const username =
    typeof user?.user_metadata?.username === "string"
      ? user.user_metadata.username.trim()
      : null;
  const myBlogHref = username ? `${blogUrl}/${username}` : blogUrl;
  const menuItems = useMemo(() => getMenuItems(myBlogHref), [myBlogHref]);

  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
    />
  );
}
