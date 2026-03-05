"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarNavMenu } from "./SidebarNavMenu";
import type { SidebarNavMenuItem } from "./SidebarNavMenu";

export type AppHeaderMenuItem = SidebarNavMenuItem;

export type AppHeaderProps = {
  /** Where the logo links to (e.g. "/" or main site in sub-apps). */
  homeHref: string;
  /** Logo content (e.g. <Image src={logo} alt="CodeBay" />). */
  logo: ReactNode;
  /** Menu items shown in the sidebar. Use type "link", "button", or "group" with children for subsections. */
  menuItems: AppHeaderMenuItem[];
  /** Side the menu sheet slides in from. Default "right". */
  menuSide?: "left" | "right";
};

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function AppHeader({ homeHref, logo, menuItems, menuSide = "right" }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 px-4 py-4 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href={homeHref}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {logo}
        </Link>

        <button
          type="button"
          aria-label="Open header menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/60 text-foreground transition-colors hover:bg-secondary/70"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </div>

      <SidebarNavMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={menuItems}
        side={menuSide}
      />
    </header>
  );
}
