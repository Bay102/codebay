"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  getBlogSectionParagraphsFromContent
} from "@codebay/ui";
import { BlogPostPreviewDialog } from "./BlogPostPreviewDialog";
import type { TablesInsert, TablesUpdate } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { TopicSelector } from "@/components/shared/TopicSelector";
import { BlogRichTextEditor } from "./BlogRichTextEditor";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

type PostStatus = "draft" | "published";

export interface BlogPostSectionDraft {
  id: string;
  heading: string;
  /**
   * Rich text content stored as a string (plain text or HTML).
   * The form is responsible for converting this into paragraphs for persistence.
   */
  content: string;
}

export interface BlogPostEditorValues {
  id?: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  authorName: string;
  readTimeMinutes: string;
  tagsInput: string;
  sections: BlogPostSectionDraft[];
  isFeatured: boolean;
  status: PostStatus;
}

export type TagOption = {
  id: string;
  name: string;
  slug: string;
};

type BlogPostEditorFormProps = {
  mode: "create" | "edit";
  initialValues: BlogPostEditorValues;
  /** Preset tags to choose from; when provided, UI is multi-select instead of free text. */
  allowedTags?: TagOption[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Mirrors submit-time section shaping so preview matches the published post body. */
function buildPreviewSections(form: BlogPostEditorValues): { heading: string; paragraphs: string[] }[] {
  const normalizedTitle = form.title.trim() || "Untitled";
  const uiSections =
    form.sections.length > 0
      ? form.sections
      : [
          {
            id: "section-1",
            heading: "",
            content: ""
          }
        ];

  return uiSections
    .map((section) => ({
      heading: (section.heading || "").trim(),
      content: (section.content || "").trim()
    }))
    .map(({ heading, content }) => {
      const effectiveHeading = heading || normalizedTitle;
      const paragraphs = getBlogSectionParagraphsFromContent(content);
      return { heading: effectiveHeading, paragraphs };
    })
    .filter((section) => section.paragraphs.length > 0);
}

export function BlogPostEditorForm({ mode, initialValues, allowedTags = [] }: BlogPostEditorFormProps) {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const [form, setForm] = useState<BlogPostEditorValues>(() => {
    const hasSections = Array.isArray(initialValues.sections) && initialValues.sections.length > 0;
    if (hasSections) {
      return initialValues;
    }

    return {
      ...initialValues,
      sections: [
        {
          id: "section-1",
          heading: "",
          content: ""
        }
      ]
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getAuthorIdentifier = () => {
    const metadataUsername =
      typeof session?.user.user_metadata?.username === "string"
        ? session.user.user_metadata.username.trim()
        : "";
    const metadataName =
      typeof session?.user.user_metadata?.name === "string"
        ? session.user.user_metadata.name.trim()
        : "";

    if (metadataUsername) return metadataUsername;
    if (metadataName) return metadataName;
    return form.authorName.trim() || session?.user.email || "CodeBay Team";
  };

  const getDisplayAuthorName = () => {
    const identifier = getAuthorIdentifier();
    if (!identifier) return "";

    return identifier
      .split(/\s+/)
      .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
      .join(" ");
  };

  const selectedTagNames = form.tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const topicSelectorTags = useMemo(
    () => allowedTags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
    [allowedTags]
  );

  const previewReadTimeMinutes = useMemo(() => {
    const readTime = Number.parseInt(form.readTimeMinutes, 10);
    return Number.isFinite(readTime) && readTime > 0 ? readTime : 6;
  }, [form.readTimeMinutes]);

  const handleSectionsChange = (nextSections: BlogPostSectionDraft[]) => {
    setForm((previous) => ({
      ...previous,
      sections: nextSections
    }));
  };

  const handleFieldChange = <Key extends keyof BlogPostEditorValues>(key: Key, value: BlogPostEditorValues[Key]) => {
    setForm((previous) => {
      if (key === "title") {
        const nextTitle = value as string;
        const slugFromPreviousTitle = slugify(previous.title);
        const slugIsAutoGenerated =
          !previous.slug || previous.slug === slugFromPreviousTitle;
        const nextSlug = slugIsAutoGenerated ? slugify(nextTitle) : previous.slug;
        return { ...previous, title: nextTitle, slug: nextSlug };
      }
      return { ...previous, [key]: value };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Supabase is not configured in this environment.");
      return;
    }

    if (!session) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const normalizedTitle = form.title.trim();
    if (!normalizedTitle) {
      setError("Title is required.");
      return;
    }

    const normalizedSlug = form.slug.trim() ? slugify(form.slug) : slugify(normalizedTitle);
    if (!normalizedSlug) {
      setError("Slug is required.");
      return;
    }

    const readTime = Number.parseInt(form.readTimeMinutes, 10);
    const safeReadTime = Number.isFinite(readTime) && readTime > 0 ? readTime : 6;
    const allowedNames = new Set(allowedTags.map((t) => t.name));
    const tags = form.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((name) => (allowedTags.length > 0 ? allowedNames.has(name) : true));

    const uiSections = (form.sections.length > 0
      ? form.sections
      : [
        {
          id: "section-1",
          heading: "",
          content: ""
        }
      ]
    ).map((section) => ({
      heading: (section.heading || "").trim(),
      content: (section.content || "").trim()
    }));

    const sections = uiSections
      .map(({ heading, content }) => {
        const effectiveHeading = heading || normalizedTitle;
        const paragraphs = getBlogSectionParagraphsFromContent(content);

        return {
          heading: effectiveHeading,
          paragraphs
        };
      })
      .filter((section) => section.paragraphs.length > 0);

    setIsSubmitting(true);
    const publishedAt = form.status === "published" ? new Date().toISOString() : null;
    const authorIdentifier = getAuthorIdentifier();

    if (mode === "create") {
      const payload: TablesInsert<"blog_posts"> = {
        slug: normalizedSlug,
        title: normalizedTitle,
        description: form.description.trim() || null,
        excerpt: form.excerpt.trim() || null,
        author_id: session.user.id,
        author_name: authorIdentifier,
        read_time_minutes: safeReadTime,
        tags,
        sections,
        is_featured: form.isFeatured,
        status: form.status,
        published_at: publishedAt
      };

      const { data, error: insertError } = await supabase.from("blog_posts").insert(payload).select("id").single();
      setIsSubmitting(false);

      if (insertError) {
        setError(insertError.message ?? "Unable to save your post.");
        return;
      }

      setSuccess(form.status === "published" ? "Post published successfully." : "Draft saved successfully.");
      if (data?.id) {
        router.push(`/dashboard/blog/edit/${data.id}`);
        router.refresh();
      }
      return;
    }

    if (!form.id) {
      setIsSubmitting(false);
      setError("This post is missing an ID and cannot be updated.");
      return;
    }

    const payload: TablesUpdate<"blog_posts"> = {
      slug: normalizedSlug,
      title: normalizedTitle,
      description: form.description.trim() || null,
      excerpt: form.excerpt.trim() || null,
      author_name: authorIdentifier,
      read_time_minutes: safeReadTime,
      tags,
      sections,
      is_featured: form.isFeatured,
      status: form.status,
      published_at: publishedAt
    };

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", form.id)
      .eq("author_id", session.user.id);

    setIsSubmitting(false);
    if (updateError) {
      setError(updateError.message ?? "Unable to update this post.");
      return;
    }

    setSuccess(form.status === "published" ? "Post updated and published." : "Draft updated.");
    router.refresh();
  };

  return (
    <section className="border border-border/70 bg-card/70 p-5 sm:p-6">
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="post-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="post-title"
              value={form.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="A practical guide to shipping product features"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="post-slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="post-slug"
              value={form.slug}
              onChange={(event) => handleFieldChange("slug", event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="practical-guide-shipping-features"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="post-description" className="text-sm font-medium">
              Intro
            </label>
            <textarea
              id="post-description"
              value={form.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="post-excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="post-excerpt"
              value={form.excerpt}
              onChange={(event) => handleFieldChange("excerpt", event.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="post-author" className="text-sm font-medium">
              Author
            </label>
            <input
              id="post-author"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder={getDisplayAuthorName()}
              disabled
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="post-read-time" className="text-sm font-medium">
              Read time (minutes)
            </label>
            <input
              id="post-read-time"
              type="number"
              min={1}
              value={form.readTimeMinutes}
              onChange={(event) => handleFieldChange("readTimeMinutes", event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium" id="post-tags-label">
              Tags
            </span>
            {allowedTags.length > 0 ? (
              <>
                <Dialog open={isTagsDialogOpen} onOpenChange={setIsTagsDialogOpen}>
                  <button
                    type="button"
                    className="inline-flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs text-muted-foreground sm:text-sm"
                    onClick={() => setIsTagsDialogOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={isTagsDialogOpen}
                    aria-labelledby="post-tags-label"
                  >
                    <span className="truncate text-left text-foreground">
                      {selectedTagNames.length === 0 ? "No tags selected" : selectedTagNames.join(", ")}
                    </span>
                    <span className="ml-2 text-[11px] text-muted-foreground sm:text-xs">Edit</span>
                  </button>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Select tags for this post</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 space-y-4">
                      <p className="text-xs text-muted-foreground">
                        Choose one or more tags that describe this post. Use quick topics or search all topics.
                      </p>
                      <TopicSelector
                        allowedTags={topicSelectorTags}
                        selectedNames={selectedTagNames}
                        onChange={(next) => handleFieldChange("tagsInput", next.join(", "))}
                        contextTitle={form.title}
                        contextBody={form.description}
                        disabled={isSubmitting}
                      />
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Done
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <input
                id="post-tags"
                value={form.tagsInput}
                onChange={(event) => handleFieldChange("tagsInput", event.target.value)}
                placeholder="React, TypeScript, Supabase"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                aria-labelledby="post-tags-label"
              />
            )}
          </div>
        </div>

        <BlogRichTextEditor sections={form.sections} onChange={handleSectionsChange} disabled={isSubmitting} />
        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => handleFieldChange("isFeatured", event.target.checked)}
            />
            Feature this blog post
          </label>
        </div>

        {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
        {success ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{success}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
          <label htmlFor="post-status" className="inline-flex items-center gap-2 text-sm">
            Status
            <select
              id="post-status"
              value={form.status}
              onChange={(event) => handleFieldChange("status", event.target.value as PostStatus)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Preview blog post"
            >
              Preview
            </Button>
            <FocusButton
              type="submit"
              radiusVariant="small"
              colorVariant="primary"
              borderVariant="bordered"
              sizeVariant="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : form.status === "published" ? "Save & publish" : "Save draft"}
            </FocusButton>
          </div>
        </div>
      </form>
      <BlogPostPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={form.title}
        excerpt={form.excerpt}
        authorName={getDisplayAuthorName() || getAuthorIdentifier()}
        readTimeMinutes={previewReadTimeMinutes}
        tags={selectedTagNames}
        sections={buildPreviewSections(form)}
      />
    </section>
  );
}
