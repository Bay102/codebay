"use client";

import { useState } from "react";
import { ActivityOverviewCard } from "@/components/pages/dashboard/ActivityOverviewCard";
import { DismissibleNextStepsCard } from "@/components/pages/community/DismissibleNextStepsCard";
import { useDashboardNotificationModal } from "@/contexts/DashboardNotificationModalContext";
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
  /** Hide the on-page notifications card (modal still works via hero). */
  hideNotificationsCard?: boolean;
  /** When set, the notifications modal can be opened from outside (e.g. hero "View all"). */
  notificationModalOpen?: boolean;
  onNotificationModalOpenChange?: (open: boolean) => void;
};

export function DashboardActivitySection({
  showNextSteps,
  nextSteps,
  overviewActivityItems,
  activityItems,
  hideNotificationsCard = false,
  notificationModalOpen: notificationModalOpenProp,
  onNotificationModalOpenChange: onNotificationModalOpenChangeProp
}: DashboardActivitySectionProps) {
  const [nextStepsVisible, setNextStepsVisible] = useState(showNextSteps);
  const modal = useDashboardNotificationModal();
  const notificationModalOpen = notificationModalOpenProp ?? modal?.open;
  const onNotificationModalOpenChange = onNotificationModalOpenChangeProp ?? modal?.setOpen;
  const hasTwoCards = showNextSteps && nextStepsVisible && !hideNotificationsCard;
  const gridCols = hasTwoCards ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {showNextSteps ? (
        <DismissibleNextStepsCard steps={nextSteps} onDismiss={() => setNextStepsVisible(false)} />
      ) : null}
      {hideNotificationsCard ? (
        <div className="hidden">
          <ActivityOverviewCard
            hideCard
            items={overviewActivityItems}
            allItems={activityItems}
            modalOpen={notificationModalOpen}
            onModalOpenChange={onNotificationModalOpenChange}
          />
        </div>
      ) : (
        <ActivityOverviewCard
          items={overviewActivityItems}
          allItems={activityItems}
          modalOpen={notificationModalOpen}
          onModalOpenChange={onNotificationModalOpenChange}
        />
      )}
    </div>
  );
}
