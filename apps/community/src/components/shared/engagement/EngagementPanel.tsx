"use client";

import Link from "next/link";
import type { ReactNode } from "react";

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
};

export function EngagementPanel({
  subtitle,
  cards,
  hasEngagementAccess,
  joinHref,
  signInHref,
  accessCopy = "Reactions and comments are available for community members.",
  error,
  variant = "standalone"
}: EngagementPanelProps) {
  const body = (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engagement</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {cards.map((card) => (
            <div
              key={card.label}
              className="flex min-w-[132px] flex-1 flex-col gap-1 border border-border/70 bg-background/60 p-2 sm:min-w-[140px] sm:p-2.5"
            >
              <div className="flex items-center justify-between gap-1.5 md:flex-col md:items-start md:justify-start md:gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/70 text-[10px]" aria-hidden>
                    {card.icon}
                  </span>
                  <span className="text-[11px] font-medium text-foreground">{card.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{card.summary}</span>
              </div>

              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-border/80" aria-hidden>
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${Math.max(0, Math.min(100, card.progressPct))}%` }}
                />
              </div>

              {card.actions ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={card.actions.primary.onClick}
                    disabled={card.actions.primary.disabled}
                    aria-label={card.actions.primary.ariaLabel}
                  >
                    {card.actions.primary.icon}
                  </button>
                  {card.actions.secondary ? (
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={card.actions.secondary.onClick}
                      disabled={card.actions.secondary.disabled}
                      aria-label={card.actions.secondary.ariaLabel}
                    >
                      {card.actions.secondary.icon}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {card.footer ? <div className="mt-1">{card.footer}</div> : null}
            </div>
          ))}
        </div>
      </div>

      {!hasEngagementAccess ? (
        <p className="mt-4 text-xs text-muted-foreground">
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

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
    </>
  );

  if (variant === "embedded") {
    return body;
  }

  return (
    <section className="mx-auto w-full">
      <div className="border border-border/70 bg-card p-5 sm:p-6">{body}</div>
    </section>
  );
}

