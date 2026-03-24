import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getDiscussionBodyHtml,
  getDiscussionBySlug,
  getDiscussionCounts,
  getDiscussionComments
} from "@/lib/discussions";
import { DiscussionAuthorAvatar } from "@/components/pages/discussions/DiscussionAuthorAvatar";
import { DiscussionEngagement } from "@/components/pages/discussions/DiscussionEngagement";
import { Tag } from "@codebay/ui";

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
    <main className="bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-5 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/discussions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← All discussions
          </Link>
        </div>

        <article className="border border-border/70 bg-card/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Link href={`/${discussion.author.username}`} className="transition-opacity hover:opacity-90">
              <DiscussionAuthorAvatar
                name={discussion.author.name}
                avatarUrl={discussion.author.avatarUrl}
                sizeClassName="h-12 w-12"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Link href={`/${discussion.author.username}`} className="font-medium text-foreground hover:underline">
                  {discussion.author.name} (@{discussion.author.username})
                </Link>
                <span aria-hidden>·</span>
                <time dateTime={discussion.created_at}>{formatDate(discussion.created_at)}</time>
              </div>
              <h1 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{discussion.title}</h1>
              {discussion.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {discussion.tags.map((tag) => (
                    <Tag variant="tech" size="sm" key={tag}>
                      #{tag}
                    </Tag>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                <div
                  className="prose prose-invert prose-sm max-w-none [&_code]:rounded-[4px] [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted/80 [&_pre]:p-3"
                  dangerouslySetInnerHTML={{ __html: getDiscussionBodyHtml(discussion.body) }}
                />
              </div>
            </div>
          </div>
        </article>

        <div className="mt-4">
          <DiscussionEngagement
            discussionId={discussion.id}
            slug={slug}
            initialCommentCount={counts.commentCount}
            initialViewerReactions={counts.viewerReactions ?? {}}
            initialComments={comments}
            viewerId={viewerId}
          />
        </div>
      </section>
    </main>
  );
}
