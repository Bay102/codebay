"use client";

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
      <h3 className="pr-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Establish your presence</h3>
      <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          {renderStatusIcon(profileComplete)}
          <span>Set up your profile details and preferences.</span>
        </li>
        <li className="flex items-start gap-2">
          {renderStatusIcon(preferredTopicsComplete)}
          <span>Choose your preferred topics to follow.</span>
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
