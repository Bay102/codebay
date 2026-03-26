"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "./utils";
import { Sheet, SheetContent, SheetTitle } from "./sheet";

/** Single link in the sidebar nav. */
export type SidebarNavItemLink = {
  type: "link";
  href: string;
  label: string;
};

/** Action button (e.g. "Sign out", "Inquire") that runs a callback. */
export type SidebarNavItemButton = {
  type: "button";
  label: string;
  onSelect: () => void;
};

/** Group with a label and nested links/buttons (expandable subsection). */
export type SidebarNavItemGroup = {
  type: "group";
  label: string;
  children: Array<SidebarNavItemLink | SidebarNavItemButton>;
};

export type SidebarNavMenuItem = SidebarNavItemLink | SidebarNavItemButton | SidebarNavItemGroup;

function isGroup(item: SidebarNavMenuItem): item is SidebarNavItemGroup {
  return item.type === "group";
}

export type SidebarNavMenuProps = {
  /** Controlled open state. */
  open: boolean;
  /** Called when open state should change (e.g. overlay click or link click). */
  onOpenChange: (open: boolean) => void;
  /** Nav items: links, buttons, or groups with nested items. */
  items: SidebarNavMenuItem[];
  /** Side the sheet slides in from. */
  side?: "left" | "right";
  /** Optional title shown at the top of the sheet. */
  title?: string;
  /** Optional class name for the sheet content. */
  className?: string;
  /** Optional content rendered at the bottom of the menu (e.g. theme controller). */
  footer?: React.ReactNode;
};

function NavGroup({
  group,
  onClose,
  onItemSelect,
}: {
  group: SidebarNavItemGroup;
  onClose: () => void;
  onItemSelect?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleItemSelect = () => {
    onItemSelect?.();
    onClose();
  };

  return (
    <div className="border-b border-border/70 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 rounded-none px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
        aria-expanded={expanded}
      >
        <span>{group.label}</span>
        <span className="flex shrink-0 text-muted-foreground transition-transform duration-200 ease-out" aria-hidden>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-0.5 pl-2" aria-label={group.label}>
            {group.children.map((child, index) => {
              if (child.type === "link") {
                const href = child.href;
                const hasValidHref = typeof href === "string" && href.length > 0;

                // Guard against undefined/empty href at runtime.
                if (!hasValidHref) {
                  return (
                    <button
                      key={`${child.label}-${index}`}
                      type="button"
                      onClick={handleItemSelect}
                      className="rounded-none px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                    >
                      {child.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={`${href}-${index}`}
                    href={href}
                    onClick={handleItemSelect}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                );
              }

              return (
                <button
                  key={`${child.label}-${index}`}
                  type="button"
                  onClick={() => {
                    child.onSelect();
                    handleItemSelect();
                  }}
                  className="rounded-none px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  {child.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function SidebarNavMenu({
  open,
  onOpenChange,
  items,
  side = "right",
  title,
  className,
  footer,
}: SidebarNavMenuProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex w-full flex-col gap-0 p-0 w-3/5 sm:max-w-[20%]",
          "data-[state=closed]:duration-1000 data-[state=open]:duration-1000",
          className
        )}
      >
        {title ? (
          <div className="border-b border-border/60 px-5 py-4">
            <SheetTitle className="text-lg font-semibold text-foreground">{title}</SheetTitle>
          </div>
        ) : (
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        )}
        <nav className="flex flex-1 flex-col gap-0 overflow-y-auto px-4 py-4" aria-label="Main navigation">
          {items.map((item, index) => {
            if (isGroup(item)) {
              return (
                <NavGroup
                  key={`${item.label}-${index}`}
                  group={item}
                  onClose={handleClose}
                  onItemSelect={handleClose}
                />
              );
            }
            if (item.type === "link") {
              return (
                <Link
                  key={`${item.href}-${index}`}
                  href={item.href}
                  onClick={handleClose}
                  className="rounded-none px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={() => {
                  item.onSelect();
                  handleClose();
                }}
                className="rounded-none px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        {footer ? (
          <div className="shrink-0 border-t border-border/60 px-4 py-4">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
