"use client";

import { MessageSquareText, Rss } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@codebay/ui";
import type { ExploreContentType } from "@/lib/explore";

type ContentTypeOption = {
  value: ExploreContentType;
  label: string;
  Icon: LucideIcon;
};

/** Single source of truth for explore feed modes — add entries here when new types ship. */
export const EXPLORE_CONTENT_TYPE_OPTIONS: readonly ContentTypeOption[] = [
  { value: "discussions", label: "Discussions", Icon: MessageSquareText },
  { value: "blogs", label: "Blog posts", Icon: Rss }
] as const;

export type ExploreContentTypeSegmentProps = {
  value: ExploreContentType;
  onChange: (next: ExploreContentType) => void;
  disabled?: boolean;
};

export function ExploreContentTypeSegment({ value, onChange, disabled }: ExploreContentTypeSegmentProps) {
  const groupId = "explore-content-type";

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-2 block px-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Content type
      </legend>
      <div className="inline-flex max-w-full rounded-xl border border-border/60 bg-muted/35 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
        {EXPLORE_CONTENT_TYPE_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          const inputId = `${groupId}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={inputId}
              className={cn(
                "relative flex min-h-[2.5rem] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background sm:min-w-[7.5rem] sm:flex-none",
                selected
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={groupId}
                value={opt.value}
                checked={selected}
                disabled={disabled}
                onChange={() => {
                  if (opt.value !== value) onChange(opt.value);
                }}
                className="peer sr-only"
              />
              <opt.Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-opacity",
                  selected ? "text-primary opacity-100" : "opacity-60"
                )}
                aria-hidden
              />
              <span className="truncate">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
