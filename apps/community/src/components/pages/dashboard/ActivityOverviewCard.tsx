"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCheck, CheckCircle2 } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@codebay/ui";

type ActivityOverviewCardProps = {
  items: DashboardActivityItem[];
  allItems: DashboardActivityItem[];
  /** When true, only mount the modal logic (hide the on-page card). */
  hideCard?: boolean;
  /** When provided, the notifications modal is controlled from the parent (e.g. hero "View all"). */
  modalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
};

const kindLabel: Record<DashboardActivityItem["kind"], string> = {
  reply: "Reply",
  comment: "Comment",
  direct_message: "Direct message",
  blog_reaction: "Post reaction",
  discussion_comment: "Discussion comment",
  discussion_reaction: "Discussion reaction"
};

function formatActivityDetails(item: DashboardActivityItem): string {
  const parts: string[] = [];
  if (item.actorUsername) {
    parts.push(`@${item.actorUsername}`);
  }
  if (item.reactionType) {
    parts.push(item.reactionType);
  }
  return parts.join(" · ");
}

export function ActivityOverviewCard({
  items,
  allItems,
  hideCard = false,
  modalOpen: controlledModalOpen,
  onModalOpenChange
}: ActivityOverviewCardProps) {
  const [overviewItems, setOverviewItems] = useState(items);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isControlled = controlledModalOpen !== undefined && onModalOpenChange !== undefined;
  const modalOpen = isControlled ? controlledModalOpen : internalModalOpen;
  const setModalOpen = isControlled ? onModalOpenChange : setInternalModalOpen;
  const [modalItems, setModalItems] = useState(
    () => allItems.filter((item) => !item.isRead)
  );
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const { supabase } = useAuth();

  const hasActivity = overviewItems.length > 0;
  const visibleOverviewItems = overviewItems.slice(0, 3);

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
    setModalItems((previous) => previous.filter((item) => item.id !== activityId));
  };

  const handleMarkAllRead = async () => {
    if (!supabase) {
      return;
    }

    if (markingAll) {
      return;
    }

    const unreadItems = modalItems.filter((item) => !item.isRead);
    if (unreadItems.length === 0) {
      return;
    }

    const ids = unreadItems.map((item) => item.id);
    setMarkingAll(true);

    try {
      await supabase
        .from("dashboard_activity_reads")
        .insert(ids.map((activityId) => ({ activity_id: activityId })));
    } finally {
      setMarkingAll(false);
    }

    setOverviewItems((previous) => previous.filter((item) => !ids.includes(item.id)));
    setModalItems((previous) => previous.filter((item) => !ids.includes(item.id)));
  };

  const renderActivityItem = (item: DashboardActivityItem, variant: "compact" | "full") => {
    const isMarking = markingIds.has(item.id) || markingAll;
    const details = formatActivityDetails(item);
    const leftContent = (
      <>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {kindLabel[item.kind]}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        {details ? <p className="mt-1 text-sm text-muted-foreground">{details}</p> : null}
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
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="sr-only">Activity marked as read</span>
            </span>
          ) : (
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void handleMarkRead(item.id);
              }}
              disabled={isMarking}
            >
              <Check className="h-3 w-3" />
              <span className="sr-only">Mark activity as read</span>
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

  const modal = (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between gap-3 space-y-0 text-left">
          <DialogTitle>Notifications</DialogTitle>
          {modalItems.length > 0 ? (
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleMarkAllRead()}
              disabled={markingAll}
            >
              <CheckCheck className="h-4 w-4" />
              <span className="whitespace-nowrap">Dismiss all notifications</span>
            </button>
          ) : null}
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
  );

  if (hideCard) {
    return modal;
  }

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notifications</h2>
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
          {visibleOverviewItems.map((item) => renderActivityItem(item, "compact"))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No recent activity yet. New comments, replies to your comments, and direct messages will appear here.
        </p>
      )}

      {modal}
    </article>
  );
}
