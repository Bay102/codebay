"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import type { TablesInsert, TablesUpdate } from "@/lib/database";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type PostStatus = "draft" | "published";

export interface BlogPostEditorValues {
  id?: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  authorName: string;
  readTimeMinutes: string;
  tagsInput: string;
  sectionHeading: string;
  sectionBody: string;
  isFeatured: boolean;
  status: PostStatus;
}

type BlogPostEditorFormProps = {
  mode: "create" | "edit";
  initialValues: BlogPostEditorValues;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogPostEditorForm({ mode, initialValues }: BlogPostEditorFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [form, setForm] = useState<BlogPostEditorValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFieldChange = <Key extends keyof BlogPostEditorValues>(key: Key, value: BlogPostEditorValues[Key]) => {
    setForm((previous) => {
      if (key === "title") {
        const nextTitle = value as string;
        const nextSlug = previous.slug || slugify(nextTitle);
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

    const {
      data: { session }
    } = await supabase.auth.getSession();

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
    const tags = form.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const sectionHeading = form.sectionHeading.trim() || normalizedTitle;
    const paragraphs = form.sectionBody
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const sections = paragraphs.length > 0 ? [{ heading: sectionHeading, paragraphs }] : [];

    setIsSubmitting(true);
    const publishedAt = form.status === "published" ? new Date().toISOString() : null;

    if (mode === "create") {
      const payload: TablesInsert<"blog_posts"> = {
        slug: normalizedSlug,
        title: normalizedTitle,
        description: form.description.trim() || null,
        excerpt: form.excerpt.trim() || null,
        author_id: session.user.id,
        author_name: form.authorName.trim() || "CodeBay Team",
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
      author_name: form.authorName.trim() || "CodeBay Team",
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
    <section className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
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
              Description
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
              Author name
            </label>
            <input
              id="post-author"
              value={form.authorName}
              onChange={(event) => handleFieldChange("authorName", event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
            <label htmlFor="post-tags" className="text-sm font-medium">
              Tags
            </label>
            <input
              id="post-tags"
              value={form.tagsInput}
              onChange={(event) => handleFieldChange("tagsInput", event.target.value)}
              placeholder="React, TypeScript, Supabase"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="post-section-heading" className="text-sm font-medium">
            Section heading
          </label>
          <input
            id="post-section-heading"
            value={form.sectionHeading}
            onChange={(event) => handleFieldChange("sectionHeading", event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="post-section-body" className="text-sm font-medium">
            Body
          </label>
          <textarea
            id="post-section-body"
            value={form.sectionBody}
            onChange={(event) => handleFieldChange("sectionBody", event.target.value)}
            placeholder={"Separate paragraphs with a blank line."}
            rows={12}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => handleFieldChange("isFeatured", event.target.checked)}
            />
            Feature this post
          </label>

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
        </div>

        {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
        {success ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{success}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/dashboard/blog"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : form.status === "published" ? "Save & publish" : "Save draft"}
          </button>
        </div>
      </form>
    </section>
  );
}
