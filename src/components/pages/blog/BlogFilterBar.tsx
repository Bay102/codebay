"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 280;

type BlogFilterBarProps = {
  tags: string[];
};

export function BlogFilterBar({ tags }: BlogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag") ?? "";
  const queryParam = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);

  useEffect(() => {
    setSearchInput(queryParam);
    setDebouncedQuery(queryParam);
  }, [queryParam]);

  const activeTag = tags.includes(tagParam) ? tagParam : "";
  const hasActiveFilters = !!activeTag || !!debouncedQuery;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set("q", debouncedQuery);
    else params.delete("q");
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/blog?${next}` : "/blog", { scroll: false });
    }
  }, [debouncedQuery, router, searchParams]);

  const setTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag && tags.includes(tag)) params.set("tag", tag);
      else params.delete("tag");
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const next = params.toString();
      router.replace(next ? `/blog?${next}` : "/blog", { scroll: false });
    },
    [router, searchParams, tags]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    router.replace("/blog", { scroll: false });
  }, [router]);

  if (tags.length === 0) return null;

  return (
    <section
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-4"
      aria-label="Filter blog posts"
    >
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search articles..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 pl-9 pr-3 text-sm"
          aria-label="Search blog posts by title or content"
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1.5 sm:flex-nowrap sm:overflow-x-auto sm:pb-1">
          {tags.map((tag) => {
            const isActive = tag === activeTag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setTag(isActive ? "" : tag)}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-pressed={isActive}
                aria-label={isActive ? `Remove filter: ${tag}` : `Filter by ${tag}`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
