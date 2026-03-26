"use client";

import { useCallback, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "../utils";

export type CardShareLinkButtonProps = {
  href: string;
  className?: string;
};

function absoluteUrlForHref(href: string): string {
  if (typeof window === "undefined") return href;
  try {
    return new URL(href, window.location.origin).href;
  } catch {
    return href;
  }
}

export function CardShareLinkButton({ href, className }: CardShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const url = absoluteUrlForHref(href);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        // Clipboard may be unavailable; avoid throwing.
      }
    },
    [href],
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border/60 bg-card/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-border hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden strokeWidth={2.25} />
      ) : (
        <Share2 className="h-3 w-3" aria-hidden strokeWidth={2.25} />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}
