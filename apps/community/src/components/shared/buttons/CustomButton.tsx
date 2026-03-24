import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@codebay/ui";

type CustomButtonSize = "xs" | "sm" | "md" | "lg";
type CustomButtonFontWeight = "medium" | "semibold" | "bold";
type CustomButtonRadius = "none" | "sm" | "md" | "lg" | "full";

const sizeClasses: Record<CustomButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
};

const fontWeightClasses: Record<CustomButtonFontWeight, string> = {
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold"
};

const radiusClasses: Record<CustomButtonRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full"
};

type CustomButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  size?: CustomButtonSize;
  fontWeight?: CustomButtonFontWeight;
  radius?: CustomButtonRadius;
};

export function CustomButton({
  children,
  className,
  type = "button",
  size = "md",
  fontWeight = "semibold",
  radius = "none",
  ...props
}: CustomButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "border border-border text-foreground transition-colors hover:bg-secondary/70 disabled:opacity-70",
        sizeClasses[size],
        fontWeightClasses[fontWeight],
        radiusClasses[radius],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
