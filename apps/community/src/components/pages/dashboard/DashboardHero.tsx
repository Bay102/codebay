"use client";

import Link from "next/link";
import { Activity, Bell, FileText, LayoutDashboard, MessageSquareText } from "lucide-react";
import { SurfaceCard } from "@codebay/ui";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { getDashboardActivityIcon } from "@/components/pages/dashboard/dashboard-activity-icons";
import { useDashboardNotificationModal } from "@/contexts/DashboardNotificationModalContext";
import { DashboardHeroButtons } from "@/components/pages/dashboard/DashboardHeroButtons";

type DashboardHeroStats = {
  discussionCount: number;
  publishedPostCount: number;
  nextStepsDone: number;
  nextStepsTotal: number;
};

type DashboardHeroProps = {
  name: string;
  stats?: DashboardHeroStats;
  /** When hub setup is complete, pass up to 3 unread activity items for the notification quick view. */
  quickViewActivityItems?: DashboardActivityItem[];
  /** When set, "View all" opens the notifications modal instead of linking to #activity. */
  onViewAllNotifications?: () => void;
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const kindLabel: Record<DashboardActivityItem["kind"], string> = {
  reply: "Reply",
  comment: "Comment",
  direct_message: "DM",
  blog_reaction: "Reaction",
  discussion_comment: "Comment",
  discussion_reaction: "Reaction"
};

function formatNotificationDetails(item: DashboardActivityItem): string {
  const parts: string[] = [];
  if (item.actorUsername) {
    parts.push(`@${item.actorUsername}`);
  }
  if (item.reactionType) {
    parts.push(item.reactionType);
  }
  return parts.join(" · ");
}

function formatRelativeTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function DashboardHero({
  name,
  stats,
  quickViewActivityItems = [],
  onViewAllNotifications: onViewAllNotificationsProp
}: DashboardHeroProps) {
  const modal = useDashboardNotificationModal();
  const onViewAllNotifications = onViewAllNotificationsProp ?? (modal ? () => modal.setOpen(true) : undefined);
  const greeting = getTimeGreeting();
  const allStepsComplete = stats && stats.nextStepsTotal > 0 && stats.nextStepsDone >= stats.nextStepsTotal;
  const discussionCount = stats?.discussionCount ?? 0;
  const publishedCount = stats?.publishedPostCount ?? 0;

  const stepsLabel =
    stats && stats.nextStepsTotal > 0
      ? `${stats.nextStepsDone}/${stats.nextStepsTotal} setup`
      : "Hub ready";

  const showNotificationQuickView = allStepsComplete;
  const quickViewItems = quickViewActivityItems.slice(0, 3);

  return (
    <SurfaceCard
      as="section"
      variant="borderless"
      className="relative isolate overflow-hidden rounded-tl-3xl border border-border/40 bg-card/70 p-5 shadow-xl sm:p-6 lg:p-8"
    >
      {/* Decorative layers (aligned with main community hero); radii match outer card to avoid corner halos */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:2.75rem_2.75rem] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]"
        aria-hidden
      />
      <div className="absolute left-6 top-6 z-20 hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-primary md:inline-flex lg:left-8 lg:top-8">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Your Dashboard
      </div>
      {/* Signal beam (uses globals.css signal-sweep animation) */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(42%+16px)] hidden px-5 sm:block sm:px-6 lg:px-8" aria-hidden>
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50" />
          <div
            data-signal-beam
            className="absolute top-1/2 h-10 w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/35 to-transparent blur-xl"
          />
          <div
            data-signal-beam-core
            className="absolute top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/90 to-transparent"
          />
        </div>
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
        <div className="max-w-3xl pb-2">

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-primary md:hidden">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Your Dashboard
          </div>

          <h1 className="font-hero mt-4 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
            {greeting}, {name}
          </h1>

          <p className="font-hero mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {allStepsComplete
              ? "Your hub is set up. Manage your profile, run your blog workflow, and stay on top of community activity."
              : "Manage your profile, run your blog workflow, and keep up with community activity from one place."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <MessageSquareText className="h-3.5 w-3.5 text-primary" />
              Discussions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Blog workflow
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Activity feed
            </span>
          </div>

          <DashboardHeroButtons hasSession variant="dashboard" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="border border-border/60 bg-background/80 p-4 backdrop-blur">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Discussions</div>
            <div className="mt-1.5 font-mono-ticker text-xl font-semibold leading-none text-foreground sm:text-2xl">
              {discussionCount}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">your threads</div>
          </div>
          <div className="border border-border/60 bg-background/80 p-4 backdrop-blur">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Published</div>
            <div className="mt-1.5 font-mono-ticker text-xl font-semibold leading-none text-foreground sm:text-2xl">
              {publishedCount}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">blog posts</div>
          </div>
          {showNotificationQuickView ? (
            <div className="border border-border/60 bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  Notifications
                </div>
                {onViewAllNotifications ? (
                  <button
                    type="button"
                    onClick={onViewAllNotifications}
                    className="text-[11px] font-medium text-primary transition-colors hover:underline"
                  >
                    View all
                  </button>
                ) : (
                  <Link
                    href="/dashboard#activity"
                    className="text-[11px] font-medium text-primary transition-colors hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              <div className="mt-3 min-h-[3.5rem] divide-y divide-border/50">
                {quickViewItems.length > 0 ? (
                  quickViewItems.map((item) => {
                    const { Icon, iconClassName } = getDashboardActivityIcon(item);
                    return (
                      <div key={item.id} className="flex gap-2.5 py-2.5 first:pt-0">
                        <div className="shrink-0 pt-0.5" aria-hidden>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background/60">
                            <Icon className={`h-3.5 w-3.5 ${iconClassName}`} strokeWidth={2} />
                          </span>
                        </div>
                        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="line-clamp-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <span className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</span>
                          )}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                            <span>{kindLabel[item.kind]}</span>
                            {formatNotificationDetails(item) ? (
                              <>
                                <span>·</span>
                                <span className="line-clamp-1">{formatNotificationDetails(item)}</span>
                              </>
                            ) : null}
                            <span>·</span>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No new activity</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-border/60 bg-background/80 p-4 backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Hub setup</div>
              <div className="mt-1.5 font-mono-ticker text-xl font-semibold leading-none text-foreground sm:text-2xl">
                {stepsLabel}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">next steps</div>
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
