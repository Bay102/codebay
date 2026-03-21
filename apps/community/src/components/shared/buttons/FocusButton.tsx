import Link from "next/link";
import type React from "react";

import { cn } from "@codebay/ui";

type FocusButtonBorderVariant = "borderless" | "bordered";
type FocusButtonRadiusVariant = "pill" | "square" | "md" | "small";
type FocusButtonColorVariant = "plain" | "primary";
type FocusButtonSizeVariant = "xs" | "sm" | "md" | "lg";
type FocusButtonGlassVariant = "glass" | "off";

type FocusButtonBaseProps = {
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
  title?: string;
  disabled?: boolean;
  /** For disclosure-style controls (native button only). */
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  /** Render an icon inside the button (e.g. lucide icon). */
  icon?: React.ReactNode;
  /** When true, renders icon-only (text/children are ignored). */
  iconOnly?: boolean;
  /**
   * Visual border style.
   * - `borderless` keeps the original look.
   * - `bordered` adds a more visible border.
   */
  borderVariant?: FocusButtonBorderVariant;
  /** Controls the button rounding. */
  radiusVariant?: FocusButtonRadiusVariant;
  /** Controls the color tint. */
  colorVariant?: FocusButtonColorVariant;
  /** Controls height/padding/font sizing. */
  sizeVariant?: FocusButtonSizeVariant;
  /**
   * Controls whether the hover "glass" overlay (blurred highlight) is shown.
   * - `glass` = enabled (default)
   * - `off` = disable overlay, keep a subtle hover effect
   */
  glassVariant?: FocusButtonGlassVariant;
  /** Click handler. */
  onClick?: () => void;
};

type FocusButtonSubmitProps = FocusButtonBaseProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
};

type FocusButtonLinkProps = FocusButtonBaseProps & {
  href: string;
  type?: never;
};

export type FocusButtonProps = FocusButtonSubmitProps | FocusButtonLinkProps;

export function FocusButton(props: FocusButtonProps) {
  const {
    children,
    className,
    disabled,
    title,
    "aria-label": ariaLabel,
    "aria-expanded": ariaExpanded,
    "aria-controls": ariaControls,
    icon,
    iconOnly = false,
    borderVariant = "borderless",
    radiusVariant = "md",
    colorVariant = "plain",
    sizeVariant = "md",
    glassVariant = "glass",
    onClick,
  } = props;

  const dataAttrs = {
    "data-border-variant": borderVariant,
    "data-radius-variant": radiusVariant,
    "data-color-variant": colorVariant,
    "data-size-variant": sizeVariant,
    "data-glass-variant": glassVariant,
    "data-icon-only": iconOnly ? "true" : undefined,
  } as const;

  const finalAriaLabel = ariaLabel ?? (iconOnly ? title : undefined);

  const content = iconOnly
    ? icon
    : icon
      ? (
        <>
          {icon}
          {children}
        </>
      )
      : children;

  if ("href" in props && props.href) {
    if (disabled) {
      return (
        <span
          aria-disabled="true"
          aria-label={finalAriaLabel}
          title={title}
          className={cn("cb-focus-button pointer-events-none opacity-60", className)}
          {...dataAttrs}
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        href={props.href}
        aria-disabled={disabled || undefined}
        aria-label={finalAriaLabel}
        title={title}
        className={cn("cb-focus-button", className)}
        {...dataAttrs}
      >
        {content}
      </Link>
    );
  }

  const { type = "button" } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={finalAriaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      title={title}
      className={cn("cb-focus-button", className)}
      {...dataAttrs}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

