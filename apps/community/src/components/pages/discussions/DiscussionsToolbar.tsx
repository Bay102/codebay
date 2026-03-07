"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button, FilterDropdown, Input } from "@codebay/ui";
import type { TagOption } from "@/lib/tags";

export interface DiscussionsToolbarProps {
  tags: TagOption[];
  initialQuery?: string;
  initialTag?: string | null;
}

export function DiscussionsToolbar({
  tags,
  initialQuery = "",
  initialTag = null
}: DiscussionsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTag = initialTag ?? searchParams.get("tag");
  const currentQuery = initialQuery ?? searchParams.get("q") ?? "";

  const setFilters = useCallback(
    (updates: { q?: string; tag?: string | null }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        if (updates.q.trim()) next.set("q", updates.q.trim());
        else next.delete("q");
      }
      if (updates.tag !== undefined) {
        if (updates.tag) next.set("tag", updates.tag);
        else next.delete("tag");
      }
      next.delete("page"); // reset pagination when filters change
      const queryString = next.toString();
      startTransition(() => {
        router.push(queryString ? `/discussions?${queryString}` : "/discussions");
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    setFilters({ q: input?.value ?? "" });
  };

  const filterOptions = tags.map((t) => ({ id: t.id, label: t.name }));

  return (
    <div className="space-y-4">
      <FilterDropdown
        label="Filter by topic"
        options={filterOptions}
        value={currentTag}
        onSelect={(tag) => setFilters({ tag })}
        allLabel="All"
        hidden={tags.length === 0}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full min-w-0 gap-2 sm:max-w-sm"
          role="search"
        >
          <Input
            type="search"
            name="q"
            defaultValue={currentQuery}
            placeholder="Search by title, author, or topic…"
            className="min-w-0"
            aria-label="Search discussions"
          />
          <Button type="submit" variant="secondary" size="default" disabled={isPending}>
            Search
          </Button>
        </form>
        <Button asChild variant="outline" size="default" className="w-full sm:w-auto">
          <a href="/dashboard/discussions/new">New discussion</a>
        </Button>
      </div>


    </div>
  );
}
