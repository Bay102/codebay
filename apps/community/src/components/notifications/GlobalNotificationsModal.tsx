"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardActivityItem } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsDialog } from "@/components/notifications/NotificationsDialog";

const OPEN_EVENT = "dashboard:open-notifications";

export function GlobalNotificationsModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DashboardActivityItem[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");

  const fetchActivity = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/notifications/activity", { method: "GET" });
      if (!response.ok) {
        setLoadState("error");
        setItems([]);
        return;
      }
      const payload = (await response.json()) as { items?: DashboardActivityItem[] };
      setItems((payload.items ?? []).filter((item) => !item.isRead));
      setLoadState("idle");
    } catch {
      setLoadState("error");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleOpenRequest = () => {
      setOpen(true);
      void fetchActivity();
    };

    window.addEventListener(OPEN_EVENT, handleOpenRequest);
    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpenRequest);
    };
  }, [user, fetchActivity]);

  if (!user) {
    return null;
  }

  return (
    <NotificationsDialog
      open={open}
      onOpenChange={setOpen}
      items={items}
      onItemsChange={setItems}
      isLoading={loadState === "loading"}
      errorMessage={loadState === "error" ? "Could not load notifications. Try again later." : null}
    />
  );
}
