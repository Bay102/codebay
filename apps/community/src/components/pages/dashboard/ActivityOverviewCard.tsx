"use client";

import { useState } from "react";
import Link from "next/link";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@codebay/ui";

type ActivityOverviewCardProps = {
  items: DashboardActivityItem[];
  allItems: DashboardActivityItem[];
};

const kindLabel: Record<DashboardActivityItem["kind"], string> = {
  reply: "Reply",
  comment: "Comment",
  direct_message: "Direct message",
  blog_reaction: "Post reaction",
  discussion_comment: "Discussion comment",
  discussion_reaction: "Discussion reaction"
};

export function ActivityOverviewCard({ items, allItems }: ActivityOverviewCardProps) {
  const [overviewItems, setOverviewItems] = useState(items);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState(allItems);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const { supabase } = useAuth();

  const hasActivity = overviewItems.length > 0;

  const handleMarkRead = async (activityId: string) => {
    if (!supabase) {
      return;
    }

    if (markingIds.has(activityId)) {
      return;
    }

    setMarkingIds((previous) => new Set(previous).add(activityId));

    try {
      await supabase.from("dashboard_activity_reads").insert({ activity_id: activityId });
    } finally {
      setMarkingIds((previous) => {
        const next = new Set(previous);
        next.delete(activityId);
        return next;
      });
    }

    setOverviewItems((previous) => previous.filter((item) => item.id !== activityId));
    setModalItems((previous) =>
      previous.map((item) => (item.id === activityId ? { ...item, isRead: true } : item))
    );
  };

  const renderActivityItem = (item: DashboardActivityItem, variant: "compact" | "full") => {
    const isMarking = markingIds.has(item.id);
    const leftContent = (
      <>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {kindLabel[item.kind]}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </>
    );

    const baseContent = (
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          {item.href ? (
            <Link
              href={item.href}
              className="block"
            >
              {leftContent}
            </Link>
          ) : (
            leftContent
          )}
        </div>
        <div className="mt-2 flex shrink-0 flex-row items-center gap-2 pt-1 sm:mt-0 sm:flex-col sm:items-end">
          {item.isRead ? (
            <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Read
            </span>
          ) : (
            <button
              type="button"
              className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void handleMarkRead(item.id);
              }}
              disabled={isMarking}
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    );

    const className =
      variant === "compact"
        ? "block rounded-xl border border-border/70 bg-background/70 p-3 transition-colors hover:bg-secondary/70"
        : "block rounded-xl border border-border/70 bg-background/70 p-3";

    return (
      <div key={item.id} className={className}>
        {baseContent}
      </div>
    );
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
        {modalItems.length > 0 ? (
          <button
            type="button"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setModalOpen(true)}
          >
            View all
          </button>
        ) : null}
      </div>

      {hasActivity ? (
        <div className="mt-4 space-y-3">
          {overviewItems.map((item) => renderActivityItem(item, "compact"))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No recent activity yet. New comments, replies to your comments, and direct messages will appear here.
        </p>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>All recent activity</DialogTitle>
          </DialogHeader>
          {modalItems.length > 0 ? (
            <div className="mt-2 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {modalItems.map((item) => renderActivityItem(item, "full"))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">You have no recent activity.</p>
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}
