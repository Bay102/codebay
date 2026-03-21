import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SurfaceCard, cn } from "@codebay/ui";

type ExploreContentSectionProps = {
  title: string;
  description?: string;
  emptyMessage: string;
  isEmpty: boolean;
  /** Optional decorative icon on the far right (e.g. section theme). */
  accentIcon?: LucideIcon;
  /** Extra classes on the icon SVG (e.g. subtle rotation). */
  accentIconClassName?: string;
  children: ReactNode;
};

export function ExploreContentSection({
  title,
  description,
  emptyMessage,
  isEmpty,
  accentIcon: AccentIcon,
  accentIconClassName,
  children
}: ExploreContentSectionProps) {
  return (
    <section className="group mt-10 first:mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {AccentIcon ? (
          <div className="flex shrink-0 justify-end sm:pb-px" aria-hidden>
            <div
              className={cn(
                "relative flex h-11 w-11 items-center justify-center sm:h-[3.25rem] sm:w-[3.25rem]",
                "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out",
                "group-hover:scale-[1.06] group-hover:-rotate-1"
              )}
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.15] via-primary/[0.06] to-transparent" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
              <span className="pointer-events-none absolute -right-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-lg" />
              <AccentIcon
                className={cn(
                  "relative z-[1] h-[1.35rem] w-[1.35rem] text-primary/50 drop-shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:h-6 sm:w-6",
                  accentIconClassName
                )}
                strokeWidth={1.35}
              />
            </div>
          </div>
        ) : null}
      </div>

      {isEmpty ? (
        <SurfaceCard as="div" variant="card" className="mt-4 p-6 text-center sm:p-8">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </SurfaceCard>
      ) : (
        <div className="mt-4 space-y-3">{children}</div>
      )}
    </section>
  );
}
