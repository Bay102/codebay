"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import { Button, FilterDropdown, Input, cn } from "@codebay/ui";
import type { TagOption } from "@/lib/tags";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

export interface DiscussionsToolbarProps {
  tags: TagOption[];
  initialQuery?: string;
  initialTag?: string | null;
  /** `hero` embeds filters in the listings hero (glass panel, tighter layout). */
  variant?: "default" | "hero";
}

export function DiscussionsToolbar({
  tags,
  initialQuery = "",
  initialTag = null,
  variant = "default"
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

  const filterDropdown = (
    <FilterDropdown
      label="Topic"
      options={filterOptions}
      value={currentTag}
      onSelect={(tag) => setFilters({ tag })}
      allLabel="All topics"
      hidden={tags.length === 0}
      variant="secondary"
      triggerClassName={
        variant === "hero" ? "h-10 w-full justify-between sm:w-auto sm:min-w-[10.5rem]" : undefined
      }
    />
  );

  const searchForm = (
    <form
      onSubmit={handleSearchSubmit}
      className={cn("w-full min-w-0", variant === "default" && "sm:max-w-sm")}
      role="search"
    >
      <div className="relative w-full">
        <Input
          type="search"
          name="q"
          defaultValue={currentQuery}
          placeholder="Search by title, author, or topic…"
          className="h-10 min-w-0 pr-10"
          aria-label="Search discussions"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          disabled={isPending}
          className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );

  const cta = (
    <FocusButton
      href="/dashboard/discussions/new"
      colorVariant="primary"
      borderVariant="bordered"
      sizeVariant="sm"
      radiusVariant="square"
      className={cn(variant === "hero" && "w-full shrink-0 sm:w-auto")}
    >
      New discussion
    </FocusButton>
  );

  if (variant === "hero") {
    return (
      <div
        className="rounded-xl border border-border/60 bg-background/75 p-3 backdrop-blur-sm sm:p-4"
        aria-label="Filter discussions"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          {filterDropdown}
          <div className="min-w-0 flex-1">{searchForm}</div>
          {cta}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterDropdown
        label="Filter by topic"
        options={filterOptions}
        value={currentTag}
        onSelect={(tag) => setFilters({ tag })}
        allLabel="All"
        hidden={tags.length === 0}
        variant="secondary"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchForm}
        {cta}
      </div>
    </div>
  );
}
