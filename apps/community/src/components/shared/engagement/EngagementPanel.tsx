"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Eye, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@codebay/ui";

/** Matches "89 views", "1,234 reactions" from subtitle segments. */
const STAT_METRIC_RE = /^([\d,]+)\s+(.+)$/;

function parseStatSegment(part: string): { kind: "metric"; value: string; unit: string } | { kind: "plain"; text: string } {
  const m = part.match(STAT_METRIC_RE);
  if (m) {
    return { kind: "metric", value: m[1], unit: m[2].trim() };
  }
  return { kind: "plain", text: part };
}

function StatKindIcon({ unit, compact }: { unit: string; compact?: boolean }) {
  const u = unit.toLowerCase();
  const cls = cn("shrink-0 opacity-90", compact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4");
  if (u.includes("view")) {
    return <Eye className={cls} strokeWidth={2} aria-hidden />;
  }
  if (u.includes("reaction")) {
    return <Sparkles className={cls} strokeWidth={2} aria-hidden />;
  }
  if (u.includes("comment")) {
    return <MessageCircle className={cls} strokeWidth={2} aria-hidden />;
  }
  return (
    <Activity
      className={cn("shrink-0 opacity-60", compact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4")}
      strokeWidth={2}
      aria-hidden
    />
  );
}

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

function SubtitleStatStrip({ text, compact }: { text: string; compact: boolean }) {
  const parts = text.split(" - ").map((p) => p.trim()).filter(Boolean);
  const usePills = parts.length > 1;

  if (!usePills) {
    return (
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "mt-1 text-xs leading-snug" : "mt-1.5 text-sm leading-relaxed"
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "relative mt-1 flex flex-wrap items-stretch overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-primary/[0.06] via-card/90 to-muted/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:mt-1.5",
        compact ? "gap-0 p-px" : "gap-0 p-0.5"
      )}
      aria-label="Engagement summary"
    >
      {parts.map((part, index) => {
        const parsed = parseStatSegment(part);
        const isFirst = index === 0;

        if (parsed.kind === "plain") {
          return (
            <li
              key={part}
              className={cn(
                "flex min-w-0 flex-1 items-center border-border/50",
                !isFirst && "border-l",
                compact
                  ? "py-1 px-3 sm:py-1.5 sm:px-4"
                  : "py-1.5 px-3 sm:px-4 sm:py-2"
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground",
                  compact ? "text-[10px] leading-snug sm:text-[11px]" : "text-xs leading-snug"
                )}
              >
                {parsed.text}
              </span>
            </li>
          );
        }

        return (
          <li
            key={part}
            className={cn(
              "flex min-w-[4.75rem] flex-1 items-center border-border/50 sm:min-w-[5.5rem]",
              !isFirst && "border-l",
              compact
                ? "gap-1.5 py-1 px-3 sm:gap-2 sm:px-4 sm:py-1.5"
                : "gap-2 py-1.5 px-3 sm:gap-2.5 sm:px-4 sm:py-2"
            )}
            aria-label={`${parsed.value} ${parsed.unit}`}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 text-primary shadow-sm",
                compact ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9"
              )}
            >
              <StatKindIcon unit={parsed.unit} compact={compact} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-semibold tabular-nums tracking-tight text-foreground",
                  compact ? "text-sm leading-none sm:text-base" : "text-base leading-none sm:text-lg"
                )}
              >
                {parsed.value}
              </p>
              <p
                className={cn(
                  "mt-px text-muted-foreground",
                  compact
                    ? "text-[8px] font-medium uppercase leading-tight tracking-[0.12em] sm:text-[9px] sm:tracking-[0.14em]"
                    : "text-[9px] font-medium uppercase leading-tight tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em]"
                )}
              >
                {parsed.unit}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function parseSummaryParts(summary: string): { primary: string; secondary: string | null } {
  const idx = summary.indexOf(" - ");
  if (idx === -1) {
    return { primary: summary, secondary: null };
  }
  return {
    primary: summary.slice(0, idx).trim(),
    secondary: summary.slice(idx + 3).trim() || null
  };
}

type ReactionTileProps = {
  card: EngagementReactionCard;
  compact: boolean;
};

function ReactionTile({ card, compact }: ReactionTileProps) {
  const { primary, secondary } = parseSummaryParts(card.summary);

  return (
    <div
      className={cn(
        "group relative flex min-h-0 flex-col overflow-hidden border border-border/50 bg-gradient-to-b from-card/90 to-background/40 shadow-sm transition-[border-color,box-shadow] hover:border-border hover:shadow-md",
        compact ? "rounded-lg p-2" : "rounded-xl p-3 sm:p-3"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-border/40",
          "group-hover:bg-border/60"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 rounded-r-full bg-primary transition-[width] duration-300 ease-out",
          compact ? "max-w-full" : "max-w-full"
        )}
        style={{ width: `${Math.max(0, Math.min(100, card.progressPct))}%` }}
        aria-hidden
      />

      <div className={cn("relative flex min-h-0 flex-1 flex-col", compact ? "gap-1" : "gap-2")}>
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <div className={cn("flex min-w-0 items-center", compact ? "gap-1.5" : "gap-2")}>
            <span
              className={cn(
                "flex shrink-0 items-center justify-center border border-border/50 bg-background/80 shadow-sm",
                compact ? "h-7 w-7 rounded-md text-sm" : "h-9 w-9 rounded-xl text-lg"
              )}
              aria-hidden
            >
              {card.icon}
            </span>
            <span
              className={cn(
                "truncate font-semibold leading-tight text-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {card.label}
            </span>
          </div>
        </div>

        <div className={cn("min-w-0", compact ? "space-y-0" : "space-y-0.5")}>
          <p
            className={cn(
              "font-semibold tabular-nums tracking-tight text-foreground leading-tight",
              compact ? "text-sm sm:text-base" : "text-lg sm:text-xl"
            )}
          >
            {primary}
          </p>
          {secondary ? (
            <p className={cn("text-muted-foreground leading-tight", compact ? "text-[10px]" : "text-xs")}>
              {secondary}
            </p>
          ) : null}
        </div>

        {card.actions ? (
          <div className={cn("mt-auto flex flex-wrap items-center", compact ? "gap-1 pt-0.5" : "gap-1.5 pt-1")}>
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-md border border-border/70 bg-background/90 text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                compact ? "h-7 w-7" : "h-9 w-9 rounded-lg"
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
                  "inline-flex items-center justify-center border border-transparent bg-muted/60 text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
                  compact ? "h-7 w-7 rounded-md" : "h-9 w-9 rounded-lg"
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

        {card.footer ? (
          <div className={cn("border-t border-border/40", compact ? "pt-1.5" : "pt-2")}>{card.footer}</div>
        ) : null}
      </div>
    </div>
  );
}

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
      <div className={cn("flex flex-col", compact ? "gap-2" : "gap-5")}>
        <header className={cn("border-b border-border/50", compact ? "pb-2 sm:pb-2.5" : "pb-3 sm:pb-4")}>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p
                className={cn(
                  "font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                  compact ? "text-[10px]" : "text-xs"
                )}
              >
                Engagement
              </p>
              <SubtitleStatStrip text={subtitle} compact={compact} />
            </div>
          </div>
        </header>

        <div
          className={cn(
            "grid w-full min-w-0",
            cards.length <= 1 ? "grid-cols-1" : cards.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
            compact ? "gap-1.5 sm:gap-2" : "gap-3 sm:gap-4"
          )}
          role="list"
          aria-label="Reaction breakdown"
        >
          {cards.map((card) => (
            <div key={card.label} role="listitem">
              <ReactionTile card={card} compact={compact} />
            </div>
          ))}
        </div>
      </div>

      {!hasEngagementAccess ? (
        <p className={cn("text-muted-foreground", compact ? "mt-3 text-xs" : "mt-5 text-sm")}>
          {accessCopy}{" "}
          <Link href={joinHref} className="font-medium text-primary underline-offset-4 hover:underline">
            Join
          </Link>{" "}
          or{" "}
          <Link href={signInHref} className="font-medium text-primary underline-offset-4 hover:underline">
            sign in
          </Link>
          .
        </p>
      ) : null}

      {error ? (
        <p className={cn("text-destructive", compact ? "mt-2 text-xs" : "mt-3 text-sm")}>{error}</p>
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
