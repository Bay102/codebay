"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DismissibleNextStepsCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <article className="relative mt-6 rounded-2xl border border-border/70 bg-card/60 p-5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss next steps"
      >
        <X className="h-4 w-4" aria-hidden />
      </Button>
      <h3 className="pr-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Next steps
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>Set up your profile details and preferences.</li>
        <li>Start a discussion or publish your first community post.</li>
        <li>Comment on recent blog posts and react to useful content.</li>
      </ul>
    </article>
  );
}
