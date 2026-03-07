"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./DropdownMenu";
import { cn } from "./utils";

export interface FilterDropdownOption {
  id: string;
  label: string;
}

export interface FilterDropdownProps {
  /** Label shown on the trigger button (e.g. "Filter by topic"). */
  label: string;
  /** Options to show in the dropdown. */
  options: FilterDropdownOption[];
  /** Currently selected value: the option's `label`, or `null` for "All". */
  value: string | null;
  /** Called when the user selects an option. Pass `null` when "All" is selected. */
  onSelect: (value: string | null) => void;
  /** Label for the clear-all option. Defaults to "All". */
  allLabel?: string;
  /** Optional class name for the trigger button. */
  triggerClassName?: string;
  /** Optional class name for the dropdown content. */
  contentClassName?: string;
  /** Trigger button variant. */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Trigger button size. */
  size?: "default" | "sm" | "lg" | "icon";
  /** When true, the dropdown is not rendered (e.g. when options are empty). */
  hidden?: boolean;
}

/**
 * Reusable filter dropdown: a button that opens a list of options plus an "All" option.
 * Selection is single-value; the selected option's `label` is used as the value.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onSelect,
  allLabel = "All",
  triggerClassName,
  contentClassName,
  variant = "outline",
  size = "sm",
  hidden = false
}: FilterDropdownProps) {
  if (hidden) {
    return null;
  }

  const handleClear = () => onSelect(null);
  const handleSelect = (optionLabel: string) =>
    onSelect(value === optionLabel ? null : optionLabel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-1.5", triggerClassName)}
          aria-haspopup="listbox"
          aria-expanded={undefined}
          aria-label={value ? `${label}: ${value}` : label}
        >
          {label}
          {value ? (
            <span className="font-medium text-primary">: {value}</span>
          ) : null}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        role="listbox"
        className={cn(
          "max-h-[min(20rem,70vh)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          contentClassName
        )}
      >
        <DropdownMenuItem
          onClick={handleClear}
          role="option"
          aria-selected={!value}
          className={!value ? "bg-accent font-medium" : undefined}
        >
          {allLabel}
        </DropdownMenuItem>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => handleSelect(opt.label)}
            role="option"
            aria-selected={value === opt.label}
            className={value === opt.label ? "bg-accent font-medium" : undefined}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
