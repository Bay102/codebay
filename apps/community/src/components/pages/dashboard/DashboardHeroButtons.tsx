import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface DashboardHeroButtonsProps {
  hasSession: boolean;
  variant?: "landing" | "dashboard";
  className?: string;
}

type HeroLink = {
  href: string;
  label: string;
  kind: "primary" | "neutral";
};

function HeroCtaLink({ href, label, kind }: HeroLink) {
  const base =
    "group relative inline-flex w-full items-center justify-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm";

  const className =
    kind === "primary"
      ? `${base} border border-primary/25 bg-primary/15 text-primary hover:bg-primary/20`
      : `${base} border border-border/70 bg-card/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground`;

  return (
    <Link href={href} className={className}>
      <span className="relative z-10">{label}</span>
      {kind === "primary" && <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      {kind === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </Link>
  );
}

export function DashboardHeroButtons({ hasSession, variant = "landing", className }: DashboardHeroButtonsProps) {
  const links: HeroLink[] =
    variant === "dashboard"
      ? [
          { href: "/explore", label: "Explore", kind: "primary" },
          { href: "/dashboard/discussions/new", label: "Start a discussion", kind: "neutral" },
          { href: "/dashboard/blog", label: "Blog Dashboard", kind: "neutral" }
        ]
      : [
          ...(!hasSession
            ? [
                { href: "/join", label: "Join the community", kind: "primary" as const },
                { href: "/join?mode=signin", label: "Sign in", kind: "neutral" as const }
              ]
            : [{ href: "/dashboard", label: "Dashboard", kind: "primary" as const }]),
          { href: "/explore", label: "Explore", kind: "neutral" },
          {
            href: hasSession ? "/dashboard/discussions/new" : "/join?redirect=/dashboard/discussions/new",
            label: "Start a discussion",
            kind: "neutral"
          },
          { href: hasSession ? "/dashboard/blog" : "/join?redirect=/dashboard/blog", label: "Manage blog", kind: "neutral" }
        ];

  return (
    <div
      className={`mt-5 flex w-full flex-col gap-2 rounded-2xl border border-border/60 bg-background/40 p-2 backdrop-blur-sm sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5 sm:rounded-full sm:p-1.5 ${className ?? ""}`}
      role="navigation"
      aria-label="Primary actions"
    >
      {links.map((link) => (
        <HeroCtaLink key={`${link.href}:${link.label}`} href={link.href} label={link.label} kind={link.kind} />
      ))}
    </div>
  );
}
