"use client";

import Image from "next/image";
import { useMemo } from "react";
import codebayLogo from "@/assets/codebay-logo.svg";
import { AppHeader, type AppHeaderMenuItem } from "@codebay/ui";
import { useConnectForm } from "@/contexts/ConnectFormContext";
import { useAuth } from "@/contexts/AuthContext";
import { blogUrl, communityUrl } from "@/lib/site-urls";

export function SiteHeader() {
  const { openConnectForm } = useConnectForm();
  const { session } = useAuth();

  const menuItems = useMemo<AppHeaderMenuItem[]>(() => {
    const items: AppHeaderMenuItem[] = [
      { type: "link", href: blogUrl, label: "Blog" },
      { type: "link", href: communityUrl, label: "Community" },
      { type: "button", label: "Inquire", onSelect: openConnectForm },
    ];
    if (session) {
      items.push({ type: "link", href: `${communityUrl}/dashboard`, label: "Dashboard" });
    } else {
      items.push({ type: "link", href: `${communityUrl}/join`, label: "Account" });
    }
    return items;
  }, [session, openConnectForm]);

  return (
    <AppHeader
      homeHref="/"
      logo={
        <Image
          src={codebayLogo}
          alt="CodeBay"
          width={160}
          height={40}
          className="h-8 w-auto dark:invert md:h-10"
        />
      }
      menuItems={menuItems}
    />
  );
}
