"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/lib/database";
import { AdminSignInForm } from "@/components/pages/admin/AdminSignInForm";
import { AdminSessionLoading } from "@/components/pages/admin/AdminSessionLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

type PostStatus = "draft" | "published";

interface BlogFormState {
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

const initialFormState: BlogFormState = {
  title: "",
  slug: "",
  description: "",
  excerpt: "",
  authorName: "CodeBay Team",
  readTimeMinutes: "6",
  tagsInput: "",
  sectionHeading: "",
  sectionBody: "",
  isFeatured: false,
  status: "draft"
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const AdminBlogView = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [form, setForm] = useState<BlogFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setAuthError(sessionError.message);
      }

      setSession(data.session ?? null);
      setIsAuthLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setAuthError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthError(null);

      const normalizedEmail = loginEmail.trim();
      if (!normalizedEmail || !loginPassword) {
        setAuthError("Please enter both email and password.");
        return;
      }

      setIsSigningIn(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: loginPassword
      });

      if (signInError) {
        setAuthError(signInError.message);
      } else {
        setLoginPassword("");
      }

      setIsSigningIn(false);
    },
    [loginEmail, loginPassword]
  );

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    setIsSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setAuthError(signOutError.message);
    }
    setIsSigningOut(false);
  }, []);

  const handleFieldChange = <Key extends keyof BlogFormState>(key: Key, value: BlogFormState[Key]) => {
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
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!form.title.trim()) {
      setSubmitError("Title is required.");
      return;
    }

    const normalizedSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);
    if (!normalizedSlug) {
      setSubmitError("Slug is required.");
      return;
    }

    const readTime = Number.parseInt(form.readTimeMinutes, 10);
    const safeReadTime = Number.isFinite(readTime) && readTime > 0 ? readTime : 6;

    const tags =
      form.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0) ?? [];

    const nowIso = new Date().toISOString();
    const publishedAt = form.status === "published" ? nowIso : null;

    const sectionHeading = form.sectionHeading.trim() || form.title.trim();
    const sectionBody = form.sectionBody.trim();

    const paragraphs =
      sectionBody.length === 0
        ? []
        : sectionBody
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph.length > 0);

    const sections =
      paragraphs.length > 0
        ? [
            {
              heading: sectionHeading,
              paragraphs
            }
          ]
        : [];

    setIsSubmitting(true);

    const payload: TablesInsert<"blog_posts"> = {
      slug: normalizedSlug,
      title: form.title.trim(),
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

    const { error } = await supabase.from("blog_posts").insert(payload);

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message ?? "Unable to save blog post.");
      return;
    }

    setSubmitSuccess(
      form.status === "published"
        ? "Post saved and published successfully."
        : "Post saved as draft successfully."
    );
    setForm(initialFormState);
  };

  if (isAuthLoading) {
    return <AdminSessionLoading />;
  }

  if (!session) {
    return (
      <AdminSignInForm
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        authError={authError}
        isSigningIn={isSigningIn}
        onLoginEmailChange={setLoginEmail}
        onLoginPasswordChange={setLoginPassword}
        onSubmit={handleSignIn}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="glass-nav flex flex-col justify-between gap-4 rounded-2xl border border-border/60 p-5 sm:p-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-primary/80 text-xs font-semibold tracking-[0.16em] uppercase">
              Admin Blog
            </p>
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Create article
            </h1>
            <p className="text-sm text-muted-foreground">
              Draft and publish blog posts that power the public blog at{" "}
              <Link href="/blog" className="underline underline-offset-4 hover:text-primary">
                /blog
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-xs text-muted-foreground">
              Signed in as {session.user.email ?? "authenticated user"}
            </p>
            <div className="flex gap-2">
              <Link
                href="/admin/leads"
                className="inline-flex items-center rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70"
              >
                Leads dashboard
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card/70 p-5 sm:p-6">
          <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={form.title}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  placeholder="Shipping MVP Features With Confidence"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-slug">Slug</Label>
                <Input
                  id="blog-slug"
                  value={form.slug}
                  onChange={(event) => handleFieldChange("slug", event.target.value)}
                  placeholder="shipping-mvp-features-with-confidence"
                />
                <p className="text-[11px] text-muted-foreground">
                  Auto-generated from title if left blank.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="blog-description">Description (SEO)</Label>
                <Textarea
                  id="blog-description"
                  value={form.description}
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  placeholder="Concise 1–2 sentence description used for search and social previews."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-excerpt">Excerpt (intro)</Label>
                <Textarea
                  id="blog-excerpt"
                  value={form.excerpt}
                  onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                  placeholder="Short intro paragraph that appears in blog lists and at the top of the article."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="blog-author">Author</Label>
                <Input
                  id="blog-author"
                  value={form.authorName}
                  onChange={(event) => handleFieldChange("authorName", event.target.value)}
                  placeholder="CodeBay Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-read-time">Read time (minutes)</Label>
                <Input
                  id="blog-read-time"
                  type="number"
                  min={1}
                  value={form.readTimeMinutes}
                  onChange={(event) => handleFieldChange("readTimeMinutes", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-tags">Tags</Label>
                <Input
                  id="blog-tags"
                  value={form.tagsInput}
                  onChange={(event) => handleFieldChange("tagsInput", event.target.value)}
                  placeholder="AI Development, Product Engineering, SEO"
                />
                <p className="text-[11px] text-muted-foreground">
                  Comma-separated. Used for metadata and filtering.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-section-heading">Section heading</Label>
              <Input
                id="blog-section-heading"
                value={form.sectionHeading}
                onChange={(event) => handleFieldChange("sectionHeading", event.target.value)}
                placeholder="Why Discovery Usually Bottlenecks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-section-body">Body</Label>
              <Textarea
                id="blog-section-body"
                value={form.sectionBody}
                onChange={(event) => handleFieldChange("sectionBody", event.target.value)}
                placeholder={"Write the main content for this article.\n\nSeparate paragraphs with a blank line."}
                rows={10}
              />
              <p className="text-[11px] text-muted-foreground">
                For now this creates a single content section. Paragraphs are split on blank lines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="blog-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => handleFieldChange("isFeatured", checked)}
                />
                <Label htmlFor="blog-featured" className="text-sm">
                  Feature this post on the blog homepage
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="blog-status" className="text-sm">
                  Status
                </Label>
                <select
                  id="blog-status"
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  value={form.status}
                  onChange={(event) => handleFieldChange("status", event.target.value as PostStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            {submitSuccess ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                {submitSuccess}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : form.status === "published" ? "Save & publish" : "Save draft"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminBlogView;

