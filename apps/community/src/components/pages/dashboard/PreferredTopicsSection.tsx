"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Input, Tag } from "@codebay/ui";
import { setPreferredTagsAction } from "@/lib/actions";
import type { TagOption } from "@/lib/tags";

type PreferredTopicsSectionProps = {
  allowedTags: TagOption[];
  initialPreferredTagIds: string[];
};

export function PreferredTopicsSection({ allowedTags, initialPreferredTagIds }: PreferredTopicsSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialPreferredTagIds));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const followedTags = useMemo(() => {
    return allowedTags
      .filter((tag) => selectedIds.has(tag.id))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allowedTags, selectedIds]);

  const addCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const unfollowed = allowedTags.filter((tag) => !selectedIds.has(tag.id));
    if (!q) {
      return [];
    }
    return unfollowed
      .filter(
        (tag) => tag.name.toLowerCase().includes(q) || tag.slug.toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allowedTags, selectedIds, searchQuery]);

  const allFollowed = followedTags.length === allowedTags.length && allowedTags.length > 0;

  const handleChange = async (nextIds: string[]) => {
    setSelectedIds(new Set(nextIds));
    setMessage(null);
    setIsSaving(true);
    const result = await setPreferredTagsAction(nextIds);
    setIsSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Preferences saved." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to save." });
    }
  };

  const removeFollowed = (id: string) => {
    void handleChange([...selectedIds].filter((x) => x !== id));
  };

  const addTopic = (id: string) => {
    void handleChange([...selectedIds, id]);
  };

  if (allowedTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Topics you follow</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Used to show relevant discussions, blog posts and profiles.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Following
        </h4>
        {followedTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You are not following any topics yet. Search below to add some.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Topics you follow">
            {followedTags.map((tag) => (
              <li key={tag.id}>
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 py-1 pl-3 pr-1 text-xs font-medium text-foreground/90">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeFollowed(tag.id)}
                    disabled={isSaving}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
                    aria-label={`Stop following ${tag.name}`}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-border/60 pt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Find topics to follow
        </h4>
        <p className="text-xs text-muted-foreground">
          Search the topic catalog, then choose a tag to add it to your followed list.
        </p>
        {allFollowed ? (
          <p className="text-sm text-muted-foreground">You are following every available topic.</p>
        ) : (
          <>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic name…"
                disabled={isSaving}
                className="h-10 pl-9"
                aria-label="Search topics to follow"
                autoComplete="off"
              />
            </div>
            {searchQuery.trim() === "" ? (
              <p className="text-sm text-muted-foreground">Type a name to see matching topics.</p>
            ) : addCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching topics to add.</p>
            ) : (
              <div
                className="flex flex-wrap gap-2 pb-1"
                role="group"
                aria-label="Topics you can follow"
              >
                {addCandidates.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTopic(tag.id)}
                    disabled={isSaving}
                    className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-70"
                    aria-label={`Follow ${tag.name}`}
                  >
                    <Tag variant="pill" size="lg" className="inline-flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-primary" aria-hidden />
                      {tag.name}
                    </Tag>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {message ? (
        <p
          className={`text-xs ${message.type === "success" ? "text-emerald-600" : "text-destructive"}`}
          role="status"
          aria-live="polite"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
