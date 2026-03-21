import type { ReactNode } from "react";
import { SurfaceCard } from "@codebay/ui";

type ExploreContentSectionProps = {
  title: string;
  description?: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: ReactNode;
};

export function ExploreContentSection({
  title,
  description,
  emptyMessage,
  isEmpty,
  children
}: ExploreContentSectionProps) {
  return (
    <section className="mt-10 first:mt-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
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
