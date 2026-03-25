"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";
import { AppHeader as SharedAppHeader, MenuThemeController, SiteLogo } from "@codebay/ui";
import type { AppHeaderMenuItem, SidebarNavItemButton, SidebarNavItemLink } from "@codebay/ui";
import { useAuth } from "@/contexts/AuthContext";

function getMenuItems(
  myBlogHref: string,
  myProfileHref: string,
  isAuthenticated: boolean,
  onSignOut: () => void
): AppHeaderMenuItem[] {
  const primaryItems: AppHeaderMenuItem[] = [
    { type: "link", href: "/", label: "Home" },
    ...(isAuthenticated ? [{ type: "link", href: "/dashboard", label: "Dashboard" } satisfies AppHeaderMenuItem] : []),
    { type: "link", href: "/explore", label: "Explore" },
    { type: "link", href: "/about", label: "About" },
  ];

  const discussionChildren: SidebarNavItemLink[] = [
    ...(isAuthenticated
      ? [
        { type: "link", href: "/dashboard/discussions", label: "Manage Discussions" } satisfies SidebarNavItemLink,
        { type: "link", href: "/dashboard/discussions/new", label: "New Discussion" } satisfies SidebarNavItemLink,
      ]
      : []),
  ];

  const accountChildren: Array<SidebarNavItemLink | SidebarNavItemButton> = isAuthenticated
    ? [
      { type: "link", href: myProfileHref, label: "My Profile" },
      { type: "link", href: "/dashboard/profile", label: "Edit profile" },
      { type: "link", href: "/settings", label: "Settings" },
      { type: "button", label: "Sign Out", onSelect: onSignOut },
    ]
    : [{ type: "link", href: "/join?mode=signin", label: "Sign in" }];

  const blogChildren: SidebarNavItemLink[] = isAuthenticated
    ? [
      { type: "link", href: myBlogHref, label: "My Blog" },
      { type: "link", href: "/dashboard/blog", label: "Manage Blog" },
      { type: "link", href: "/dashboard/blog/new", label: "New Blog Post" },
      // { type: "link", href: "/blog", label: "CodingBay Blog" },
    ]
    : [{ type: "link", href: "/blog", label: "CodingBay Blog" }];

  const searchGroup: AppHeaderMenuItem = {
    type: "group",
    label: "Search",
    children: [
      { type: "link", href: "/blogs", label: "Blogs" },
      { type: "link", href: "/discussions", label: "Discussions" },
    ],
  };

  const discussionsGroup: AppHeaderMenuItem = {
    type: "group",
    label: "My Discussions",
    children: discussionChildren,
  };

  return [
    ...primaryItems,
    searchGroup,
    ...(discussionChildren.length > 0 ? [discussionsGroup] : []),
    {
      type: "group",
      label: "My Blog",
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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

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

  const myBlogHref = username ? `/blog/${username}` : "/blog";
  const myProfileHref = username ? `/${username}` : "/";
  const isAuthenticated = Boolean(user);
  const notificationHref = isAuthenticated ? "/dashboard" : undefined;

  const handleNotificationClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((event) => {
    if (event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    window.dispatchEvent(new Event("dashboard:open-notifications"));
  }, []);

  const menuItems = useMemo(
    () => getMenuItems(myBlogHref, myProfileHref, isAuthenticated, handleSignOut),
    [myBlogHref, myProfileHref, isAuthenticated, handleSignOut]
  );

  useEffect(() => {
    let active = true;

    async function loadUnreadStatus() {
      if (!user) {
        if (active) {
          setHasUnreadNotifications(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/notifications/unread", { method: "GET" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { hasUnread?: boolean };
        if (active) {
          setHasUnreadNotifications(Boolean(payload.hasUnread));
        }
      } catch {
        // Fail silently in header chrome; the badge is an enhancement.
      }
    }

    loadUnreadStatus();

    const refreshUnread = () => {
      void loadUnreadStatus();
    };
    window.addEventListener("community:notifications-unread-refresh", refreshUnread);
    return () => {
      active = false;
      window.removeEventListener("community:notifications-unread-refresh", refreshUnread);
    };
  }, [user]);

  return (
    <SharedAppHeader
      homeHref="/"
      logo={<SiteLogo className="h-6 w-auto md:h-8" />}
      menuItems={menuItems}
      toolbarLinks={[{ href: "/explore", label: "Explore" }]}
      menuFooter={<MenuThemeController />}
      hasNotifications={hasUnreadNotifications}
      notificationHref={notificationHref}
      notificationAriaLabel="Open notifications"
      onNotificationClick={handleNotificationClick}
    />
  );
}
