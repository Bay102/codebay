import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchAllTags } from "@/lib/tags";
import { Button, DiscussionCard, SurfaceCard } from "@codebay/ui";
import { mapDiscussionListItemToDiscussionCardData } from "@/lib/ui-mappers";
import { DiscussionsToolbar } from "@/components/pages/discussions/DiscussionsToolbar";

export const metadata: Metadata = {
  title: "Discussions",
  description: "Community discussions – share ideas and join the conversation."
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function DiscussionsListPage({ searchParams }: PageProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">Unable to load discussions.</p>
        </section>
      </main>
    );
  }

  const resolved = await searchParams;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;
  const tag = typeof resolved.tag === "string" ? resolved.tag : undefined;

  const [discussions, tags] = await Promise.all([
    getDiscussionsWithCounts(supabase, {
      limit: 32,
      offset: 0,
      orderByTrend: true,
      search: q,
      tagFilter: tag
    }),
    fetchAllTags(supabase)
  ]);

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
          <h1 className="font-hero mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Discussions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a thread or join the conversation.
          </p>
        </div>

        <div className="mt-6">
          <DiscussionsToolbar tags={tags} initialQuery={q} initialTag={tag ?? null} />
        </div>

        {discussions.length === 0 ? (
          <SurfaceCard as="div" variant="card" className="mt-6 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {q || tag
                ? "No discussions match your search or filter. Try different terms or clear filters."
                : "No discussions yet. Be the first to start one from your dashboard."}
            </p>
            {/* <a
              href="/dashboard/discussions/new"
              className="mt-4 inline-flex rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              New discussion
            </a> */}
            <Button asChild variant="default" size="default" className="w-full sm:w-auto">
              <a href="/dashboard/discussions/new">New discussion</a>
            </Button>
          </SurfaceCard>
        ) : (
          <div className="mt-6 space-y-3">
            {discussions.map((item) => {
              const discussion = mapDiscussionListItemToDiscussionCardData(item);
              return (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  showAuthorAvatar
                  href={`/discussions/${discussion.slug}`}
                  showAuthor
                  showDate
                  showEngagement
                  showTags
                  variant="compact"
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
