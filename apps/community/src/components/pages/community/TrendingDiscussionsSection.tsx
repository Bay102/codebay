import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { SurfaceCard } from "@codebay/ui";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export async function TrendingDiscussionsSection() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const discussions = await getDiscussionsWithCounts(supabase, {
    limit: 4,
    offset: 0,
    orderByTrend: true
  });

  if (discussions.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Trending discussions
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {discussions.map((d) => (
          <SurfaceCard as="article" key={d.id} variant="card">
            <Link href={`/discussions/${d.slug}`} className="block">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>@{d.authorUsername}</span>
                <span aria-hidden>·</span>
                <time dateTime={d.createdAt}>{formatDate(d.createdAt)}</time>
                <span aria-hidden>·</span>
                <span>{d.commentCount} comments</span>
                <span>{d.reactionCount} reactions</span>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">{d.title}</h3>
              {d.body ? (
                <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                  {d.body}
                </p>
              ) : null}
            </Link>
          </SurfaceCard>
        ))}
      </div>
      <div className="mt-3">
        <Link
          href="/discussions"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all discussions →
        </Link>
      </div>
    </section>
  );
}
