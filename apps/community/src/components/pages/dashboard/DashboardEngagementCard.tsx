import { CheckCircle2 } from "lucide-react";

type NextStepsState = {
  profileComplete: boolean;
  preferredTopicsComplete: boolean;
  discussionOrPublishedComplete: boolean;
  createdBlogPostComplete: boolean;
  blogEngagementComplete: boolean;
  followingComplete: boolean;
};

type DashboardEngagementCardProps = {
  nextSteps: NextStepsState;
};

export function DashboardEngagementCard({ nextSteps }: DashboardEngagementCardProps) {
  const steps = Object.values(nextSteps);
  const done = steps.filter(Boolean).length;
  const total = steps.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
            aria-hidden
          >
            {/* Ring track */}
            <div className="absolute inset-0 rounded-full border-2 border-border/70" />
            {/* Ring fill via conic-gradient */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
                  hsl(var(--primary)) 0% ${percent}%,
                  transparent ${percent}% 100%
                )`,
                mask: "radial-gradient(farthest-side, transparent 60%, black 60%)",
                WebkitMask: "radial-gradient(farthest-side, transparent 60%, black 60%)"
              }}
            />
            <span className="relative z-10 text-lg font-semibold tabular-nums text-foreground">
              {percent}%
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Profile setup
            </h2>
            <p className="mt-0.5 text-sm text-foreground">
              {done} of {total} steps complete
            </p>
          </div>
        </div>
        {percent === 100 && (
          <div className="flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">All set</span>
          </div>
        )}
      </div>
    </div>
  );
}
