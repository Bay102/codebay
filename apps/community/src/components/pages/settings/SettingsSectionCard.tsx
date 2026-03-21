"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type SettingsSectionCardProps = {
  id?: string;
  /** Short name for screen readers (visible titles live inside `children`). */
  ariaLabel: string;
  children: ReactNode;
  /** When true, body is shown behind a disclosure control; pair with `defaultCollapsed` for initial state. */
  collapsible?: boolean;
  /** Initial collapsed state when `collapsible` is true. */
  defaultCollapsed?: boolean;
};

/** Bordered container for a settings block; add more cards on this page as new prefs ship. */
export function SettingsSectionCard({
  id,
  ariaLabel,
  children,
  collapsible = false,
  defaultCollapsed = false
}: SettingsSectionCardProps) {
  const [collapsed, setCollapsed] = useState(collapsible && defaultCollapsed);
  const contentId = useId();
  const titleId = useId();

  if (!collapsible) {
    return (
      <section id={id} aria-label={ariaLabel} className="mb-8 border border-border/70 bg-card/70 p-5 sm:p-6">
        {children}
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={titleId} className="mb-8 border border-border/70 bg-card/70 p-5 sm:p-6">
      <button
        id={titleId}
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-md py-1 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={!collapsed}
        aria-controls={contentId}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="min-w-0">{ariaLabel}</span>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>
      <div id={contentId} className="mt-4" hidden={collapsed}>
        {children}
      </div>
    </section>
  );
}
