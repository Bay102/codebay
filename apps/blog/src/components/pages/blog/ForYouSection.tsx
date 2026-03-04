"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SurfaceCard } from "@codebay/ui";
import { useAuth } from "@/contexts/AuthContext";
import { communityUrl } from "@/lib/site-urls";

type ForYouPost = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
};

function buildAuthorSegment(authorName: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function ForYouSection() {
  const { supabase, user } = useAuth();
  const [posts, setPosts] = useState<ForYouPost[]>([]);
  const [status, setStatus] = useState<"loading" | "empty" | "ready" | "signed-out">("loading");

  useEffect(() => {
    if (!supabase || !user) {
      setStatus("signed-out");
      return;
    }

    let cancelled = false;

    async function load() {
      const { data: preferredRows } = await supabase
        .from("user_preferred_tags")
        .select("tag_id")
        .eq("user_id", user.id);
      const tagIds = (preferredRows ?? []).map((r) => r.tag_id);
      if (tagIds.length === 0) {
        if (!cancelled) setStatus("empty");
        return;
      }

      const { data: tagRows } = await supabase.from("tags").select("name").in("id", tagIds);
      const tagNames = (tagRows ?? []).map((r) => r.name);
      if (tagNames.length === 0) {
        if (!cancelled) setStatus("empty");
        return;
      }

      const { data: rows, error } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,author_name,published_at,read_time_minutes,tags")
        .eq("status", "published")
        .overlaps("tags", tagNames)
        .order("published_at", { ascending: false })
        .limit(6);

      if (cancelled) return;
      if (error || !rows) {
        setStatus("empty");
        return;
      }
      setPosts(
        rows.map((r) => ({
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt ?? "",
          authorName: r.author_name ?? "CodeBay",
          publishedAt: r.published_at ?? new Date().toISOString(),
          readTimeMinutes: r.read_time_minutes ?? 6,
          tags: r.tags ?? []
        }))
      );
      setStatus("ready");
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, user?.id]);

  if (status === "signed-out") {
    return null;
  }

  if (status === "loading") {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <div className="mt-3 h-24 animate-pulse rounded-2xl bg-muted/50" aria-hidden />
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard as="div" variant="card" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Set your preferred topics in the{" "}
            <a
              href={`${communityUrl}/dashboard/profile`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              community dashboard
            </a>{" "}
            to see posts tailored to your interests here.
          </p>
        </SurfaceCard>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard as="div" variant="card" className="mt-3">
          <p className="text-sm text-muted-foreground">
            No posts match your preferred topics yet. Update your topics in the{" "}
            <a
              href={`${communityUrl}/dashboard/profile`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              community dashboard
            </a>
            .
          </p>
        </SurfaceCard>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
      <p className="mt-1 text-xs text-muted-foreground">Based on your preferred topics</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <SurfaceCard as="article" key={post.slug} variant="card">
            <Link
              href={`/${buildAuthorSegment(post.authorName)}/${post.slug}`}
              className="block"
              aria-label={`Read article: ${post.title}`}
            >
              <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.readTimeMinutes} min read
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">{post.title}</h3>
              {post.excerpt ? (
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground sm:text-sm">
                  {post.excerpt}
                </p>
              ) : null}
              {post.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </SurfaceCard>
        ))}
      </div>
      <div className="mt-3">
        <a
          href={`${communityUrl}/dashboard/profile`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit preferred topics →
        </a>
      </div>
    </section>
  );
}
