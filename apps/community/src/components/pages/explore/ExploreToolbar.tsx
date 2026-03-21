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
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@codebay/ui";
import type { TagOption } from "@/lib/tags";
import type { ExploreContentType } from "@/lib/explore";

const AUTHOR_ALL = "__all__";

export type ExploreAuthorOption = {
  id: string;
  label: string;
};

export type ExploreToolbarProps = {
  tags: TagOption[];
  contentType: ExploreContentType;
  initialQuery?: string;
  initialTag?: string | null;
  initialAuthorId?: string | null;
  authorOptions: ExploreAuthorOption[];
};

export function ExploreToolbar({
  tags,
  contentType,
  initialQuery = "",
  initialTag = null,
  initialAuthorId = null,
  authorOptions
}: ExploreToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTag = initialTag ?? searchParams.get("tag");
  const currentQuery = initialQuery ?? searchParams.get("q") ?? "";
  const currentAuthor = initialAuthorId;

  const setExploreParams = useCallback(
    (updates: {
      type?: ExploreContentType;
      q?: string;
      tag?: string | null;
      author?: string | null;
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
      if (updates.author !== undefined) {
        if (updates.author) next.set("author", updates.author);
        else next.delete("author");
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

  const typeButtons = (
    <div
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      role="group"
      aria-label="Content type"
    >
      <Button
        type="button"
        variant={contentType === "discussions" ? "default" : "secondary"}
        size="sm"
        className="h-10 w-full sm:w-auto"
        onClick={() => setExploreParams({ type: "discussions" })}
        disabled={isPending}
      >
        Discussions
      </Button>
      <Button
        type="button"
        variant={contentType === "blogs" ? "default" : "secondary"}
        size="sm"
        className="h-10 w-full sm:w-auto"
        onClick={() => setExploreParams({ type: "blogs" })}
        disabled={isPending}
      >
        Blog posts
      </Button>
    </div>
  );

  const authorSelect =
    authorOptions.length > 0 ? (
      <Select
        value={currentAuthor ?? AUTHOR_ALL}
        onValueChange={(value) => {
          if (value === AUTHOR_ALL) setExploreParams({ author: null });
          else setExploreParams({ author: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          className="h-10 w-full shrink-0 sm:max-w-[9rem] lg:w-[9rem]"
          aria-label="Filter by author"
        >
          <SelectValue placeholder="Author" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTHOR_ALL}>All authors</SelectItem>
          {authorOptions.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : null;

  return (
    <div
      className="min-w-0 max-w-full rounded-xl border border-border/60 bg-background/75 p-3 backdrop-blur-sm sm:p-4"
      aria-label="Explore filters"
    >
      <div className="flex min-w-0 max-w-full flex-col gap-3">
        {typeButtons}
        <div className="flex min-w-0 max-w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          {tags.length > 0 ? (
            <div className="w-full shrink-0 lg:w-auto">{topicDropdown}</div>
          ) : null}
          {authorSelect ? <div className="min-w-0 shrink-0">{authorSelect}</div> : null}
          <div className="min-w-0 w-full max-w-full flex-1 basis-0">
            {searchForm}
          </div>
        </div>
      </div>
    </div>
  );
}
