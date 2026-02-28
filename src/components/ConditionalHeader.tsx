"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Renders SiteHeader on all pages except the home page.
 * The home page uses its own full header (logo + section nav + hamburger) via IndexView.
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return null;
  }

  return <SiteHeader />;
}
