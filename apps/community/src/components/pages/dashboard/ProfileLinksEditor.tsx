"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileLink } from "@/lib/dashboard";

export type ProfileLinkRow = {
  id: string;
  label: string;
  url: string;
};

function createRowId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `link-row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildLinkRowsFromProfileLinks(links: ProfileLink[]): ProfileLinkRow[] {
  if (links.length === 0) {
    return [{ id: createRowId(), label: "", url: "" }];
  }
  return links.map((link) => ({
    id: createRowId(),
    label: link.label,
    url: link.url
  }));
}

export function buildProfileLinksFromRows(rows: ProfileLinkRow[]): ProfileLink[] {
  return rows
    .map((row) => {
      const label = row.label.trim();
      const rawUrl = row.url.trim();
      if (!label || !rawUrl) {
        return null;
      }
      const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      return { label, url: normalizedUrl } satisfies ProfileLink;
    })
    .filter((item): item is ProfileLink => item !== null);
}

type ProfileLinksEditorProps = {
  rows: ProfileLinkRow[];
  onRowsChange: (rows: ProfileLinkRow[]) => void;
};

export function ProfileLinksEditor({ rows, onRowsChange }: ProfileLinksEditorProps) {
  const updateRow = (id: string, patch: Partial<Pick<ProfileLinkRow, "label" | "url">>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onRowsChange([...rows, { id: createRowId(), label: "", url: "" }]);
  };

  const removeRow = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    onRowsChange(next.length === 0 ? [{ id: createRowId(), label: "", url: "" }] : next);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Links</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          Website, GitHub, socials — label and URL per row. We&apos;ll add{" "}
          <span className="font-mono text-[10px] sm:text-[11px]">https://</span> on save if needed.
        </p>
      </div>

      <div className="space-y-2" role="list">
        {rows.map((row) => (
          <div
            key={row.id}
            role="listitem"
            className="rounded-md border border-border/70 bg-background/50 p-2.5 sm:p-3"
          >
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)_auto] sm:items-end sm:gap-2">
              <div className="space-y-1">
                <label htmlFor={`profile-link-label-${row.id}`} className="text-[11px] font-medium text-muted-foreground">
                  Label
                </label>
                <input
                  id={`profile-link-label-${row.id}`}
                  value={row.label}
                  onChange={(event) => updateRow(row.id, { label: event.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                  placeholder="e.g. GitHub, Website"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={`profile-link-url-${row.id}`} className="text-[11px] font-medium text-muted-foreground">
                  URL
                </label>
                <input
                  id={`profile-link-url-${row.id}`}
                  value={row.url}
                  onChange={(event) => updateRow(row.id, { url: event.target.value })}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                  placeholder="https://…"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                  aria-label={`Remove link${row.label.trim() ? ` “${row.label.trim()}”` : ""}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/50 hover:text-foreground sm:text-sm"
      >
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        Add another link
      </button>
    </div>
  );
}
