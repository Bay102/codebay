"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@codebay/ui";

export type EngagementReactionOption<TType extends string> = {
  type: TType;
  label: string;
  icon: ReactNode;
};

export type EngagementReactionCard = {
  label: string;
  icon: ReactNode;
  summary: string;
  progressPct: number;
  actions?: {
    primary: { icon: ReactNode; onClick: () => void; ariaLabel: string; disabled?: boolean };
    secondary?: { icon: ReactNode; onClick: () => void; ariaLabel: string; disabled?: boolean };
  };
  footer?: ReactNode;
};

type EngagementPanelProps = {
  subtitle: string;
  cards: EngagementReactionCard[];
  hasEngagementAccess: boolean;
  joinHref: string;
  signInHref: string;
  accessCopy?: string;
  error?: string | null;
  /** When embedded, skips the outer card shell so a parent can wrap reactions with adjacent UI (e.g. comments). */
  variant?: "standalone" | "embedded";
  density?: "default" | "compact";
};

export function EngagementPanel({
  subtitle,
  cards,
  hasEngagementAccess,
  joinHref,
  signInHref,
  accessCopy = "Reactions and comments are available for community members.",
  error,
  variant = "standalone",
  density = "default"
}: EngagementPanelProps) {
  const compact = density === "compact";

  const body = (
    <>
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between",
          compact ? "gap-2 md:gap-3" : "gap-4"
        )}
      >
        <div className={cn(compact && "min-w-0 shrink md:max-w-[40%]")}>
          <p
            className={cn(
              "font-semibold uppercase tracking-wide text-muted-foreground",
              compact ? "text-[10px] leading-tight" : "text-xs"
            )}
          >
            Engagement
          </p>
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "mt-0.5 text-xs leading-snug" : "mt-1 text-sm"
            )}
          >
            {subtitle}
          </p>
        </div>

        <div className={cn("flex flex-wrap md:justify-end", compact ? "gap-1.5" : "gap-2")}>
          {cards.map((card) => (
            <div
              key={card.label}
              className={cn(
                "flex flex-1 flex-col border border-border/70 bg-background/60",
                compact
                  ? "min-w-[104px] gap-0.5 p-1.5 sm:min-w-[112px]"
                  : "min-w-[132px] gap-1 p-2 sm:min-w-[140px] sm:p-2.5"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-1.5 md:flex-col md:items-start md:justify-start",
                  compact ? "md:gap-0" : "md:gap-0.5"
                )}
              >
                <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                  <span
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full bg-secondary/70",
                      compact ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]"
                    )}
                    aria-hidden
                  >
                    {card.icon}
                  </span>
                  <span
                    className={cn(
                      "truncate font-medium text-foreground",
                      compact ? "text-[10px]" : "text-[11px]"
                    )}
                  >
                    {card.label}
                  </span>
                </div>
                <span className={cn("text-muted-foreground", compact ? "text-[9px]" : "text-[10px]")}>
                  {card.summary}
                </span>
              </div>

              <div
                className={cn(
                  "w-full overflow-hidden rounded-full bg-border/80",
                  compact ? "mt-0 h-0.5" : "mt-0.5 h-1"
                )}
                aria-hidden
              >
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${Math.max(0, Math.min(100, card.progressPct))}%` }}
                />
              </div>

              {card.actions ? (
                <div className={cn("flex items-center gap-1", compact ? "mt-0.5" : "mt-1 gap-1.5")}>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                      compact ? "h-6 w-6" : "h-7 w-7"
                    )}
                    onClick={card.actions.primary.onClick}
                    disabled={card.actions.primary.disabled}
                    aria-label={card.actions.primary.ariaLabel}
                  >
                    {card.actions.primary.icon}
                  </button>
                  {card.actions.secondary ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center justify-center rounded-md border border-transparent bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        compact ? "h-6 w-6" : "h-7 w-7"
                      )}
                      onClick={card.actions.secondary.onClick}
                      disabled={card.actions.secondary.disabled}
                      aria-label={card.actions.secondary.ariaLabel}
                    >
                      {card.actions.secondary.icon}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {card.footer ? <div className={cn(compact ? "mt-0.5" : "mt-1")}>{card.footer}</div> : null}
            </div>
          ))}
        </div>
      </div>

      {!hasEngagementAccess ? (
        <p className={cn("text-xs text-muted-foreground", compact ? "mt-2" : "mt-4")}>
          {accessCopy}{" "}
          <Link href={joinHref} className="text-primary underline-offset-4 hover:underline">
            Join
          </Link>{" "}
          or{" "}
          <Link href={signInHref} className="text-primary underline-offset-4 hover:underline">
            sign in
          </Link>
          .
        </p>
      ) : null}

      {error ? (
        <p className={cn("text-xs text-destructive", compact ? "mt-2" : "mt-3")}>{error}</p>
      ) : null}
    </>
  );

  if (variant === "embedded") {
    return body;
  }

  return (
    <section className="mx-auto w-full">
      <div
        className={cn(
          "border border-border/70 bg-card",
          compact ? "p-3 sm:p-4" : "p-5 sm:p-6"
        )}
      >
        {body}
      </div>
    </section>
  );
}

