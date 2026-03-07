"use client";

import { useState } from "react";
import { ActivityOverviewCard } from "@/components/pages/dashboard/ActivityOverviewCard";
import { DismissibleNextStepsCard } from "@/components/pages/community/DismissibleNextStepsCard";
import type { DashboardActivityItem } from "@/lib/dashboard";

type NextStepsState = {
  profileComplete: boolean;
  preferredTopicsComplete: boolean;
  discussionOrPublishedComplete: boolean;
  createdBlogPostComplete: boolean;
  blogEngagementComplete: boolean;
  followingComplete: boolean;
};

type DashboardActivitySectionProps = {
  showNextSteps: boolean;
  nextSteps: NextStepsState;
  overviewActivityItems: DashboardActivityItem[];
  activityItems: DashboardActivityItem[];
};

export function DashboardActivitySection({
  showNextSteps,
  nextSteps,
  overviewActivityItems,
  activityItems
}: DashboardActivitySectionProps) {
  const [nextStepsVisible, setNextStepsVisible] = useState(showNextSteps);
  const hasTwoCards = showNextSteps && nextStepsVisible;
  const gridCols = hasTwoCards ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`mt-6 grid gap-4 ${gridCols}`}>
      {showNextSteps ? (
        <DismissibleNextStepsCard steps={nextSteps} onDismiss={() => setNextStepsVisible(false)} />
      ) : null}
      <ActivityOverviewCard items={overviewActivityItems} allItems={activityItems} />
    </div>
  );
}
