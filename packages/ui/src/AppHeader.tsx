"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export type AppHeaderMenuItem =
  | { type: "link"; href: string; label: string }
  | { type: "button"; label: string; onSelect: () => void };

export type AppHeaderProps = {
  /** Where the logo links to (e.g. "/" or main site in sub-apps). */
  homeHref: string;
  /** Logo content (e.g. <Image src={logo} alt="CodeBay" />). */
  logo: ReactNode;
  /** Menu items shown in the hamburger dropdown. Links open in same tab; buttons call onSelect. */
  menuItems: AppHeaderMenuItem[];
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

export function AppHeader({ homeHref, logo, menuItems }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 px-4 py-4 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href={homeHref}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {logo}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open header menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/60 text-foreground transition-colors hover:bg-secondary/70"
            >
              <MenuIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {menuItems.map((item, index) =>
              item.type === "link" ? (
                <DropdownMenuItem key={`${item.href}-${index}`} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={`${item.label}-${index}`}
                  onSelect={(e) => {
                    e.preventDefault();
                    item.onSelect();
                  }}
                >
                  {item.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
