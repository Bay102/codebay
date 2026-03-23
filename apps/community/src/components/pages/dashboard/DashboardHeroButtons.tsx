import { cn, SegmentNavbar, type SegmentNavbarLink } from "@codebay/ui";

export interface DashboardHeroButtonsProps {
  hasSession: boolean;
  variant?: "landing" | "dashboard";
  className?: string;
}

export function DashboardHeroButtons({ hasSession, variant = "landing", className }: DashboardHeroButtonsProps) {
  const links: SegmentNavbarLink[] =
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
            : [
                { href: "/explore", label: "Explore", kind: "primary" as const },
                { href: "/dashboard", label: "Dashboard", kind: "neutral" as const }
              ]),
          ...(!hasSession ? [{ href: "/explore", label: "Explore", kind: "neutral" as const }] : []),
          ...(hasSession
            ? [
                { href: "/dashboard/discussions/new", label: "Start a discussion", kind: "neutral" as const },
                { href: "/dashboard/blog", label: "Manage blog", kind: "neutral" as const }
              ]
            : [])
        ];

  return <SegmentNavbar links={links} className={cn("mt-5", className)} />;
}
