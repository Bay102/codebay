import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareText, RadioTower, Users, Zap } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { parseScoreModeParam, parseScorePeriodParam } from "@/lib/explore";
import { fetchAllTags } from "@/lib/tags";
import { DiscussionCard, SurfaceCard } from "@codebay/ui";
import { mapDiscussionListItemToDiscussionCardData } from "@/lib/ui-mappers";
import { FocusButton } from "@/components/shared/buttons/FocusButton";
import { DiscussionsToolbar } from "@/components/pages/discussions/DiscussionsToolbar";
import { CommunityListingsHero } from "@/components/pages/community/CommunityListingsHero";
import { ContentScoreSwitcher } from "@/components/pages/community/ContentScoreSwitcher";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";

export const metadata: Metadata = {
  title: "Discussions",
  description: "Community discussions – share ideas and join the conversation."
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string; score?: string; period?: string }>;
};

export default async function DiscussionsListPage({ searchParams }: PageProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Unable to load discussions.</p>
        </section>
      </main>
    );
  }

  const resolved = await searchParams;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;
  const tag = typeof resolved.tag === "string" ? resolved.tag : undefined;
  const scoreMode = parseScoreModeParam(resolved.score) ?? "hot";
  const scorePeriod = parseScorePeriodParam(resolved.period) ?? "7d";

  const [discussions, tags] = await Promise.all([
    getDiscussionsWithCounts(supabase, {
      limit: 32,
      offset: 0,
      orderByTrend: false,
      search: q,
      tagFilter: tag,
      scoreMode,
      scorePeriod
    }),
    fetchAllTags(supabase)
  ]);

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <CommunityListingsHero
          EyebrowIcon={MessageSquareText}
          eyebrow="Community threads"
          title="Discussions"
          description="Jump into active threads, filter by topic, or spin up a new conversation for the community to riff on."
          // chips={[
          //   { Icon: Zap, label: "Trending & timely" },
          //   { Icon: Users, label: "Peer perspectives" },
          //   { Icon: RadioTower, label: "Signal, not noise" }
          // ]}
          stats={[
            { label: "In this view", value: String(discussions.length), detail: "threads listed" },
            { label: "Topic catalog", value: String(tags.length), detail: "tags to explore" }
          ]}
          statsFooter={
            <FocusButton
              href="/dashboard/discussions/new"
              colorVariant="primary"
              borderVariant="bordered"
              sizeVariant="sm"
              radiusVariant="square"
            >
              New discussion
            </FocusButton>
          }
        >
          <ContentScoreSwitcher
            mode={scoreMode}
            period={scorePeriod}
            className="mb-3"
          />
          <DiscussionsToolbar tags={tags} initialQuery={q} initialTag={tag ?? null} variant="hero" />
        </CommunityListingsHero>

        {discussions.length === 0 ? (
          <SurfaceCard as="div" variant="card" className="mt-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {q || tag
                ? "No discussions match your search or filter. Try different terms or clear filters."
                : "No discussions yet. Be the first to start one from your dashboard."}
            </p>

          </SurfaceCard>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {discussions.map((item) => {
              const discussion = mapDiscussionListItemToDiscussionCardData(item);
              return (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  headerSlot={item.scoreSummary ? <ContentScoreMarker summary={item.scoreSummary} /> : undefined}
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
