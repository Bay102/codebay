"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  setNewsletterMutedFollowsAction,
  setNewsletterSettingsAction,
  type NewsletterDigestFrequency,
  type NewsletterSettingsState,
} from "@/lib/newsletter";
import type { FollowProfileRow } from "@/lib/follows";

type NewsletterPreferencesSectionProps = {
  followingUsers: FollowProfileRow[];
  initialSettings: NewsletterSettingsState;
  defaultOpen?: boolean;
};

const frequencyOptions: Array<{
  value: NewsletterDigestFrequency;
  label: string;
}> = [
  { value: "none", label: "Do not send emails" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export function NewsletterPreferencesSection({
  followingUsers,
  initialSettings,
  defaultOpen = false,
}: NewsletterPreferencesSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [frequency, setFrequency] = useState<NewsletterDigestFrequency>(
    initialSettings.frequency,
  );
  const [includeBlog, setIncludeBlog] = useState(initialSettings.includeBlog);
  const [includeDiscussions, setIncludeDiscussions] = useState(
    initialSettings.includeDiscussions,
  );
  const [search, setSearch] = useState("");
  const [includedFollowingIds, setIncludedFollowingIds] = useState<Set<string>>(
    () =>
      new Set(
        followingUsers
          .map((user) => user.id)
          .filter((id) => !initialSettings.mutedFollowingIds.includes(id)),
      ),
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingFollows, setIsSavingFollows] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredFollowing = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    if (!phrase) return followingUsers;
    return followingUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(phrase) ||
        user.username.toLowerCase().includes(phrase)
      );
    });
  }, [followingUsers, search]);

  const handleSaveSettings = async () => {
    setMessage(null);
    setIsSavingSettings(true);
    const result = await setNewsletterSettingsAction({
      frequency,
      includeBlog,
      includeDiscussions,
    });
    setIsSavingSettings(false);
    if (!result.success) {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to save newsletter settings.",
      });
      return;
    }
    setMessage({ type: "success", text: "Newsletter settings saved." });
  };

  const handleSaveFollows = async () => {
    setMessage(null);
    setIsSavingFollows(true);
    const mutedFollowingIds = followingUsers
      .map((user) => user.id)
      .filter((followingId) => !includedFollowingIds.has(followingId));
    const result = await setNewsletterMutedFollowsAction(mutedFollowingIds);
    setIsSavingFollows(false);
    if (!result.success) {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to save followed creator preferences.",
      });
      return;
    }
    setMessage({
      type: "success",
      text: "Followed creator preferences saved.",
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="newsletter-preferences-content"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Newsletter preferences
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure digest frequency and choose which followed creators are
            included.
          </p>
        </div>
        {isOpen ? (
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : (
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        )}
      </button>

      <div
        id="newsletter-preferences-content"
        className="space-y-5"
        hidden={!isOpen}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Frequency
            </span>
            <select
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value as NewsletterDigestFrequency)
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={isSavingSettings}
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 rounded-md border border-border/70 bg-background/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Include in digest
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeBlog}
                onChange={(event) => setIncludeBlog(event.target.checked)}
                disabled={isSavingSettings}
              />
              Blog posts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeDiscussions}
                onChange={(event) =>
                  setIncludeDiscussions(event.target.checked)
                }
                disabled={isSavingSettings}
              />
              Discussion posts
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSaveSettings()}
            disabled={isSavingSettings}
            className="inline-flex h-9 items-center rounded-md border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingSettings ? "Saving..." : "Save settings"}
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Followed creators
            </p>
            <p className="text-xs text-muted-foreground">
              Uncheck anyone you do not want included in your digest.
            </p>
          </div>

          {followingUsers.length > 0 ? (
            <>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search followed creators..."
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                disabled={isSavingFollows}
              />
              <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-border/70 bg-background/60 p-3">
                {filteredFollowing.map((user) => {
                  const isIncluded = includedFollowingIds.has(user.id);
                  return (
                    <label
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/50 px-3 py-2 text-sm"
                    >
                      <span className="truncate">
                        <span className="font-medium text-foreground">
                          {user.name}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          @{user.username}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setIncludedFollowingIds((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(user.id);
                            else next.delete(user.id);
                            return next;
                          });
                        }}
                        disabled={isSavingFollows}
                      />
                    </label>
                  );
                })}
                {filteredFollowing.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No followed creators match your search.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void handleSaveFollows()}
                disabled={isSavingFollows}
                className="inline-flex h-9 items-center rounded-md border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingFollows ? "Saving..." : "Save followed creators"}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              You are not following anyone yet. Follow creators to include their
              updates in your digest.
            </p>
          )}
        </div>

        {message ? (
          <p
            className={`text-xs ${message.type === "success" ? "text-emerald-600" : "text-destructive"}`}
            role="status"
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
