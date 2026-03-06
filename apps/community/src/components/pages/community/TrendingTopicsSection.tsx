import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { fetchTrendingTopics } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { InViewSection } from "@/components/InViewSection";
import { Tag } from "@codebay/ui";

export async function TrendingTopicsSection() {
  const topics = await fetchTrendingTopics(10);

  if (topics.length === 0) {
    return null;
  }

  return (
    <InViewSection as="section" className="mt-8">
      <SurfaceCard
        as="div"
        className="hover:shadow-lg hover:border-border/40 hover:bg-card/80"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trending topics: {' '}
          </h2>
          {topics.map((topic) => {
            const href = `${blogUrl}?tag=${encodeURIComponent(topic.tag)}`;
            return (
              <Link
                key={topic.tag}
                href={href}
                className="inline-flex items-center rounded-md border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs font-medium tracking-[0.08em] uppercase text-foreground/90 transition-colors hover:bg-secondary/80"
              >
                <Tag variant="muted">{topic.tag}</Tag>
              </Link>
            );
          })}
        </div>
      </SurfaceCard>
    </InViewSection>
  );
}

