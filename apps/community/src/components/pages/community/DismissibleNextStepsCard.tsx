"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { SurfaceCard } from "@codebay/ui";

type NextStepsState = {
  profileComplete: boolean;
  preferredTopicsComplete: boolean;
  discussionOrPublishedComplete: boolean;
  createdBlogPostComplete: boolean;
  blogEngagementComplete: boolean;
  followingComplete: boolean;
};

type DismissibleNextStepsCardProps = {
  steps: NextStepsState;
  onDismiss?: () => void;
};

export function DismissibleNextStepsCard({ steps, onDismiss }: DismissibleNextStepsCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const stepValues = Object.values(steps);
  const done = stepValues.filter(Boolean).length;
  const total = stepValues.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const progress = Math.min(100, Math.max(0, percent));

  const {
    profileComplete,
    preferredTopicsComplete,
    discussionOrPublishedComplete,
    createdBlogPostComplete,
    blogEngagementComplete,
    followingComplete
  } = steps;

  const renderStatusIcon = (isComplete: boolean) => {
    if (isComplete) {
      return (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 text-emerald-500"
          aria-hidden="true"
        />
      );
    }

    return (
      <XCircle
        className="mt-0.5 h-4 w-4 text-muted-foreground/60"
        aria-hidden="true"
      />
    );
  };

  return (
    <SurfaceCard as="article" variant="card" className="relative">
      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss next steps"
      >
        x
      </button>
      <div className="flex flex-col gap-3 pr-10">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Establish your presence
            </h3>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-foreground">
                  {done} of {total} steps complete
                </p>
                <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          {renderStatusIcon(profileComplete)}
          <span>
            Set up your profile details and preferences{" "}
            <Link href="/dashboard/profile" className="underline underline-offset-4 hover:text-foreground">
              here
            </Link>
            .
          </span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(preferredTopicsComplete)}
          <span>
            Choose your preferred topics to follow{" "}
            <Link href="/settings" className="underline underline-offset-4 hover:text-foreground">
              here
            </Link>
            .
          </span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(discussionOrPublishedComplete)}
          <span>Start a discussion or publish your first community post.</span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(createdBlogPostComplete)}
          <span>Create your first blog post.</span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(blogEngagementComplete)}
          <span>Comment on blog posts and react to useful content.</span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(followingComplete)}
          <span>Follow other community members.</span>
        </li>
      </ul>
    </SurfaceCard>
  );
}
