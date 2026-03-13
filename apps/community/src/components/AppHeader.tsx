"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppHeader as SharedAppHeader, CodeBayLogo, MenuThemeController } from "@codebay/ui";
import type {
  AppHeaderMenuItem,
  SidebarNavItemButton,
  SidebarNavItemLink,
} from "@codebay/ui";
import { useAuth } from "@/contexts/AuthContext";
import { blogUrl, communityUrl, siteUrl } from "@/lib/site-urls";

function getMenuItems(
  myBlogHref: string,
  myProfileHref: string,
  isAuthenticated: boolean,
  onSignOut: () => void
): AppHeaderMenuItem[] {
  const primaryItems: AppHeaderMenuItem[] = [
    { type: "link", href: "/", label: "Home" },
    ...(isAuthenticated ? [{ type: "link", href: "/dashboard", label: "My Dashboard" } satisfies AppHeaderMenuItem] : []),
  ];

  const discussionChildren: SidebarNavItemLink[] = [
    { type: "link", href: "/discussions", label: "All Discussions" },
    ...(isAuthenticated
      ? [{ type: "link", href: "/dashboard/discussions/new", label: "New Discussion" }]
      : []),
  ];

  const accountChildren: Array<SidebarNavItemLink | SidebarNavItemButton> = isAuthenticated
    ? [
      { type: "link", href: myProfileHref, label: "My Profile" },
      { type: "link", href: "/account/settings", label: "Settings" },
      { type: "button", label: "Sign out", onSelect: onSignOut },
    ]
    : [{ type: "link", href: "/join?mode=signin", label: "Sign in" }];

  const blogChildren: SidebarNavItemLink[] = isAuthenticated
    ? [
      { type: "link", href: "/dashboard/blog", label: "Blog Dashboard" },
      { type: "link", href: myBlogHref, label: "My Blog" },
      { type: "link", href: "/dashboard/blog/new", label: "New Blog Post" },
      { type: "link", href: blogUrl, label: "CodingBay Blog" },
    ]
    : [{ type: "link", href: blogUrl, label: "CodingBay Blog" }];

  return [
    ...primaryItems,
    {
      type: "group",
      label: "Discussions",
      children: discussionChildren,
    },
    {
      type: "group",
      label: "Blog",
      children: blogChildren,
    },
    {
      type: "group",
      label: "Account",
      children: accountChildren,
    },
  ];
}

export function CommunityAppHeader() {
  const router = useRouter();
  const { user, supabase } = useAuth();

  const handleSignOut = useCallback(async () => {
    if (!supabase) {
      router.push("/");
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router, supabase]);

  const username =
    typeof user?.user_metadata?.username === "string"
      ? user.user_metadata.username.trim()
      : null;

  const myBlogHref = username ? `${blogUrl}/${username}` : blogUrl;
  const myProfileHref = username ? `/${username}` : siteUrl;
  const isAuthenticated = Boolean(user);

  const menuItems = useMemo(
    () => getMenuItems(myBlogHref, myProfileHref, isAuthenticated, handleSignOut),
    [myBlogHref, myProfileHref, isAuthenticated, handleSignOut]
  );

  return (
    <SharedAppHeader
      homeHref="/"
      logo={<CodeBayLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
      menuFooter={<MenuThemeController />}
    />
  );
}
