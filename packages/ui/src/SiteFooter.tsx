"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "./utils";

export type SiteFooterLinkItem =
  | { type: "link"; label: string; href: string }
  | { type: "button"; label: string; onClick: () => void };

export type SiteFooterProps = {
  logo: ReactNode;
  legalName: string;
  links: SiteFooterLinkItem[];
  className?: string;
};

export function SiteFooter({ logo, legalName, links, className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 px-6 py-2.5 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
        <nav className="flex items-center justify-center gap-4">
          {links.map((item, index) =>
            item.type === "link" ? (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={item.onClick}
                className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center justify-center gap-2">
          {logo}
          <span className="text-[10px] text-muted-foreground">
            &copy; {year} {legalName}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
