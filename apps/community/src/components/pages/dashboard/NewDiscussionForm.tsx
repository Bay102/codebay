"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createDiscussion, slugifyTitle } from "@/lib/discussions";
import type { TagOption } from "@/lib/tags";
import { useAuth } from "@/contexts/AuthContext";
import { TopicSelector } from "@/components/shared/TopicSelector";
import { DiscussionRichTextEditor } from "@/components/pages/dashboard/discussions/DiscussionRichTextEditor";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

type NewDiscussionFormProps = {
  authorName: string;
  /** Preset tags to choose from. When provided, a tag multi-select is shown. */
  allowedTags?: TagOption[];
  /** When false, hides the Cancel button (for inline usage). Defaults to true. */
  showCancelButton?: boolean;
  /** Called when Cancel is clicked. If not provided, Cancel calls router.back(). */
  onCancel?: () => void;
};

export function NewDiscussionForm({
  authorName,
  allowedTags = [],
  showCancelButton = true,
  onCancel
}: NewDiscussionFormProps) {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicSelectorTags = useMemo(
    () => allowedTags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    [allowedTags]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !title.trim() || !body.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const baseSlug = slugifyTitle(title);
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const tags = allowedTags.length > 0 ? selectedTagNames.filter((n) => n) : [];
      const result = await createDiscussion(supabase, {
        authorId: user.id,
        title: title.trim(),
        body: body.trim(),
        slug,
        tags
      });
      if (!result) {
        setError("Failed to create discussion. Try again.");
        return;
      }
      router.push(`/discussions/${result.slug}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="discussion-title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="discussion-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to discuss?"
          required
          maxLength={200}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          disabled={isSubmitting}
        />
      </div>
      {allowedTags.length > 0 ? (
        <div>
          <span className="mb-2 block text-sm font-medium text-foreground" id="discussion-tags-label">
            Topics
          </span>
          <TopicSelector
            allowedTags={topicSelectorTags}
            selectedNames={selectedTagNames}
            onChange={setSelectedTagNames}
            contextTitle={title}
            contextBody={body}
            maxQuickTopics={4}
            disabled={isSubmitting}
          />
        </div>
      ) : null}
      <DiscussionRichTextEditor id="discussion-body" value={body} onChange={setBody} disabled={isSubmitting} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FocusButton
          type="submit"
          disabled={isSubmitting || !title.trim() || !body.trim()}
          colorVariant="primary"
          borderVariant="bordered"
          radiusVariant="square"
          sizeVariant="sm"
        >
          {isSubmitting ? "Creating…" : "Create discussion"}
        </FocusButton>
        {showCancelButton ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

