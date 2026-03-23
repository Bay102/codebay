"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import {
  Button,
  FilterDropdown,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@codebay/ui";
import type { ExploreContentType, ExploreSort } from "@/lib/explore";
import type { TagOption } from "@/lib/tags";
import { ExploreContentTypeSegment } from "@/components/pages/explore/ExploreContentTypeSegment";

const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "views", label: "Post views" },
  { value: "comments", label: "Comments" },
  { value: "engagements", label: "Engagements" }
];

export type ExploreToolbarProps = {
  tags: TagOption[];
  contentType: ExploreContentType;
  initialQuery?: string;
  initialTag?: string | null;
  initialSort: ExploreSort;
};

export function ExploreToolbar({
  tags,
  contentType,
  initialQuery = "",
  initialTag = null,
  initialSort
}: ExploreToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTag = initialTag ?? searchParams.get("tag");
  const currentQuery = initialQuery ?? searchParams.get("q") ?? "";
  const currentSort = (searchParams.get("sort") as ExploreSort | null);
  const sortValue: ExploreSort =
    currentSort === "views" || currentSort === "comments" || currentSort === "engagements"
      ? currentSort
      : initialSort;

  const setExploreParams = useCallback(
    (updates: {
      type?: ExploreContentType;
      q?: string;
      tag?: string | null;
      sort?: ExploreSort;
    }) => {
      const next = new URLSearchParams(searchParams.toString());

      if (updates.type !== undefined) {
        if (updates.type === "discussions") next.delete("type");
        else next.set("type", updates.type);
      }
      if (updates.q !== undefined) {
        if (updates.q.trim()) next.set("q", updates.q.trim());
        else next.delete("q");
      }
      if (updates.tag !== undefined) {
        if (updates.tag) next.set("tag", updates.tag);
        else next.delete("tag");
      }
      if (updates.sort !== undefined) {
        if (updates.sort === "date") next.delete("sort");
        else next.set("sort", updates.sort);
      }

      const queryString = next.toString();
      startTransition(() => {
        router.push(queryString ? `/explore?${queryString}` : "/explore");
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    setExploreParams({ q: input?.value ?? "" });
  };

  const filterOptions = tags.map((t) => ({ id: t.id, label: t.name }));

  const topicDropdown = (
    <FilterDropdown
      label="Topic"
      options={filterOptions}
      value={currentTag}
      onSelect={(tag) => setExploreParams({ tag })}
      allLabel="All topics"
      hidden={tags.length === 0}
      variant="secondary"
      triggerClassName="h-10 w-full justify-between sm:w-auto sm:min-w-[10.5rem]"
    />
  );

  const searchForm = (
    <form onSubmit={handleSearchSubmit} className="block w-full min-w-0" role="search">
      <div className="relative w-full min-w-0">
        <Input
          type="search"
          name="q"
          defaultValue={currentQuery}
          placeholder="Search title, author, or topic…"
          className="h-10 w-full min-w-0 pr-10"
          aria-label={`Search ${contentType === "blogs" ? "blog posts" : "discussions"}`}
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

  const contentTypeSegment = (
    <ExploreContentTypeSegment
      value={contentType}
      disabled={isPending}
      onChange={(type) => setExploreParams({ type })}
    />
  );

  const sortOptionLabel = SORT_OPTIONS.find((o) => o.value === sortValue)?.label ?? "Date";

  const sortSelect = (
    <Select
      value={sortValue}
      onValueChange={(value) => {
        const v = value as ExploreSort;
        setExploreParams({ sort: v });
      }}
      disabled={isPending}
    >
      <SelectTrigger
        className="h-10 w-full shrink-0 sm:max-w-[15rem] lg:max-w-[16rem]"
        aria-label={`Sort results by ${sortOptionLabel}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <span className="shrink-0 text-muted-foreground">Sort by</span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            <SelectValue placeholder="Choose order" />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="pl-2 pr-2 text-xs font-semibold text-muted-foreground">Sort results</SelectLabel>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  return (
    <div
      className="min-w-0 max-w-full rounded-xl border border-border/60 bg-background/75 p-3 backdrop-blur-sm sm:p-4"
      aria-label="Explore filters"
    >
      <div className="flex min-w-0 max-w-full flex-col gap-3">
        {contentTypeSegment}
        <div className="flex min-w-0 max-w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          {tags.length > 0 ? (
            <div className="w-full shrink-0 lg:w-auto">{topicDropdown}</div>
          ) : null}
          <div className="min-w-0 shrink-0">{sortSelect}</div>
          <div className="min-w-0 w-full max-w-full flex-1 basis-0">
            {searchForm}
          </div>
        </div>
      </div>
    </div>
  );
}
