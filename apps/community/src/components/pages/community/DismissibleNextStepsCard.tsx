"use client";

import { useState } from "react";

export function DismissibleNextStepsCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <article className="relative rounded-2xl border border-border/70 bg-card/60 p-5">
      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss next steps"
      >
        x
      </button>
      <h3 className="pr-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next steps</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>Set up your profile details and preferences.</li>
        <li>Start a discussion or publish your first community post.</li>
        <li>Comment on recent blog posts and react to useful content.</li>
      </ul>
    </article>
  );
}
