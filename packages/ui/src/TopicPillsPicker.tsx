"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

export type TopicPillOption = {
  /** Stable key for this option (id or name). */
  key: string;
  /** Human-readable label to render. */
  label: string;
};

export interface TopicPillsPickerProps {
  options: TopicPillOption[];
  /** Keys of the currently selected options. */
  selectedKeys: string[];
  /** Called with the next selected keys after a toggle. */
  onChange: (nextSelectedKeys: string[]) => void;
  /** Optional aria-label for the group. */
  ariaLabel?: string;
  /** Disable all interactions. */
  disabled?: boolean;
  /** Optional wrapper className to adjust layout. */
  className?: string;
  /** Optional render function to customize pill content. */
  renderLabel?: (option: TopicPillOption, isSelected: boolean) => ReactNode;
}

export function TopicPillsPicker({
  options,
  selectedKeys,
  onChange,
  ariaLabel,
  disabled = false,
  className,
  renderLabel
}: TopicPillsPickerProps) {
  const selectedSet = new Set(selectedKeys);

  const handleToggle = (key: string) => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange([...next]);
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // Horizontal scroller on small screens, wraps on larger screens.
        "flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap",
        // Hide scrollbars while still allowing scroll.
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = selectedSet.has(option.key);
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => handleToggle(option.key)}
            disabled={disabled}
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors sm:text-sm disabled:opacity-70",
              isSelected
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/70 bg-background text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
            aria-pressed={isSelected}
          >
            {renderLabel ? renderLabel(option, isSelected) : option.label}
          </button>
        );
      })}
    </div>
  );
}

