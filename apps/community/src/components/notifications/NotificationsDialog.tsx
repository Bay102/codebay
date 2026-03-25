"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCheck, CheckCircle2 } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { getDashboardActivityIcon } from "@/components/pages/dashboard/dashboard-activity-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@codebay/ui";

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

export type NotificationsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DashboardActivityItem[];
  onItemsChange: (items: DashboardActivityItem[]) => void;
  /** Called after unread items are removed (e.g. sync dashboard notification preview). */
  onUnreadRemoved?: (ids: string[]) => void;
  /** When true and there are no items yet, show a loading message instead of the empty state. */
  isLoading?: boolean;
  /** When set, shown instead of the empty list (e.g. fetch failure). */
  errorMessage?: string | null;
};

export function NotificationsDialog({
  open,
  onOpenChange,
  items,
  onItemsChange,
  onUnreadRemoved,
  isLoading = false,
  errorMessage = null
}: NotificationsDialogProps) {
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const { supabase } = useAuth();

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

    onItemsChange(items.filter((item) => item.id !== activityId));
    onUnreadRemoved?.([activityId]);
    window.dispatchEvent(new Event("community:notifications-unread-refresh"));
  };

  const handleMarkAllRead = async () => {
    if (!supabase) {
      return;
    }

    if (markingAll) {
      return;
    }

    const unreadItems = items.filter((item) => !item.isRead);
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

    onItemsChange(items.filter((item) => !ids.includes(item.id)));
    onUnreadRemoved?.(ids);
    window.dispatchEvent(new Event("community:notifications-unread-refresh"));
  };

  const renderActivityItem = (item: DashboardActivityItem) => {
    const isMarking = markingIds.has(item.id) || markingAll;
    const details = formatActivityDetails(item);
    const { Icon, iconClassName } = getDashboardActivityIcon(item);
    const leftContent = (
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5" aria-hidden>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80">
            <Icon className={`h-4 w-4 ${iconClassName}`} strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{kindLabel[item.kind]}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          {details ? <p className="mt-1 text-sm text-muted-foreground">{details}</p> : null}
          <p className="mt-2 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
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

    return (
      <div key={item.id} className="block border border-border/70 bg-background/70 p-3">
        {baseContent}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between gap-3 space-y-0 text-left">
          <DialogTitle>Notifications</DialogTitle>
          {items.length > 0 && !isLoading ? (
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
        {errorMessage ? (
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        ) : isLoading && items.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading notifications…</p>
        ) : items.length > 0 ? (
          <div className="mt-2 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {items.map((item) => renderActivityItem(item))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">You have no recent activity.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
