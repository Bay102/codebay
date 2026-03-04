"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { DashboardBlogSummary } from "@/lib/dashboard";

type BlogManagementSummaryCardProps = {
  summary: DashboardBlogSummary;
};

export function BlogManagementSummaryCard({ summary }: BlogManagementSummaryCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Blog management</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/blog"
            aria-label="Manage blog"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs font-medium transition-colors hover:bg-secondary/70"
          >
            <FileText className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label={isCollapsed ? "Expand blog management card" : "Collapse blog management card"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/60 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/80"
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{summary.publishedCount}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Drafts</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{summary.draftCount}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-border/70 bg-background/70 p-3 sm:col-span-1">
              <p className="text-xs text-muted-foreground">Views (30d)</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{summary.viewsLast30Days.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/blog/new"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              New post
            </Link>
            <Link
              href="/dashboard/blog"
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              Manage posts
            </Link>
          </div>

          {summary.latestDraft ? (
            <div className="mt-5 rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest draft</p>
              <p className="mt-1 text-sm font-medium text-foreground">{summary.latestDraft.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated{" "}
                {summary.latestDraft.updatedAt ? new Date(summary.latestDraft.updatedAt).toLocaleDateString() : "recently"}
              </p>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}
