import { Eye, Heart, MessageCircle, MessageSquare, Users } from "lucide-react";
import type { DashboardBlogSummary } from "@/lib/dashboard";

type DashboardKpiRowProps = {
  blogSummary: DashboardBlogSummary;
  discussionCount: number;
  followerCount: number;
};

type KpiItem = {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
};

function formatValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

export function DashboardKpiRow({
  blogSummary,
  discussionCount,
  followerCount
}: DashboardKpiRowProps) {
  const items: KpiItem[] = [
    {
      label: "Views (30d)",
      value: formatValue(blogSummary.viewsLast30Days),
      icon: Eye
    },
    {
      label: "Reactions",
      value: formatValue(blogSummary.totalReactions),
      icon: Heart
    },
    {
      label: "Comments",
      value: formatValue(blogSummary.totalComments),
      icon: MessageCircle
    },
    {
      label: "Discussions",
      value: discussionCount,
      icon: MessageSquare
    },
    {
      label: "Followers",
      value: formatValue(followerCount),
      icon: Users
    }
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-card/80"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
              <Icon className="h-5 w-5 text-primary/80" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
