"use client";

import { useMemo, useState } from "react";
import { Tag, cn } from "@codebay/ui";

export type TopicSelectorTag = {
  id: string;
  name: string;
  slug: string;
};

type TopicSelectorProps = {
  /** Full list of tags that can be selected. */
  allowedTags: TopicSelectorTag[];
  /** Currently selected tag names. */
  selectedNames: string[];
  /** Called whenever the selected tag names change. */
  onChange: (nextSelectedNames: string[]) => void;
  /** Optional context used to power quick topic suggestions. */
  contextTitle?: string;
  contextBody?: string;
  /** Whether selection is disabled. */
  disabled?: boolean;
  /** Maximum number of quick topic suggestions to show. */
  maxQuickTopics?: number;
};

function normalizeTokens(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function TopicSelector({
  allowedTags,
  selectedNames,
  onChange,
  contextTitle,
  contextBody,
  disabled,
  maxQuickTopics = 10
}: TopicSelectorProps) {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedNames), [selectedNames]);

  const quickTopics = useMemo(() => {
    if (!allowedTags.length) return [];

    const titleTokens = normalizeTokens(contextTitle);
    const bodyTokens = normalizeTokens(contextBody);
    const allTokens = new Set([...titleTokens, ...bodyTokens]);

    if (allTokens.size === 0) {
      return allowedTags.slice(0, maxQuickTopics);
    }

    const scores = allowedTags.map((tag) => {
      const tagTokens = normalizeTokens(tag.name);
      let score = 0;
      for (const token of tagTokens) {
        if (allTokens.has(token)) {
          score += 1;
        }
      }
      return { tag, score };
    });

    scores.sort((a, b) => b.score - a.score || a.tag.name.localeCompare(b.tag.name));
    const withScore = scores.filter((entry) => entry.score > 0).map((entry) => entry.tag);

    if (withScore.length === 0) {
      return allowedTags.slice(0, maxQuickTopics);
    }

    return withScore.slice(0, maxQuickTopics);
  }, [allowedTags, contextTitle, contextBody, maxQuickTopics]);

  const filteredDropdownOptions = useMemo(() => {
    const base = allowedTags.filter((tag) => !selectedSet.has(tag.name));
    if (!query.trim()) {
      return base.slice(0, 8);
    }
    const lower = query.toLowerCase();
    return base
      .filter((tag) => tag.name.toLowerCase().includes(lower) || tag.slug.toLowerCase().includes(lower))
      .slice(0, 12);
  }, [allowedTags, selectedSet, query]);

  const handleToggleName = (name: string) => {
    if (disabled) return;
    const next = new Set(selectedSet);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onChange([...next]);
  };

  const handleAddName = (name: string) => {
    if (disabled) return;
    if (selectedSet.has(name)) return;
    onChange([...selectedNames, name]);
    setQuery("");
  };

  const showQuickTopics = quickTopics.length > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-3">
        {showQuickTopics ? (
          <div className="flex min-w-0 flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {quickTopics.map((tag) => {
                const isSelected = selectedSet.has(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleName(tag.name)}

                  >
                    <Tag
                      variant="pill"
                      size="md"
                      className={cn(
                        isSelected && "text-primary"
                      )}
                    >
                      {tag.name}
                    </Tag>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium text-muted-foreground">Search all topics</p>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => {
                // Delay closing slightly so click events can fire.
                setTimeout(() => setIsDropdownOpen(false), 120);
              }}
              placeholder="Search topics…"
              disabled={disabled}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
            />
            {isDropdownOpen ? (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover text-xs shadow-lg sm:text-sm">
                {filteredDropdownOptions.length === 0 ? (
                  <p className="px-3 py-2 text-muted-foreground">No topics found.</p>
                ) : (
                  <ul className="py-1">
                    {filteredDropdownOptions.map((tag) => (
                      <li key={tag.id}>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleAddName(tag.name)}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span>{tag.name}</span>
                          <span className="ml-2 text-[11px] text-muted-foreground">Add</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

