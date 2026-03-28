"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Flame, Info, Target } from "lucide-react";
import { cn } from "@codebay/ui";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@codebay/ui";
import type { ExploreContentType } from "@/lib/explore";
import {
  getScoreModeDescription,
  getScoreModeLabel,
  SCORE_MODE_ICON_CLASS,
  type ScoreMode,
  type ScorePeriod
} from "@/lib/content-scoring";

type ContentScoreSwitcherProps = {
  mode: ScoreMode;
  period: ScorePeriod;
  contentType?: ExploreContentType;
  enableContentTypeToggle?: boolean;
  className?: string;
};

type ScoreModeInfoButtonProps = {
  className?: string;
};

const MODE_OPTIONS: { value: ScoreMode; label: string }[] = [
  { value: "hot", label: "Momentum" },
  { value: "quality", label: "Impact" }
];

const PERIOD_OPTIONS: { value: ScorePeriod; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "365d", label: "Year" }
];

export function ContentScoreSwitcher({
  mode,
  period,
  contentType = "discussions",
  enableContentTypeToggle = false,
  className
}: ContentScoreSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const activeModeOption = MODE_OPTIONS.find((option) => option.value === mode) ?? MODE_OPTIONS[0];
  const ActiveModeIcon = mode === "hot" ? Flame : Target;

  const setParams = useCallback(
    (updates: { score?: ScoreMode; period?: ScorePeriod; type?: ExploreContentType }) => {
      const next = new URLSearchParams(searchParams.toString());
      if (updates.score) next.set("score", updates.score);
      if (updates.period) next.set("period", updates.period);
      if (updates.type) {
        if (updates.type === "discussions") next.delete("type");
        else next.set("type", updates.type);
      }

      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={className}>
      <div
        className={cn(
          "flex w-full max-w-full flex-col gap-1 rounded-xl border border-border/60 bg-muted/35 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] sm:inline-flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-start"
        )}
        role="navigation"
        aria-label="Score controls"
      >
        {enableContentTypeToggle ? (
          <div className="flex w-full gap-1 sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-10 flex-1 rounded-lg px-3 text-sm font-medium sm:min-w-[7.5rem] sm:flex-none",
                contentType === "discussions"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm hover:ring-1 hover:ring-border/60"
              )}
              disabled={isPending}
              onClick={() => setParams({ type: "discussions" })}
            >
              Discussions
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-10 flex-1 rounded-lg px-3 text-sm font-medium sm:min-w-[7.5rem] sm:flex-none",
                contentType === "blogs"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                  : "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm hover:ring-1 hover:ring-border/60"
              )}
              disabled={isPending}
              onClick={() => setParams({ type: "blogs" })}
            >
              Blog posts
            </Button>
          </div>
        ) : null}

        <Select
          value={mode}
          onValueChange={(value) => setParams({ score: value as ScoreMode })}
          disabled={isPending}
        >
          <SelectTrigger className="h-10 w-full rounded-lg border-0 bg-background text-sm shadow-sm ring-1 ring-border/60 sm:w-[10rem]">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{activeModeOption.label}</span>
              <ActiveModeIcon className={cn("h-3.5 w-3.5", SCORE_MODE_ICON_CLASS[mode])} aria-hidden />
            </div>
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="inline-flex items-center gap-1.5">
                  {option.value === "hot" ? (
                    <Flame className={cn("h-3.5 w-3.5", SCORE_MODE_ICON_CLASS.hot)} aria-hidden />
                  ) : (
                    <Target className={cn("h-3.5 w-3.5", SCORE_MODE_ICON_CLASS.quality)} aria-hidden />
                  )}
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={period}
          onValueChange={(value) => setParams({ period: value as ScorePeriod })}
          disabled={isPending}
        >
          <SelectTrigger className="h-10 w-full rounded-lg border-0 bg-background text-sm shadow-sm ring-1 ring-border/60 sm:w-[10rem]">
            <SelectValue placeholder="Time window" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ScoreModeInfoButton({ className }: ScoreModeInfoButtonProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-colors hover:text-foreground",
            className
          )}
          aria-label="Explain scoring modes"
          onMouseEnter={() => setIsInfoOpen(true)}
          onMouseLeave={() => setIsInfoOpen(false)}
        >
          <Info className="h-4 w-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="max-w-[22rem] space-y-2 text-xs leading-relaxed text-popover-foreground"
        onMouseEnter={() => setIsInfoOpen(true)}
        onMouseLeave={() => setIsInfoOpen(false)}
      >
        <p className="flex items-start gap-1.5">
          <Flame className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", SCORE_MODE_ICON_CLASS.hot)} aria-hidden />
          <span className="text-pretty">
            <strong className="text-foreground">{getScoreModeLabel("hot")}.</strong> {getScoreModeDescription("hot")}
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <Target className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", SCORE_MODE_ICON_CLASS.quality)} aria-hidden />
          <span className="text-pretty">
            <strong className="text-foreground">{getScoreModeLabel("quality")}.</strong>{" "}
            {getScoreModeDescription("quality")}
          </span>
        </p>
      </PopoverContent>
    </Popover>
  );
}
