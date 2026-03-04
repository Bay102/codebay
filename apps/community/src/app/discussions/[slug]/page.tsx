import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getDiscussionBySlug,
  getDiscussionCounts,
  getDiscussionComments
} from "@/lib/discussions";
import { DiscussionReactionBar } from "@/components/pages/discussions/DiscussionReactionBar";
import { DiscussionCommentTree } from "@/components/pages/discussions/DiscussionCommentTree";

export const metadata: Metadata = {
  title: "Discussion",
  description: "Community discussion thread."
};

export const dynamic = "force-dynamic";

type DiscussionPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function DiscussionPage({ params }: DiscussionPageProps) {
  const { slug } = await params;

  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();

  const [discussion, { data: { user } }] = await Promise.all([
    getDiscussionBySlug(supabase, slug),
    supabase.auth.getUser()
  ]);
  if (!discussion) notFound();

  const viewerId = user?.id ?? null;
  const [counts, comments] = await Promise.all([
    getDiscussionCounts(supabase, discussion.id, viewerId),
    getDiscussionComments(supabase, discussion.id)
  ]);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/discussions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← All discussions
          </Link>
        </div>

        <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href={`/${discussion.author.username}`} className="font-medium text-foreground hover:underline">
              {discussion.author.name} (@{discussion.author.username})
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={discussion.created_at}>{formatDate(discussion.created_at)}</time>
          </div>
          <h1 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{discussion.title}</h1>
          <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {discussion.body}
          </div>

          <div className="mt-6">
            <DiscussionReactionBar
              discussionId={discussion.id}
              slug={slug}
              initialCommentCount={counts.commentCount}
              initialReactionCount={counts.reactionCount}
              initialViewerReactionType={counts.viewerReactionType ?? null}
            />
          </div>
        </article>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Comments ({comments.length})
          </h2>
          <DiscussionCommentTree
            discussionId={discussion.id}
            slug={slug}
            initialComments={comments}
            viewerId={viewerId}
          />
        </div>
      </section>
    </main>
  );
}
