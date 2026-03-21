import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  id?: string;
  /** Short name for screen readers (visible titles live inside `children`). */
  ariaLabel: string;
  children: ReactNode;
};

/** Bordered container for a settings block; add more cards on this page as new prefs ship. */
export function SettingsSectionCard({ id, ariaLabel, children }: SettingsSectionCardProps) {
  return (
    <section id={id} aria-label={ariaLabel} className="mb-8 border border-border/70 bg-card/70 p-5 sm:p-6">
      {children}
    </section>
  );
}
