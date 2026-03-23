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
  /** Optional content at the bottom of the menu sheet (e.g. theme controller). */
  menuFooter?: ReactNode;
  /** Whether to show a small unread notifications badge on the menu trigger. */
  hasNotifications?: boolean;
  /** Optional notifications shortcut destination (e.g. "/dashboard#activity"). */
  notificationHref?: string;
  /** Accessible label for the notifications shortcut button. */
  notificationAriaLabel?: string;
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

export function AppHeader({
  homeHref,
  logo,
  menuItems,
  menuSide = "right",
  menuFooter,
  hasNotifications = false,
  notificationHref,
  notificationAriaLabel = "View notifications"
}: AppHeaderProps) {
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

        <div className="flex items-center gap-2">
          {notificationHref ? (
            <Link
              href={notificationHref}
              aria-label={notificationAriaLabel}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-background/60 text-foreground transition-colors hover:bg-secondary/70"
            >
              {hasNotifications ? (
                <span
                  aria-hidden
                  className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background"
                />
              ) : null}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.674C19.41 13.956 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.411 5.956-2.738 7.326" />
              </svg>
            </Link>
          ) : null}
          <button
            type="button"
            aria-label="Open header menu"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-background/60 text-foreground transition-colors hover:bg-secondary/70"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <SidebarNavMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={menuItems}
        side={menuSide}
        className="border-primary/30"
        footer={menuFooter}
      />
    </header>
  );
}
