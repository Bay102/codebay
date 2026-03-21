"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@/lib/database";
import { getCommunitySupabaseClient } from "@/lib/supabase/client";
import { SurfaceCard } from "@codebay/ui";

type BlogPostRow = Pick<Tables<"blog_posts">, "id" | "title" | "slug" | "published_at" | "status"> & {
  featured_on_community_landing: boolean;
};

export function FeaturedPostsManager() {
  const supabase = getCommunitySupabaseClient();
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id,title,slug,featured_on_community_landing,published_at,status")
        .order("published_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        setError("Unable to load posts.");
      } else {
        setPosts(((data ?? []) as unknown) as BlogPostRow[]);
      }

      setIsLoading(false);
    })();
  }, [supabase]);

  const handleToggle = async (post: BlogPostRow) => {
    if (!supabase) return;
    const nextValue = !post.featured_on_community_landing;

    setUpdatingId(post.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, featured_on_community_landing: nextValue } : p
      )
    );

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ featured_on_community_landing: nextValue } as any)
      .eq("id", post.id);

    setUpdatingId(null);

    if (updateError) {
      setError("Unable to update featured flag. Reverting.");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, featured_on_community_landing: post.featured_on_community_landing } : p
        )
      );
    }
  };

  return (
    <SurfaceCard variant="subtle">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Featured blog posts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which published posts appear in the Featured Blog Posts section on the community landing page.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading posts…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      ) : posts.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No posts found.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-3 border border-border/60 bg-card/40 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{post.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{post.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleToggle(post)}
                disabled={updatingId === post.id}
                className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {post.featured_on_community_landing ? "Featured" : "Not featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
}

