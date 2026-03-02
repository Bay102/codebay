import Link from "next/link";
import type { DashboardActivityItem } from "@/lib/dashboard";

type ActivityOverviewCardProps = {
  items: DashboardActivityItem[];
};

const kindLabel: Record<DashboardActivityItem["kind"], string> = {
  reply: "Reply",
  comment: "Comment",
  direct_message: "Direct message"
};

export function ActivityOverviewCard({ items }: ActivityOverviewCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-xl border border-border/70 bg-background/70 p-3 transition-colors hover:bg-secondary/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{kindLabel[item.kind]}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No recent activity yet. New replies, direct messages, and blog comments will appear here.
        </p>
      )}
    </article>
  );
}
