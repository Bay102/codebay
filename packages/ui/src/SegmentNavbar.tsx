import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "./utils";

export type SegmentNavbarLink = {
  href: string;
  label: string;
  kind: "primary" | "neutral";
};

const navDemotePrimary =
  "[&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)]:bg-transparent [&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)]:shadow-none [&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)]:ring-0 [&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)]:text-muted-foreground [&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)_svg]:text-muted-foreground [&:has(a:hover)]:[&_a[data-slot=primary]:not(:hover)_svg]:opacity-60";

function SegmentCtaLink({ href, label, kind }: SegmentNavbarLink) {
  const slot = kind === "primary" ? "primary" : "neutral";

  const base =
    "group relative flex min-h-[2.5rem] w-full min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-center text-sm font-medium transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:min-w-[7.5rem] sm:flex-none";

  const className = cn(
    base,
    kind === "primary"
      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
      : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm hover:ring-1 hover:ring-border/60"
  );

  return (
    <Link href={href} className={className} data-slot={slot}>
      <span className="relative z-10">{label}</span>
      {kind === "primary" && (
        <ArrowRight className="relative z-10 h-4 w-4 shrink-0 text-primary transition-[transform,opacity,color] duration-150 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

export interface SegmentNavbarProps {
  links: SegmentNavbarLink[];
  className?: string;
  "aria-label"?: string;
}

/** Pill-style segmented nav (muted track, primary slot + arrow, hover demotion for primary). */
export function SegmentNavbar({ links, className, "aria-label": ariaLabel = "Primary actions" }: SegmentNavbarProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-full flex-col gap-1 rounded-xl border border-border/60 bg-muted/35 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-start",
        navDemotePrimary,
        className
      )}
      role="navigation"
      aria-label={ariaLabel}
    >
      {links.map((link) => (
        <SegmentCtaLink key={`${link.href}:${link.label}`} href={link.href} label={link.label} kind={link.kind} />
      ))}
    </div>
  );
}
