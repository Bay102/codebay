"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { getDashboardActivityIcon } from "@/components/pages/dashboard/dashboard-activity-icons";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsDialog } from "@/components/notifications/NotificationsDialog";

type ActivityOverviewCardProps = {
  items: DashboardActivityItem[];
  allItems: DashboardActivityItem[];
  /** When provided, the notifications modal is controlled from the parent. */
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
  modalOpen: controlledModalOpen,
  onModalOpenChange
}: ActivityOverviewCardProps) {
  const [overviewItems, setOverviewItems] = useState(items);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isControlled = controlledModalOpen !== undefined && onModalOpenChange !== undefined;
  const modalOpen = isControlled ? controlledModalOpen : internalModalOpen;
  const setModalOpen = isControlled ? onModalOpenChange : setInternalModalOpen;
  const [modalItems, setModalItems] = useState(() => allItems.filter((item) => !item.isRead));
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const { supabase } = useAuth();

  const hasActivity = overviewItems.length > 0;
  const visibleOverviewItems = overviewItems.slice(0, 3);

  const handleUnreadRemoved = (ids: string[]) => {
    const idSet = new Set(ids);
    setOverviewItems((previous) => previous.filter((item) => !idSet.has(item.id)));
  };

  const handleCompactMarkRead = async (activityId: string) => {
    if (!supabase || markingIds.has(activityId)) {
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
    window.dispatchEvent(new Event("community:notifications-unread-refresh"));
  };

  const renderActivityItem = (item: DashboardActivityItem) => {
    const isMarking = markingIds.has(item.id);
    const { Icon, iconClassName } = getDashboardActivityIcon(item);
    const details = formatActivityDetails(item);
    const leftContent = (
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5" aria-hidden>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/80">
            <Icon className={`h-3.5 w-3.5 ${iconClassName}`} strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {kindLabel[item.kind]}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          {details ? <p className="mt-1 text-sm text-muted-foreground">{details}</p> : null}
          <p className="mt-2 text-[11px] text-muted-foreground">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );

    const baseContent = (
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          {item.href ? (
            <Link href={item.href} className="block">
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
                void handleCompactMarkRead(item.id);
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

    return (
      <div
        key={item.id}
        className="block border border-border/70 bg-background/70 p-3 transition-colors hover:bg-secondary/70"
      >
        {baseContent}
      </div>
    );
  };

  const modal = (
    <NotificationsDialog
      open={modalOpen}
      onOpenChange={setModalOpen}
      items={modalItems}
      onItemsChange={setModalItems}
      onUnreadRemoved={handleUnreadRemoved}
    />
  );

  return (
    <article className="border border-border/70 bg-card/70 p-5 sm:p-6">
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
          {visibleOverviewItems.map((item) => renderActivityItem(item))}
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
