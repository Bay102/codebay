import type { ReactNode } from "react";

export type PlatformHeroProps = {
  platformName: string;
  description: string;
  actionSlot?: ReactNode;
};

export function PlatformHero({ platformName, description, actionSlot }: PlatformHeroProps) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        CodeBay Platform
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{platformName}</h1>
      <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{description}</p>
      {actionSlot ? <div className="mt-6">{actionSlot}</div> : null}
    </section>
  );
}

export { AppHeader } from "./AppHeader";
export type { AppHeaderProps, AppHeaderMenuItem } from "./AppHeader";
export { CodeBayLogo } from "./CodeBayLogo";
export { AuthEmailPasswordForm } from "./AuthEmailPasswordForm";
export type { AuthEmailPasswordFormProps } from "./AuthEmailPasswordForm";
export { SurfaceCard } from "./SurfaceCard";
export { SiteFooter } from "./SiteFooter";
export type { SiteFooterProps, SiteFooterLinkItem } from "./SiteFooter";
