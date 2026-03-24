import type { SVGProps } from "react";
import { cn } from "./utils";

type SiteLogoProps = SVGProps<SVGSVGElement>;

/** Cirqit wordmark logo for site chrome (header, etc.). */
export function SiteLogo({ className, ...props }: SiteLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 84"
      className={cn("text-foreground", className)}
      aria-hidden
      {...props}
    >
      <text
        x="0"
        y="53"
        fill="currentColor"
        fontFamily='ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize="52"
        fontWeight="400"
        letterSpacing="-0.1"
      >
        <tspan>cir</tspan>
        <tspan dx="-0.2" fontWeight="600" letterSpacing="-0.04em">
          q
        </tspan>
        <tspan dx="-0.2">it</tspan>
      </text>
    </svg>
  );
}
