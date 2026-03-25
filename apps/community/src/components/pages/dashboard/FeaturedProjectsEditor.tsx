"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FeaturedProject } from "@/lib/dashboard";

const MAX_PROJECTS = 3;

export type FeaturedProjectRow = {
  id: string;
  title: string;
  url: string;
  description: string;
};

function createRowId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `project-row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildRowsFromFeaturedProjects(projects: FeaturedProject[]): FeaturedProjectRow[] {
  const capped = projects.slice(0, MAX_PROJECTS);
  if (capped.length === 0) {
    return [{ id: createRowId(), title: "", url: "", description: "" }];
  }
  return capped.map((project) => ({
    id: createRowId(),
    title: project.title,
    url: project.url ?? "",
    description: project.description
  }));
}

export function buildFeaturedProjectsFromRows(rows: FeaturedProjectRow[]): FeaturedProject[] {
  return rows
    .map((row) => {
      const title = row.title.trim();
      if (!title) {
        return null;
      }
      const rawUrl = row.url.trim();
      const normalizedUrl =
        rawUrl === "" ? null : /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      return {
        title,
        url: normalizedUrl,
        description: row.description.trim()
      } satisfies FeaturedProject;
    })
    .filter((item): item is FeaturedProject => item !== null)
    .slice(0, MAX_PROJECTS);
}

type FeaturedProjectsEditorProps = {
  rows: FeaturedProjectRow[];
  onRowsChange: (rows: FeaturedProjectRow[]) => void;
};

export function FeaturedProjectsEditor({ rows, onRowsChange }: FeaturedProjectsEditorProps) {
  const updateRow = (id: string, patch: Partial<Omit<FeaturedProjectRow, "id">>) => {
    onRowsChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    if (rows.length >= MAX_PROJECTS) {
      return;
    }
    onRowsChange([...rows, { id: createRowId(), title: "", url: "", description: "" }]);
  };

  const removeRow = (id: string) => {
    const next = rows.filter((row) => row.id !== id);
    onRowsChange(next.length === 0 ? [{ id: createRowId(), title: "", url: "", description: "" }] : next);
  };

  const canAddAnother = rows.length < MAX_PROJECTS;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Featured projects</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          Up to three projects appear on your public profile. URL is optional. We add{" "}
          <span className="font-mono text-[10px] sm:text-[11px]">https://</span> when needed.
        </p>
      </div>

      <div className="space-y-2" role="list">
        {rows.map((row) => (
          <div
            key={row.id}
            role="listitem"
            className="rounded-md border border-border/70 bg-background/50 p-2.5 sm:p-3"
          >
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:gap-2">
              <div className="space-y-1">
                <label htmlFor={`featured-project-title-${row.id}`} className="text-[11px] font-medium text-muted-foreground">
                  Title
                </label>
                <input
                  id={`featured-project-title-${row.id}`}
                  value={row.title}
                  onChange={(event) => updateRow(row.id, { title: event.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                  placeholder="Project name"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor={`featured-project-url-${row.id}`} className="text-[11px] font-medium text-muted-foreground">
                  URL <span className="font-normal opacity-80">(optional)</span>
                </label>
                <input
                  id={`featured-project-url-${row.id}`}
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
                  aria-label={`Remove project${row.title.trim() ? ` “${row.title.trim()}”` : ""}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <label htmlFor={`featured-project-desc-${row.id}`} className="text-[11px] font-medium text-muted-foreground">
                Description <span className="font-normal opacity-80">(optional)</span>
              </label>
              <textarea
                id={`featured-project-desc-${row.id}`}
                value={row.description}
                onChange={(event) => updateRow(row.id, { description: event.target.value })}
                rows={2}
                className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm"
                placeholder="One line about what it does"
              />
            </div>
          </div>
        ))}
      </div>

      {canAddAnother ? (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-dashed border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/50 hover:text-foreground sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          Add another project
        </button>
      ) : null}
    </div>
  );
}
