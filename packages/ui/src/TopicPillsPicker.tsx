"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";
import { Tag } from "./Tag";

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
      className={cn("flex flex-wrap gap-2 pb-1", className)}
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
              "shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-70"
            )}
            aria-pressed={isSelected}
          >
            <Tag
              variant="pill"
              size="lg"
              className={cn(
                isSelected && "text-primary"
              )}
            >
              {renderLabel ? renderLabel(option, isSelected) : option.label}
            </Tag>
          </button>
        );
      })}
    </div>
  );
}

