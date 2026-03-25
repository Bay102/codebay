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
  /** Hide the on-page notifications card (header / hero open the global notifications modal). */
  hideNotificationsCard?: boolean;
};

export function DashboardActivitySection({
  showNextSteps,
  nextSteps,
  overviewActivityItems,
  activityItems,
  hideNotificationsCard = false
}: DashboardActivitySectionProps) {
  const [nextStepsVisible, setNextStepsVisible] = useState(showNextSteps);
  const hasTwoCards = showNextSteps && nextStepsVisible && !hideNotificationsCard;
  const gridCols = hasTwoCards ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {showNextSteps ? (
        <DismissibleNextStepsCard steps={nextSteps} onDismiss={() => setNextStepsVisible(false)} />
      ) : null}
      {hideNotificationsCard ? null : (
        <ActivityOverviewCard items={overviewActivityItems} allItems={activityItems} />
      )}
    </div>
  );
}
