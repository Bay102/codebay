import { fetchTrendingTopics } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { InViewSection } from "@/components/InViewSection";
import { TrendingTopicsTicker } from "./TrendingTopicsTicker";

export async function TrendingTopicsSection() {
  const topics = await fetchTrendingTopics(14);

  if (topics.length === 0) {
    return null;
  }

  return (
    <InViewSection as="section" className="mt-4">
      <TrendingTopicsTicker topics={topics} blogUrl={blogUrl} />
    </InViewSection>
  );
}

