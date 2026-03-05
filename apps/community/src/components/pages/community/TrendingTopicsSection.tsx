import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { fetchTrendingTopics } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { InViewSection } from "@/components/InViewSection";

export async function TrendingTopicsSection() {
  const topics = await fetchTrendingTopics(10);

  if (topics.length === 0) {
    return null;
  }

  return (
    <InViewSection as="section" className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trending topics</h2>
      <SurfaceCard
        as="div"
        variant="card"
        className="mt-3 hover:shadow-lg hover:border-border/40 hover:bg-card/80"
      >
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const href = `${blogUrl}?tag=${encodeURIComponent(topic.tag)}`;
            return (
              <Link
                key={topic.tag}
                href={href}
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <span>{topic.tag}</span>
                {/* <span className="text-[10px] text-muted-foreground">
                  {topic.postCount}
                </span> */}
              </Link>
            );
          })}
        </div>
      </SurfaceCard>
    </InViewSection>
  );
}

