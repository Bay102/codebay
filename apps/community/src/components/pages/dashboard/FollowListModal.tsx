"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FollowProfileRow } from "@/lib/follows";
import { getFollowers, getFollowing } from "@/lib/follows";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type FollowListModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "followers" | "following";
  userId: string;
  title: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
}

export function FollowListModal({ open, onOpenChange, mode, userId, title }: FollowListModalProps) {
  const { supabase } = useAuth();
  const [list, setList] = useState<FollowProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !supabase || !userId) {
      setList([]);
      return;
    }
    setIsLoading(true);
    const fetchList = mode === "followers" ? getFollowers : getFollowing;
    fetchList(supabase, userId, 48, 0)
      .then(setList)
      .finally(() => setIsLoading(false));
  }, [open, supabase, userId, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(80dvh,480px)] overflow-hidden flex flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto -mx-6 px-6 flex-1 min-h-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No one yet.</p>
          ) : (
            <ul className="space-y-1 py-2">
              {list.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/${row.username}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/70"
                  >
                    {row.avatarUrl ? (
                      <img
                        src={row.avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-full border border-border/70 object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-xs font-medium text-foreground">
                        {getInitials(row.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{row.username}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
