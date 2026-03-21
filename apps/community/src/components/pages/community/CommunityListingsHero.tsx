import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { SurfaceCard } from "@codebay/ui";

export type ListingsHeroStat = {
  label: string;
  value: string;
  detail: string;
};

export type ListingsHeroChip = {
  Icon: ComponentType<{ className?: string }>;
  label: string;
};

export type CommunityListingsHeroProps = {
  backHref?: string;
  backLabel?: string;
  EyebrowIcon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  chips?: ListingsHeroChip[];
  stats?: ListingsHeroStat[];
  children: ReactNode;
};

export function CommunityListingsHero({
  backHref = "/",
  backLabel = "← Home",
  EyebrowIcon,
  eyebrow,
  title,
  description,
  chips,
  stats,
  children
}: CommunityListingsHeroProps) {
  return (
    <SurfaceCard
      as="section"
      variant="borderless"
      className="relative mb-8 overflow-hidden border border-border/40 bg-card/70 p-5 shadow-xl sm:mb-10 sm:p-6 lg:p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:2.75rem_2.75rem] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(38%+12px)] hidden px-5 sm:block sm:px-6 lg:px-8"
        aria-hidden
      >
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50" />
          <div
            data-signal-beam
            className="absolute top-1/2 h-10 w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/35 to-transparent blur-xl"
          />
          <div
            data-signal-beam-core
            className="absolute top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/90 to-transparent"
          />
        </div>
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(200px,0.42fr)] lg:items-start">
        <div className="min-w-0">
          {/* Block-level flex so the back link and inline-flex eyebrow never share one line (avoids overlap). */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Link
              href={backHref}
              className="w-fit shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {backLabel}
            </Link>
            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
              <EyebrowIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {eyebrow}
            </div>
          </div>

          <h1 className="font-hero mt-4 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:mt-5 sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {description}
          </p>

          {chips && chips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 min-w-0 max-w-full">{children}</div>
        </div>

        {stats && stats.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border border-border/60 bg-background/80 p-4 backdrop-blur"
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-1.5 min-w-0 truncate font-mono-ticker text-xl font-semibold leading-none text-foreground sm:text-2xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.detail}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
