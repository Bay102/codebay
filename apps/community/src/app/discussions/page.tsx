import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { SurfaceCard } from "@codebay/ui";

export const metadata: Metadata = {
  title: "Discussions",
  description: "Community discussions – share ideas and join the conversation."
};

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default async function DiscussionsListPage() {
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

  const discussions = await getDiscussionsWithCounts(supabase, { limit: 32, offset: 0, orderByTrend: true });

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Discussions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a thread or join the conversation.
          </p>
        </div>

        {discussions.length === 0 ? (
          <SurfaceCard as="div" variant="card" className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No discussions yet. Be the first to start one from your dashboard.</p>
            <Link
              href="/dashboard/discussions/new"
              className="mt-4 inline-flex rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              New discussion
            </Link>
          </SurfaceCard>
        ) : (
          <ul className="space-y-3">
            {discussions.map((d) => (
              <li key={d.id}>
                <Link href={`/discussions/${d.slug}`}>
                  <SurfaceCard as="article" variant="card" className="block p-4 transition-colors hover:border-primary/40 hover:bg-secondary/30">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>@{d.authorUsername}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={d.createdAt}>{formatDate(d.createdAt)}</time>
                      <span aria-hidden>·</span>
                      <span>{d.commentCount} comments</span>
                      <span>{d.reactionCount} reactions</span>
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-foreground sm:text-lg">{d.title}</h2>
                    {d.body ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.body}</p>
                    ) : null}
                  </SurfaceCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
